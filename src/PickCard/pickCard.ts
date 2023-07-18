import { Socket } from "socket.io";
import { CONSTANTS } from "../Constants";
import { PickCardInterface } from "../Interface/PickCard/PickCardInterface";
import { Logger } from "../Logger/logger";
import { ApplyLock, RemoveLock } from "../Connection/redlock";
import { GetTable, GetUserInTable, SetTable, SetUserInTable } from "../GameRedisOperations/gameRedisOperations";
import { TableInterface } from "../Interface/Table/TableInterface";
import { EventEmitter } from "../Connection/emitter";
import { BullTimer } from "../BullTimer";
import { UserInTableInterface } from "../Interface/UserInTable/UserInTableInterface";
import { ChangeUserTurn } from "../ChangeUserTurn/changeUserTurn";
import { PickCardResInterface } from "../Interface/PickCardRes/PickCardResInterface";
import { GAME_ACTIONS } from "../GameActions";
import { ThrowCard } from "../ThrowCard/throwCard";

const PickCard = async (en: string, socket: any, Data: PickCardInterface) => {
    // const PickCard = async (en: string, socket: Socket, Data: PickCardInterface) => {

    const Path = 'PickCard';

    const { PICK_CARD, ERROR_POPUP } = CONSTANTS.EVENTS_NAME;
    const { LOCK, TABLES } = CONSTANTS.REDIS_COLLECTION;

    const TablelockId = `${LOCK}:${TABLES}:${Data?.tableId}`;

    const Tablelock = await ApplyLock(Path, TablelockId);

    try {

        Logger("PickCard", JSON.stringify({ Data }));

        let TableDetails: TableInterface = await GetTable(Data?.tableId);

        let pickCards: Array<string> = [];

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        if (TableDetails.isTurnLock) {
            return EventEmitter.emit(ERROR_POPUP, { en: ERROR_POPUP, SocketId: socket.id, Data: { Message: CONSTANTS.ERROR_MESSAGES.WAIT_FOR_TURN_INFO } });
        };

        if (TableDetails.currentTurn !== Data?.seatIndex) {
            return EventEmitter.emit(ERROR_POPUP, { en: ERROR_POPUP, SocketId: socket.id, Data: { Message: CONSTANTS.ERROR_MESSAGES.NOT_YOUR_TURN } });
        };

        const UserAvailableInTable = TableDetails.playersArray.find(e => { return e.userId === Data?.userId });

        if (!UserAvailableInTable) {
            return EventEmitter.emit(ERROR_POPUP, { en: ERROR_POPUP, SocketId: socket.id, Data: { Message: CONSTANTS.ERROR_MESSAGES.WRONG_TABLE } });
        };

        let UserInTableDetails: UserInTableInterface = await GetUserInTable(Data?.userId);

        if (!UserInTableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_IN_TABLE_NOT_FOUND) };

        if (UserInTableDetails.lastPickCard !== '') {
            return EventEmitter.emit(ERROR_POPUP, { en: ERROR_POPUP, SocketId: socket.id, Data: { Message: CONSTANTS.ERROR_MESSAGES.CAN_NOT_ABLE_TO_PICK_CARD } });
        };

        let isPlayableCard = false;

        if (TableDetails.numberOfCardToPick === 0) {

            // if (TableDetails.closeCardDeck.length < 1) { throw new Error(CONSTANTS.ERROR_MESSAGES.NOT_ENOUGH_CARDS) };

            if (TableDetails.closeCardDeck.length) {

                pickCards.push(TableDetails.closeCardDeck[0]);

                const PickCardColor = TableDetails.closeCardDeck[0].split("-")[0];
                const PickCardType = TableDetails.closeCardDeck[0].split("-")[1];

                if (

                    (pickCards[0].split("-")[1] === TableDetails.activeCardType || pickCards[0].split("-")[0] === TableDetails.activeCardColor) ||

                    (PickCardColor === CONSTANTS.UNO_CARDS.CARDS_TYPE.WILD_CARD && PickCardType === CONSTANTS.UNO_CARDS.CARDS_TYPE.PLUS_FOUR) ||

                    (PickCardType === CONSTANTS.UNO_CARDS.CARDS_TYPE.COLOR_CHANGE)

                ) {

                    isPlayableCard = true;

                    UserInTableDetails.lastPickCard = pickCards[0];

                };

                TableDetails.closeCardDeck.splice(0, 1);

                UserInTableDetails.cardArray.push(pickCards[0]);

            };

        } else {

            for (let i = 0; i < TableDetails.numberOfCardToPick; i++) {

                // if (TableDetails.closeCardDeck.length < 1) { throw new Error(CONSTANTS.ERROR_MESSAGES.NOT_ENOUGH_CARDS) };

                if (TableDetails.closeCardDeck.length) {

                    UserInTableDetails.cardArray.push(TableDetails.closeCardDeck[0]);

                    pickCards.push(TableDetails.closeCardDeck[0]);

                    TableDetails.closeCardDeck.splice(0, 1);

                };
            };

            // TableDetails.numberOfCardToPick = 0;

        };

        UserInTableDetails.isUnoClick = false;

        await SetUserInTable(UserInTableDetails.userId, UserInTableDetails);

        await SetTable(TableDetails.tableId, TableDetails);

        const PickCardResData: PickCardResInterface = { ...Data, pickCards, isPlayableCard };

        EventEmitter.emit(PICK_CARD, { en: PICK_CARD, RoomId: TableDetails.tableId, Data: PickCardResData });

        if (!isPlayableCard) {

            await BullTimer.CancelJob.CancelUserTurn(TableDetails.tableId, TableDetails.currentTurn);

            await ChangeUserTurn(TableDetails.tableId, false, true, 0);

        }else if(UserAvailableInTable.isBot && isPlayableCard){

            const Fake_Data = {

                card:UserInTableDetails.lastPickCard, //playableCard,
                cardType:UserInTableDetails.lastPickCard.split('-')[1], //playableCard.split('-')[1],
                cardColor:UserInTableDetails.lastPickCard.split('-')[0], //playableCard.split('-')[0],
                cardIndex: 0,

                userId: UserInTableDetails.userId,
                tableId: UserInTableDetails.tableId,
                seatIndex: UserInTableDetails.seatIndex

            };
            if(UserInTableDetails.lastPickCard.slice(0, 4) === "W-CH" || UserInTableDetails.lastPickCard.slice(1, 6) === "-D4C-"){
                let resRedCards = UserInTableDetails.cardArray.filter(item => new RegExp("R-" , 'i').test(item));
                let resGreenCards = UserInTableDetails.cardArray.filter(item => new RegExp("G-" , 'i').test(item));
                let resYelloCards = UserInTableDetails.cardArray.filter(item => new RegExp("Y-" , 'i').test(item));
                let resBlueCards = UserInTableDetails.cardArray.filter(item => new RegExp("B-" , 'i').test(item));
                if(resRedCards.length === 0){
                    Fake_Data.cardColor = "R";
                }else if(resGreenCards.length === 0){
                    Fake_Data.cardColor = "G";
                }else if(resYelloCards.length === 0){
                    Fake_Data.cardColor = "Y";
                }else if(resBlueCards.length === 0){
                    Fake_Data.cardColor = "B";
                }
            }

            await ThrowCard('THROW_CARD', socket, Fake_Data);
        }

    } catch (error: any) {

        Logger('PickCard Error : ', error);

    } finally {

        await RemoveLock(Path, Tablelock);

    };
};

export { PickCard };
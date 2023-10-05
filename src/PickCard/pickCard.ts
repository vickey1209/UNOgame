import { Socket } from "socket.io";
import { CONSTANTS } from "../Constants";
import { PickCardInterface } from "../Interface/PickCard/PickCardInterface";
import { ErrorLogger, Logger } from "../Logger/logger";
import { ApplyLock, RemoveLock } from "../Connection/redlock";
import { GetTable, GetUserInTable, SetTable, SetUserInTable } from "../GameRedisOperations/gameRedisOperations";
import { EventEmitter } from "../Connection/emitter";
import { BullTimer } from "../BullTimer";
import { ChangeUserTurn } from "../ChangeUserTurn/changeUserTurn";
import { PickCardResInterface } from "../Interface/PickCardRes/PickCardResInterface";
import { GAME_ACTIONS } from "../GameActions";
import { ThrowCard } from "../ThrowCard/throwCard";
import { findPointAndColorWiseCards } from "../Bot/findPointAndColorWiseCards";

const PickCard = async (en: string, socket: any, Data: PickCardInterface) => {
    // const PickCard = async (en: string, socket: Socket, Data: PickCardInterface) => {

    const Path = 'PickCard';

    const { PICK_CARD, ERROR_POPUP } = CONSTANTS.EVENTS_NAME;
    const { LOCK, TABLES } = CONSTANTS.REDIS_COLLECTION;

    const userId = socket.handshake.auth?.userId;
    const tableId = socket.handshake.auth?.tableId;
    const seatIndex = socket.handshake.auth?.seatIndex;

    const TablelockId = `${LOCK}:${TABLES}:${tableId}`;

    const Tablelock = await ApplyLock(Path, TablelockId);

    try {

        await Logger("PickCard", JSON.stringify({ Data, SocketData: socket.handshake.auth }));

        let TableDetails = await GetTable(tableId);

        let pickCards: Array<string> = [], isPlayableCard = false;

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        if (TableDetails.isWinning) { throw new Error(CONSTANTS.ERROR_MESSAGES.WINNING_DONE) };

        if (TableDetails.isScoreScreen) { throw new Error(CONSTANTS.ERROR_MESSAGES.ROUND_SCORE_DONE) };

        if (TableDetails.isTurnLock) {
            return EventEmitter.emit(ERROR_POPUP, { en: ERROR_POPUP, SocketId: socket.id, Data: { Message: CONSTANTS.ERROR_MESSAGES.WAIT_FOR_TURN_INFO } });
        };

        if (TableDetails.currentTurn !== seatIndex) {
            return EventEmitter.emit(ERROR_POPUP, { en: ERROR_POPUP, SocketId: socket.id, Data: { Message: CONSTANTS.ERROR_MESSAGES.NOT_YOUR_TURN } });
        };

        const UserAvailableInTable = TableDetails.playersArray.find(e => { return e.userId === userId });

        if (!UserAvailableInTable) {
            return EventEmitter.emit(ERROR_POPUP, { en: ERROR_POPUP, SocketId: socket.id, Data: { Message: CONSTANTS.ERROR_MESSAGES.WRONG_TABLE } });
        };

        let UserInTableDetails = await GetUserInTable(TableDetails.tableId, userId);

        if (!UserInTableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_IN_TABLE_NOT_FOUND) };

        if (UserInTableDetails.lastPickCard !== '') {
            return EventEmitter.emit(ERROR_POPUP, { en: ERROR_POPUP, SocketId: socket.id, Data: { Message: CONSTANTS.ERROR_MESSAGES.CAN_NOT_ABLE_TO_PICK_CARD } });
        };

        if (TableDetails.numberOfCardToPick === 0) {

            if (TableDetails.closeCardDeck.length) {

                pickCards.push(TableDetails.closeCardDeck[0]);

                const PickCardColor = TableDetails.closeCardDeck[0].split("-")[0];
                const PickCardType = TableDetails.closeCardDeck[0].split("-")[1];

                if (

                    (pickCards[0].split("-")[1] === TableDetails.activeCardType || pickCards[0].split("-")[0] === TableDetails.activeCardColor) ||

                    (PickCardColor === CONSTANTS.UNO_CARDS.CARDS_TYPE.WILD_CARD && PickCardType === CONSTANTS.UNO_CARDS.CARDS_TYPE.PLUS_FOUR) ||

                    (PickCardType === CONSTANTS.UNO_CARDS.CARDS_TYPE.COLOR_CHANGE && TableDetails.numberOfCardToPick === 0)

                ) {

                    isPlayableCard = true;

                    UserInTableDetails.lastPickCard = pickCards[0];

                };

                TableDetails.closeCardDeck.splice(0, 1);

                // UserInTableDetails.cardArray.push(pickCards[0]);

            };

        } else {

            for (let i = 0; i < TableDetails.numberOfCardToPick; i++) {

                if (TableDetails.closeCardDeck.length) {

                    // UserInTableDetails.cardArray.push(TableDetails.closeCardDeck[0]);

                    pickCards.push(TableDetails.closeCardDeck[0]);

                    TableDetails.closeCardDeck.splice(0, 1);

                };
            };

        };

        UserInTableDetails.isUnoClick = false;

        await SetUserInTable(TableDetails.tableId, UserInTableDetails.userId, UserInTableDetails);

        await SetTable(TableDetails.tableId, TableDetails);

        const PickCardResData: PickCardResInterface = { ...Data, pickCards, isPlayableCard };

        // EventEmitter.emit(PICK_CARD, { en: PICK_CARD, RoomId: TableDetails.tableId, Data: PickCardResData });

        await BullTimer.AddJob.PickCardDelay(TableDetails.tableId, 0, PickCardResData);

        if (!isPlayableCard) {

            await BullTimer.CancelJob.CancelUserTurn(TableDetails.tableId, TableDetails.currentTurn);

            await ChangeUserTurn(TableDetails.tableId, false, true, 0);

        } else if (UserAvailableInTable.isBot && isPlayableCard) {

            const Fake_Data = {
                card: UserInTableDetails.lastPickCard, //playableCard,
                cardType: UserInTableDetails.lastPickCard.split('-')[1], //playableCard.split('-')[1],
                cardColor: UserInTableDetails.lastPickCard.split('-')[0], //playableCard.split('-')[0],
                cardIndex: 0,
                userId: UserInTableDetails.userId,
                tableId: TableDetails.tableId,
                seatIndex: UserInTableDetails.seatIndex

            };
            if (UserInTableDetails.lastPickCard.slice(0, 4) === "W-CH" || UserInTableDetails.lastPickCard.slice(1, 6) === "-D4C-") {
                let color_array = ["R", "G", "Y", "B"];
                let color_index = await GAME_ACTIONS.RandomNumber(0, color_array.length - 1);

                color_index = await findPointAndColorWiseCards(UserInTableDetails.cardArray, color_index, UserInTableDetails.tableId)

                Fake_Data.cardColor = color_array[color_index];
            }
            await BullTimer.AddJob.BotCardThrow({ eventName: "THROW_CARD", socket, delayNumber: 2, Fake_Data })
        }

    } catch (error: any) {

        await ErrorLogger('PickCard Error : ', error);

    } finally {

        await RemoveLock(Path, Tablelock);

    };
};

export { PickCard };
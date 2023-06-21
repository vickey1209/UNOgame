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

const PickCard = async (en: string, socket: Socket, Data: PickCardInterface) => {

    const Path = 'PickCard';

    const { PICK_CARD, ERROR } = CONSTANTS.EVENTS_NAME;
    const { LOCK, TABLES } = CONSTANTS.REDIS_COLLECTION;

    const TablelockId = `${LOCK}:${TABLES}:${Data?.tableId}`;

    const Tablelock = await ApplyLock(Path, TablelockId);

    try {

        Logger("PickCard", JSON.stringify({ Data }));

        let TableDetails: TableInterface = await GetTable(Data?.tableId);

        let pickCards: Array<string> = [], isGameEnd = false;

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        if (TableDetails.currentTurn !== Data?.seatIndex) {
            return EventEmitter.emit(ERROR, { en: ERROR, SocketId: socket.id, Data: { Message: CONSTANTS.ERROR_MESSAGES.NOT_YOUR_TURN } });
        };

        const UserAvailableInTable = TableDetails.playersArray.find(e => { return e.userId === Data?.userId });

        if (!UserAvailableInTable) {
            return EventEmitter.emit(ERROR, { en: ERROR, SocketId: socket.id, Data: { Message: CONSTANTS.ERROR_MESSAGES.WRONG_TABLE } });
        };

        let UserInTableDetails: UserInTableInterface = await GetUserInTable(Data?.userId);

        if (!UserInTableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_IN_TABLE_NOT_FOUND) };

        let isPlayableCard = false;

        if (TableDetails.numberOfCardToPick === 0) {

            if (TableDetails.closeCardDeck.length < 1) { throw new Error(CONSTANTS.ERROR_MESSAGES.NOT_ENOUGH_CARDS) };

            // if (TableDetails.closeCardDeck.length < 1) {

            //     const FillCloseDeckData = await FillCloseDeck(TableDetails);

            //     if (!FillCloseDeckData?.sufficientCard) {

            //         isGameEnd = true;

            //     } else {



            //     };
            // };

            pickCards.push(TableDetails.closeCardDeck[0]);

            if (pickCards[0].split("-")[1] === TableDetails.activeCardType || pickCards[0].split("-")[0] === TableDetails.activeCardColor) {

                isPlayableCard = true;

                UserInTableDetails.lastPickCard = pickCards[0];

            };

            TableDetails.closeCardDeck.splice(0, 1);

            UserInTableDetails.cardArray.push(pickCards[0]);

        } else {

            for (let i = 0; i < TableDetails.numberOfCardToPick; i++) {

                if (TableDetails.closeCardDeck.length < 1) { throw new Error(CONSTANTS.ERROR_MESSAGES.NOT_ENOUGH_CARDS) };

                UserInTableDetails.cardArray.push(TableDetails.closeCardDeck[0]);

                pickCards.push(TableDetails.closeCardDeck[0]);

                TableDetails.closeCardDeck.splice(0, 1);

            }

            TableDetails.numberOfCardToPick = 0;

        };

        await SetUserInTable(UserInTableDetails.userId, UserInTableDetails);

        await SetTable(TableDetails.tableId, TableDetails);

        const ResData: PickCardResInterface = { ...Data, pickCards, isPlayableCard };

        EventEmitter.emit(PICK_CARD, { en: PICK_CARD, RoomId: TableDetails.tableId, Data: ResData });

        if (!isPlayableCard) {

            await BullTimer.CancelJob.CancelUserTurn(TableDetails.tableId, TableDetails.currentTurn);

            await ChangeUserTurn(TableDetails.tableId, false);

        };

    } catch (error: any) {

        Logger('PickCard Error : ', error);

    } finally {

        await RemoveLock(Path, Tablelock);

    };
};

const FillCloseDeck = async (TableDetails: TableInterface) => {

    try {

        Logger("FillCloseDeck", JSON.stringify({ TableDetails }));

        console.log({ TableDetails });

        let sufficientCard = true;

        if (TableDetails.openCardDeck.length < 1) {
            sufficientCard = false;
            console.log('FillCloseDeck > TableDetails.openCardDeck.length < 1');
        };

        let [OneCard, ...OtherCloseDeckCards] = TableDetails.openCardDeck;

        if (OtherCloseDeckCards.length < 1) {
            sufficientCard = false;
            console.log('FillCloseDeck > OtherCloseDeckCards.length < 1');
        };

        console.log({ sufficientCard });

        OtherCloseDeckCards = await GAME_ACTIONS.ShuffleArray(OtherCloseDeckCards);

        return { sufficientCard, OtherCloseDeckCards };

    } catch (error: any) {
        Logger('FillCloseDeck Error : ', error);
    };
}

export { PickCard };
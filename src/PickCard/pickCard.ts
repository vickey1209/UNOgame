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

const PickCard = async (en: string, socket: Socket, Data: PickCardInterface) => {

    const Path = 'PickCard';

    const { PICK_CARD, ERROR } = CONSTANTS.EVENTS_NAME;
    const { LOCK, TABLES } = CONSTANTS.REDIS_COLLECTION;

    const TablelockId = `${LOCK}:${TABLES}:${Data?.tableId}`;

    const Tablelock = await ApplyLock(Path, TablelockId);

    try {

        Logger("PickCard", JSON.stringify({ Data }));

        let TableDetails: TableInterface = await GetTable(Data?.tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        if (TableDetails.currentTurn !== Data?.seatIndex) {
            return EventEmitter.emit(ERROR, { en: ERROR, SocketId: socket.id, Data: { Message: CONSTANTS.ERROR_MESSAGES.NOT_YOUR_TURN } });
        }

        const UserAvailableInTable = TableDetails.playersArray.find(e => { return e.userId === Data?.userId });

        if (!UserAvailableInTable) {
            return EventEmitter.emit(ERROR, { en: ERROR, SocketId: socket.id, Data: { Message: CONSTANTS.ERROR_MESSAGES.WRONG_TABLE } });
        }

        let UserInTableDetails: UserInTableInterface = await GetUserInTable(Data?.userId);

        if (!UserInTableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_IN_TABLE_NOT_FOUND) };

        if (TableDetails.closeCardDeck.length < 1) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_IN_TABLE_NOT_FOUND) };

        let isPlayableCard = false;

        const PickCardsFromCloseDeck = TableDetails.closeCardDeck[0];

        if (PickCardsFromCloseDeck.split("-")[1] === TableDetails.activeCardType || PickCardsFromCloseDeck.split("-")[0] === TableDetails.activeCardColor) {

            isPlayableCard = true;

            UserInTableDetails.lastPickCard = PickCardsFromCloseDeck;

        };

        TableDetails.closeCardDeck.splice(0, 1);

        UserInTableDetails.cardArray.push(PickCardsFromCloseDeck);

        await SetUserInTable(UserInTableDetails.userId, UserInTableDetails);

        await SetTable(TableDetails.tableId, TableDetails);

        const ResData = { ...Data, pickCard: [PickCardsFromCloseDeck], isPlayableCard };

        EventEmitter.emit(PICK_CARD, { en: PICK_CARD, RoomId: TableDetails.tableId, Data: ResData });

        if (!isPlayableCard) {

            await BullTimer.CancelJob.CancelUserTurn(TableDetails.tableId, TableDetails.currentTurn);

            await ChangeUserTurn(TableDetails.tableId);

        };

    } catch (error: any) {

        Logger('PickCard Error : ', error);

    } finally {

        await RemoveLock(Path, Tablelock);

    };
};

export { PickCard };
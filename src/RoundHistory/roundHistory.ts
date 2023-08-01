import { Socket } from "socket.io";
import { Logger } from "../Logger/logger";
import { CONSTANTS } from "../Constants";
import { ApplyLock, RemoveLock } from "../Connection/redlock";
import { RoundHistoryInterface } from "../Interface/RoundHistory/RoundHistoryInterface";
import { TableInterface } from "../Interface/Table/TableInterface";
import { GetRoundHistory, GetTable, GetUserInTable } from "../GameRedisOperations/gameRedisOperations";
import { EventEmitter } from "../Connection/emitter";
import { UserInTableInterface } from "../Interface/UserInTable/UserInTableInterface";

const RoundHistory = async (en: string, socket: Socket, Data: RoundHistoryInterface) => {

    const Path = 'RoundHistory';

    const { ERROR_POPUP, ROUND_HISTORY } = CONSTANTS.EVENTS_NAME;
    const { LOCK, TABLES } = CONSTANTS.REDIS_COLLECTION;

    const userId = socket.handshake.auth?.userId;
    const tableId = socket.handshake.auth?.tableId;

    const TablelockId = `${LOCK}:${TABLES}:${tableId}`;

    const Tablelock = await ApplyLock(Path, TablelockId);

    try {

        await Logger("RoundHistory", JSON.stringify({ Data, SocketData: socket.handshake.auth }));

        let TableDetails: TableInterface = await GetTable(tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        const UserAvailableInTable = TableDetails.playersArray.find(e => { return e.userId === userId });

        if (!UserAvailableInTable) {
            return EventEmitter.emit(ERROR_POPUP, { en: ERROR_POPUP, SocketId: socket.id, Data: { Message: CONSTANTS.ERROR_MESSAGES.WRONG_TABLE } });
        };

        let UserInTableDetails: UserInTableInterface = await GetUserInTable(userId);

        if (!UserInTableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_IN_TABLE_NOT_FOUND) };

        const RoundHistoryDetails = await GetRoundHistory(TableDetails.tableId);

        if (RoundHistoryDetails.length) { EventEmitter.emit(ROUND_HISTORY, { en: ROUND_HISTORY, SocketId: socket.id, Data: { allRoundScore: RoundHistoryDetails } }); }
        else { EventEmitter.emit(ERROR_POPUP, { en: ERROR_POPUP, SocketId: socket.id, Data: { Message: CONSTANTS.ERROR_MESSAGES.ROUND_HISTORY_ERROR } }); };

        // if (RoundHistoryDetails.length) { EventEmitter.emit(ROUND_HISTORY, { en: ROUND_HISTORY, SocketId: socket.id, Data: { isHistoryAvailable: true } }); }
        // else { EventEmitter.emit(ERROR_POPUP, { en: ERROR_POPUP, SocketId: socket.id, Data: { Message: CONSTANTS.ERROR_MESSAGES.ROUND_HISTORY_ERROR } }); };

    } catch (error: any) {

        await Logger('RoundHistory Error : ', error);

    } finally {

        await RemoveLock(Path, Tablelock);

    };
};

export { RoundHistory };
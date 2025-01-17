import { Socket } from "socket.io";
import { ErrorLogger, Logger } from "../Logger/logger";
import { CONSTANTS } from "../Constants";
import { ApplyLock, RemoveLock } from "../Connection/redlock";
import { RoundHistoryInterface } from "../Interface/RoundHistory/RoundHistoryInterface";
import { GetRoundHistory, GetTable, GetUserInTable } from "../GameRedisOperations/gameRedisOperations";
import { EventEmitter } from "../Connection/emitter";

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

        let TableDetails = await GetTable(tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        if (TableDetails.isWinning) { throw new Error(CONSTANTS.ERROR_MESSAGES.WINNING_DONE) };

        if (TableDetails.isScoreScreen) { throw new Error(CONSTANTS.ERROR_MESSAGES.ROUND_SCORE_DONE) };

        const UserAvailableInTable = TableDetails.playersArray.find(e => { return e.userId === userId });

        if (!UserAvailableInTable) {
            return EventEmitter.emit(ERROR_POPUP, { en: ERROR_POPUP, SocketId: socket.id, Data: { Message: CONSTANTS.ERROR_MESSAGES.WRONG_TABLE } });
        };

        let UserInTableDetails = await GetUserInTable(TableDetails.tableId, userId);

        if (!UserInTableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_IN_TABLE_NOT_FOUND) };

        const RoundHistoryDetails = await GetRoundHistory(TableDetails.tableId);

        if (RoundHistoryDetails.length) { EventEmitter.emit(ROUND_HISTORY, { en: ROUND_HISTORY, SocketId: socket.id, Data: { allRoundScore: RoundHistoryDetails } }); }
        else { EventEmitter.emit(ERROR_POPUP, { en: ERROR_POPUP, SocketId: socket.id, Data: { Message: CONSTANTS.ERROR_MESSAGES.ROUND_HISTORY_ERROR } }); };

    } catch (error: any) {

        await ErrorLogger('RoundHistory Error : ', error);

    } finally {

        await RemoveLock(Path, Tablelock);

    };
};

export { RoundHistory };
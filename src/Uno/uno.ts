import { Socket } from "socket.io";
import { ErrorLogger, Logger } from "../Logger/logger";
import { ApplyLock, RemoveLock } from "../Connection/redlock";
import { CONSTANTS } from "../Constants";
import { GetTable, GetUserInTable, SetUserInTable } from "../GameRedisOperations/gameRedisOperations";
import { EventEmitter } from "../Connection/emitter";
import { UnoInterface } from "../Interface/Uno/UnoInterface";
import { GAME_ACTIONS } from "../GameActions";
import { BullTimer } from "../BullTimer";

const Uno = async (en: string, socket: any, Data: UnoInterface) => {

    const Path = 'Uno';

    const { ERROR_POPUP, UNO } = CONSTANTS.EVENTS_NAME;
    const { LOCK, TABLES } = CONSTANTS.REDIS_COLLECTION;

    const userId = socket.handshake.auth?.userId;
    const tableId = socket.handshake.auth?.tableId;
    const seatIndex = socket.handshake.auth?.seatIndex;

    const TablelockId = `${LOCK}:${TABLES}:${tableId}`;

    const Tablelock = await ApplyLock(Path, TablelockId);

    try {

        await Logger("Uno", JSON.stringify({ Data, SocketData: socket.handshake.auth }));

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

        const isThrowPossibleData = await GAME_ACTIONS.IsThrowPossible(UserInTableDetails, TableDetails);

        if (isThrowPossibleData === undefined) { throw new Error(CONSTANTS.ERROR_MESSAGES.IS_POSSIBLE_THROW_ERROR); };

        if (TableDetails.currentTurn !== seatIndex) {
            return EventEmitter.emit(ERROR_POPUP, { en: ERROR_POPUP, SocketId: socket.id, Data: { Message: CONSTANTS.ERROR_MESSAGES.NOT_YOUR_TURN } });
        };

        if (

            ((UserInTableDetails.cardArray.length > 2) || (!isThrowPossibleData?.isThrowPossible && UserInTableDetails.cardArray.length === 2)) &&
            (UserInTableDetails.cardArray.length !== 1)

        ) {
            return EventEmitter.emit(ERROR_POPUP, { en: ERROR_POPUP, SocketId: socket.id, Data: { Message: CONSTANTS.ERROR_MESSAGES.UNO_NOT_POSSIBLE } });
        };

        const UserTurnJob = await BullTimer.CheckJob.CheckUserTurn(tableId, TableDetails.currentTurn);

        let isUnoAvailable = false;

        if (

            (TableDetails.currentTurn === seatIndex && UserInTableDetails.cardArray.length === 2 && UserTurnJob && !TableDetails.isTurnLock) ||
            (TableDetails.currentTurn === seatIndex && UserInTableDetails.cardArray.length === 1 && !UserTurnJob && TableDetails.isTurnLock)

        ) {
            isUnoAvailable = true;
        };

        if (!isUnoAvailable) {
            return EventEmitter.emit(ERROR_POPUP, { en: ERROR_POPUP, SocketId: socket.id, Data: { Message: CONSTANTS.ERROR_MESSAGES.WAIT_FOR_TURN_INFO } });
        };

        if (UserInTableDetails.isUnoClick) {
            return EventEmitter.emit(ERROR_POPUP, { en: ERROR_POPUP, SocketId: socket.id, Data: { Message: CONSTANTS.ERROR_MESSAGES.ALREADY_CLICKED_UNO } });
        };

        UserInTableDetails.isUnoClick = true;

        await SetUserInTable(TableDetails.tableId, UserInTableDetails.userId, UserInTableDetails);

        EventEmitter.emit(UNO, { en: UNO, RoomId: TableDetails.tableId, Data });

    } catch (error: any) {

        await ErrorLogger('Uno Error : ', error);

    } finally {

        await RemoveLock(Path, Tablelock);

    };
};

export { Uno };
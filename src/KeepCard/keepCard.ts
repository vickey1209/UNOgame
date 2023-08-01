import { Socket } from "socket.io";
import { Logger } from "../Logger/logger";
import { CONSTANTS } from "../Constants";
import { ApplyLock, RemoveLock } from "../Connection/redlock";
import { TableInterface } from "../Interface/Table/TableInterface";
import { GetTable, GetUserInTable, SetUserInTable } from "../GameRedisOperations/gameRedisOperations";
import { EventEmitter } from "../Connection/emitter";
import { UserInTableInterface } from "../Interface/UserInTable/UserInTableInterface";
import { ChangeUserTurn } from "../ChangeUserTurn/changeUserTurn";
import { KeepCardInterface } from "../Interface/KeepCard/KeepCardInterface";
import { BullTimer } from "../BullTimer";

const KeepCard = async (en: string, socket: Socket, Data: KeepCardInterface) => {

    const Path = 'KeepCard';

    const { ERROR_POPUP } = CONSTANTS.EVENTS_NAME;
    const { LOCK, TABLES } = CONSTANTS.REDIS_COLLECTION;

    const userId = socket.handshake.auth?.userId;
    const tableId = socket.handshake.auth?.tableId;
    const seatIndex = socket.handshake.auth?.seatIndex;

    const TablelockId = `${LOCK}:${TABLES}:${tableId}`;

    const Tablelock = await ApplyLock(Path, TablelockId);

    try {

        await Logger("KeepCard", JSON.stringify({ Data, SocketData: socket.handshake.auth }));

        let TableDetails: TableInterface = await GetTable(tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

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

        let UserInTableDetails: UserInTableInterface = await GetUserInTable(userId);

        if (!UserInTableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_IN_TABLE_NOT_FOUND) };

        if (UserInTableDetails.lastPickCard === '') {
            return EventEmitter.emit(ERROR_POPUP, { en: ERROR_POPUP, SocketId: socket.id, Data: { Message: CONSTANTS.ERROR_MESSAGES.KEEP_ERROR } });
        };

        UserInTableDetails.lastPickCard = '';
        UserInTableDetails.isUnoClick = false;

        await SetUserInTable(UserInTableDetails.userId, UserInTableDetails);

        await BullTimer.CancelJob.CancelUserTurn(TableDetails.tableId, TableDetails.currentTurn);

        await ChangeUserTurn(TableDetails.tableId, false, false, 0);

    } catch (error: any) {

        await Logger('KeepCard Error : ', error);

    } finally {

        await RemoveLock(Path, Tablelock);

    };
};

export { KeepCard };
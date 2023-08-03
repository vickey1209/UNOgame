import { Socket } from "socket.io";
import { ErrorLogger, Logger } from "../Logger/logger";
import { ApplyLock, RemoveLock } from "../Connection/redlock";
import { CONSTANTS } from "../Constants";
import { TableInterface } from "../Interface/Table/TableInterface";
import { GetTable, GetUserInTable, SetUserInTable } from "../GameRedisOperations/gameRedisOperations";
import { EventEmitter } from "../Connection/emitter";
import { UserInTableInterface } from "../Interface/UserInTable/UserInTableInterface";
import { UnoInterface } from "../Interface/Uno/UnoInterface";

const Uno = async (en: string, socket: Socket, Data: UnoInterface) => {

    const Path = 'Uno';

    const { ERROR_POPUP, UNO } = CONSTANTS.EVENTS_NAME;
    const { LOCK, TABLES } = CONSTANTS.REDIS_COLLECTION;

    const userId = socket.handshake.auth?.userId;
    const tableId = socket.handshake.auth?.tableId;

    const TablelockId = `${LOCK}:${TABLES}:${tableId}`;

    const Tablelock = await ApplyLock(Path, TablelockId);

    try {

        await Logger("Uno", JSON.stringify({ Data, SocketData: socket.handshake.auth }));

        let TableDetails: TableInterface = await GetTable(tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        const UserAvailableInTable = TableDetails.playersArray.find(e => { return e.userId === userId });

        if (!UserAvailableInTable) {
            return EventEmitter.emit(ERROR_POPUP, { en: ERROR_POPUP, SocketId: socket.id, Data: { Message: CONSTANTS.ERROR_MESSAGES.WRONG_TABLE } });
        };

        let UserInTableDetails: UserInTableInterface = await GetUserInTable(userId);

        if (!UserInTableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_IN_TABLE_NOT_FOUND) };

        if (UserInTableDetails.cardArray.length !== 1) {
            return EventEmitter.emit(ERROR_POPUP, { en: ERROR_POPUP, SocketId: socket.id, Data: { Message: CONSTANTS.ERROR_MESSAGES.UNO_NOT_POSSIBLE } });
        };

        if (UserInTableDetails.isUnoClick) {
            return EventEmitter.emit(ERROR_POPUP, { en: ERROR_POPUP, SocketId: socket.id, Data: { Message: CONSTANTS.ERROR_MESSAGES.ALREADY_CLICKED_UNO } });
        };

        UserInTableDetails.isUnoClick = true;

        await SetUserInTable(UserInTableDetails.userId, UserInTableDetails);

        EventEmitter.emit(UNO, { en: UNO, RoomId: TableDetails.tableId, Data });

    } catch (error: any) {

        await ErrorLogger('Uno Error : ', error);

    } finally {

        await RemoveLock(Path, Tablelock);

    };
};

export { Uno };
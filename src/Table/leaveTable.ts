import { Socket } from "socket.io";
import { Logger } from "../Logger/logger";
import { CONSTANTS } from "../Constants";
import { ApplyLock, RemoveLock } from "../Connection/redlock";
import { DeleteEmptyTable, DeleteTable, DeleteUserInTable, GetTable, GetUser, GetUserInTable, SetTable, SetUser } from "../GameRedisOperations/gameRedisOperations";
import { SignUpInterface } from "../Interface/SignUp/SignUpInterface";
import { TableInterface } from "../Interface/Table/TableInterface";
import { UserInTableInterface } from "../Interface/UserInTable/UserInTableInterface";
import { EventEmitter } from "../Connection/emitter";
import { io } from "../Connection/socket";
import { LeaveRoom } from "../SocketRooms/leaveRoom";
import { BullTimer } from "../BullTimer";
import { ChangeUserTurn } from "../ChangeUserTurn/changeUserTurn";
import { LeaveTableInterface } from "../Interface/LeaveTable/LeaveTableInterface";
import { Win } from "../Win/win";

const LeaveTable = async (en: string, socket: Socket, Data: LeaveTableInterface) => {

    const Path = 'LeaveTable';

    // const userId = socket.handshake.auth?.userId;
    // const tableId = socket.handshake.auth?.tableId;
    const playerCount = socket.handshake.auth?.playerCount;
    const bootValue = socket.handshake.auth?.bootValue;

    const { LOCK, EMPTY_TABLE, TABLES } = CONSTANTS.REDIS_COLLECTION;

    const TablelockId = `${LOCK}:${TABLES}:${Data?.tableId}`;
    const MatchMakingId = `${LOCK}:${EMPTY_TABLE}:${bootValue}:${playerCount}`;

    const Tablelock = await ApplyLock(Path, TablelockId);
    const MatchMakingLock = await ApplyLock(Path, MatchMakingId);

    try {

        Logger("LeaveTable", JSON.stringify({ Data }));

        const { userId, tableId } = Data;

        await RemoveUserFromTable(userId, tableId);

    } catch (error: any) {

        Logger('LeaveTable Error : ', error);

    } finally {

        await RemoveLock(Path, Tablelock);
        await RemoveLock(Path, MatchMakingLock);

    };
};

const RemoveUserFromTable = async (userId: string, tableId: string) => {

    try {

        Logger("RemoveUserFromTable", JSON.stringify({ userId, tableId }));

        const { LEAVE_TABLE, ERROR_POPUP } = CONSTANTS.EVENTS_NAME;

        let UserDetails: SignUpInterface = await GetUser(userId);

        if (!UserDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_NOT_FOUND) };

        let TableDetails: TableInterface = await GetTable(tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        const UserAvailableInTable = TableDetails.playersArray.find(e => { return e.userId === userId });

        if (!UserAvailableInTable) { throw new Error(CONSTANTS.ERROR_MESSAGES.WRONG_TABLE) };

        let UserInTableDetails: UserInTableInterface = await GetUserInTable(userId);

        if (!UserInTableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_IN_TABLE_NOT_FOUND) };

        if (TableDetails.isLeaveLock || TableDetails.isWinning) {
            return EventEmitter.emit(ERROR_POPUP, { en: ERROR_POPUP, SocketId: UserDetails.socketId, Data: { Message: CONSTANTS.ERROR_MESSAGES.CAN_NOT_ABLE_TO_LEAVE } });
        };

        if (!TableDetails.isGameStart) {

            const PlayerIndexInArray = TableDetails.playersArray.findIndex((e) => { return e.userId === userId });

            TableDetails.playersArray.splice(PlayerIndexInArray, 1);

            UserDetails.tableId = '';
            await SetUser(UserDetails.userId, UserDetails);

            await SetTable(TableDetails.tableId, TableDetails);

            if (TableDetails.playersArray.length < 1) {

                await DeleteTable(TableDetails.tableId);

                await DeleteUserInTable(UserDetails.userId);

                await DeleteEmptyTable(TableDetails.bootValue, TableDetails.maxPlayers, TableDetails.tableId);

            };

            const ResData = { userId, tableId, seatIndex: UserInTableDetails.seatIndex };

            EventEmitter.emit(LEAVE_TABLE, { en: LEAVE_TABLE, RoomId: TableDetails.tableId, Data: ResData });

            const socket = io.sockets.sockets.get(UserDetails.socketId); // * Find User Socket

            if (socket) { await LeaveRoom(socket, TableDetails.tableId); };

        } else {

            TableDetails = {
                ...TableDetails,
                playersArray: [
                    ...TableDetails.playersArray.map(player => {
                        return UserDetails.userId === player.userId ? { ...player, isLeave: true } : player;
                    })
                ]
            };

            UserDetails.tableId = '';
            await SetUser(UserDetails.userId, UserDetails);

            await SetTable(TableDetails.tableId, TableDetails);

            const ResData = { userId, tableId, seatIndex: UserInTableDetails.seatIndex };

            EventEmitter.emit(LEAVE_TABLE, { en: LEAVE_TABLE, RoomId: TableDetails.tableId, Data: ResData });

            const socket = io.sockets.sockets.get(UserDetails.socketId); // * Find User Socket

            if (socket) { await LeaveRoom(socket, TableDetails.tableId); };

            const PlayersAvailableInTable = TableDetails.playersArray.filter(player => { return player.isLeave === false });

            if (PlayersAvailableInTable.length < 2) {

                console.log('LeaveTable End Game Immediately !!!');
                console.log('LeaveTable End Game Immediately !!!');
                console.log('LeaveTable End Game Immediately !!!');
                console.log('LeaveTable End Game Immediately !!!');
                console.log('LeaveTable End Game Immediately !!!');
                console.log('LeaveTable End Game Immediately !!!');

                await Win(TableDetails.tableId);

            } else {

                if (TableDetails.currentTurn === UserInTableDetails.seatIndex) {

                    await BullTimer.CancelJob.CancelUserTurn(TableDetails.tableId, TableDetails.currentTurn);

                    await ChangeUserTurn(TableDetails.tableId, false, 0);

                };
            };
        };

    } catch (error: any) {
        Logger('RemoveUserFromTable Error : ', error);
    };
};

export { LeaveTable, RemoveUserFromTable };
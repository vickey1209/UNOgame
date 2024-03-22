import { Socket } from "socket.io";
import { ErrorLogger, Logger } from "../Logger/logger";
import { CONSTANTS } from "../Constants";
import { ApplyLock, RemoveLock } from "../Connection/redlock";
import {  DeleteTable, DeleteTableConfig, DeleteUserInTable, GetTable, GetUser, GetUserInTable, SetTable, SetUser } from "../GameRedisOperations/gameRedisOperations";
import { EventEmitter } from "../Connection/emitter";
import { io } from "../Connection/socket";
import { LeaveRoom } from "../SocketRooms/leaveRoom";
import { BullTimer } from "../BullTimer";
import { ChangeUserTurn } from "../ChangeUserTurn/changeUserTurn";
import { LeaveTableInterface } from "../Interface/LeaveTable/LeaveTableInterface";
import { Win } from "../Win/win";
import { EndRound } from "../GameActions/EndRound/endRound";

const LeaveTable = async (en: string, socket: Socket, Data: LeaveTableInterface) => {

    const Path = 'LeaveTable';

    const userId = socket.handshake.auth?.userId;
    const tableId = socket.handshake.auth?.tableId;
    const playerCount = socket.handshake.auth?.playerCount;
    const bootValue = socket.handshake.auth?.bootValue;

    const { LOCK, EMPTY_TABLE, TABLES } = CONSTANTS.REDIS_COLLECTION;

    const TablelockId = `${LOCK}:${TABLES}:${tableId}`;
    const MatchMakingId = `${LOCK}:${EMPTY_TABLE}:${playerCount}`;

    const MatchMakingLock = await ApplyLock(Path, MatchMakingId);
    const Tablelock = await ApplyLock(Path, TablelockId);

    try {

        await Logger("LeaveTable", JSON.stringify({ Data, SocketData: socket.handshake.auth }));

        await RemoveUserFromTable(userId, tableId, Data.isPlayerChooseToLeave);

    } catch (error: any) {

        await ErrorLogger('LeaveTable Error : ', error);

    } finally {

        await RemoveLock(Path, MatchMakingLock);
        await RemoveLock(Path, Tablelock);

    };
};

const RemoveUserFromTable = async (userId: string, tableId: string, isPlayerChooseToLeave: boolean) => {

    try {

        await Logger("RemoveUserFromTable", JSON.stringify({ userId, tableId, isPlayerChooseToLeave }));

        const { LEAVE_TABLE, ERROR_POPUP } = CONSTANTS.EVENTS_NAME;

        let UserDetails = await GetUser(userId);

        if (!UserDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_NOT_FOUND) };

        let TableDetails = await GetTable(tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        const UserAvailableInTable = TableDetails.playersArray.find(e => { return e.userId === userId });

        if (!UserAvailableInTable) { throw new Error(CONSTANTS.ERROR_MESSAGES.WRONG_TABLE) };

        let UserInTableDetails = await GetUserInTable(TableDetails.tableId, userId);

        if (!UserInTableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_IN_TABLE_NOT_FOUND) };

        if (

            (TableDetails.isLeaveLock) ||
            (TableDetails.isWinning) ||
            (isPlayerChooseToLeave && TableDetails.isTurnLock) ||
            (TableDetails.numberOfCardToPick !== 0 && TableDetails.currentTurn === UserAvailableInTable.seatIndex && isPlayerChooseToLeave)

        ) {
            return EventEmitter.emit(ERROR_POPUP, { en: ERROR_POPUP, SocketId: UserDetails.socketId, Data: { Message: CONSTANTS.ERROR_MESSAGES.CAN_NOT_ABLE_TO_LEAVE } });
        };

        if (!TableDetails.isGameStart) {

            const PlayerIndexInArray = TableDetails.playersArray.findIndex((e) => { return e.userId === userId });

            if (PlayerIndexInArray !== -1) { TableDetails.playersArray.splice(PlayerIndexInArray, 1); };

            UserDetails.tableId = isPlayerChooseToLeave ? '' : CONSTANTS.COMMON.DISCONNECTED_OR_TURN_MISS;
            await SetUser(UserDetails.userId, UserDetails);

            await SetTable(TableDetails.tableId, TableDetails);

            await DeleteUserInTable(TableDetails.tableId, UserDetails.userId);

            if (TableDetails.playersArray.length < 1) {

                await DeleteTable(TableDetails.tableId);

                await DeleteTableConfig(TableDetails.tableId);

                // await DeleteEmptyTable(TableDetails.bootValue, TableDetails.maxPlayers, TableDetails.tableId);

            };

            const LeaveTableResData = { userId, tableId, seatIndex: UserInTableDetails.seatIndex, isPlayerChooseToLeave };

            EventEmitter.emit(LEAVE_TABLE, { en: LEAVE_TABLE, RoomId: TableDetails.tableId, Data: LeaveTableResData });

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

            const PlayerIndexInArray = TableDetails.disconnectedUsers.findIndex((e) => { return e === userId });

            if (PlayerIndexInArray !== -1) { TableDetails.disconnectedUsers.splice(PlayerIndexInArray, 1); };

            UserDetails.tableId = (isPlayerChooseToLeave || UserDetails.tableId === '') ? '' : CONSTANTS.COMMON.DISCONNECTED_OR_TURN_MISS;
            await SetUser(UserDetails.userId, UserDetails);

            await SetTable(TableDetails.tableId, TableDetails);

            const LeaveTableResData = { userId, tableId, seatIndex: UserInTableDetails.seatIndex, isPlayerChooseToLeave };

            EventEmitter.emit(LEAVE_TABLE, { en: LEAVE_TABLE, RoomId: TableDetails.tableId, Data: LeaveTableResData });

            const socket = io.sockets.sockets.get(UserDetails.socketId); // * Find User Socket

            if (socket) { await LeaveRoom(socket, TableDetails.tableId); };

            const PlayersAvailableInTable = TableDetails.playersArray.filter(player => { return player.isLeave === false });
            
            if (PlayersAvailableInTable.length < 2) {

                await EndRound(TableDetails.tableId, false, 0.1);

            } else {

                if (TableDetails.currentTurn === UserInTableDetails.seatIndex) {

                    await BullTimer.CancelJob.CancelUserTurn(TableDetails.tableId, TableDetails.currentTurn);

                    await ChangeUserTurn(TableDetails.tableId, false, false, 0);

                };
            };
        };

    } catch (error: any) {
        await ErrorLogger('RemoveUserFromTable Error : ', error);
    };
};

export { LeaveTable, RemoveUserFromTable };
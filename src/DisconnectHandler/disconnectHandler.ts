import { Socket } from "socket.io";
import { Logger } from "../Logger/logger";
import { SignUpInterface } from "../Interface/SignUp/SignUpInterface";
import { DeleteEmptyTable, DeleteTable, DeleteUserInTable, GetTable, GetUser, SetUser } from "../GameRedisOperations/gameRedisOperations";
import { CONSTANTS } from "../Constants";
import { io } from "../Connection/socket";
import { ApplyLock, RemoveLock } from "../Connection/redlock";
import { TableInterface } from "../Interface/Table/TableInterface";
import { RemoveUserFromTable } from "../Table/leaveTable";
import { BullTimer } from "../BullTimer";

const DisconnectHandler = async (socket: Socket) => {

    const Path = 'DisconnectHandler';

    const userId = socket.handshake.auth?.userId;
    const tableId = socket.handshake.auth?.tableId;
    const playerCount = socket.handshake.auth?.playerCount;
    const bootValue = socket.handshake.auth?.bootValue;

    const { LOCK, EMPTY_TABLE, TABLES } = CONSTANTS.REDIS_COLLECTION;

    const TablelockId = `${LOCK}:${TABLES}:${tableId}`;
    const MatchMakingId = `${LOCK}:${EMPTY_TABLE}:${bootValue}:${playerCount}`;

    const Tablelock = await ApplyLock(Path, TablelockId);
    const MatchMakingLock = await ApplyLock(Path, MatchMakingId);

    try {

        await Logger("DisconnectHandler", JSON.stringify({ SocketData: socket.handshake.auth }));

        let UserDetails: SignUpInterface = await GetUser(userId);

        if (!UserDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_NOT_FOUND); };

        const IsUserOnline = io.sockets.sockets.get(UserDetails.socketId); // * Find User Socket

        if (IsUserOnline) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_IS_ONLINE); };

        await BullTimer.CancelJob.CancelDisconnectUser(UserDetails.userId);

        if (UserDetails.tableId === CONSTANTS.COMMON.DISCONNECTED_OR_TURN_MISS) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_IS_ALREADY_DISCONNECTED_OR_TURN_MISSED); };

        if (UserDetails.tableId !== '') {

            let TableDetails: TableInterface = await GetTable(UserDetails?.tableId);

            if (!TableDetails) {

                UserDetails.tableId = '';
                await SetUser(userId, UserDetails);

                return;
            };

            if (TableDetails.playersArray.length < 1) {

                UserDetails.tableId = '';
                await SetUser(UserDetails.userId, UserDetails);

                await DeleteTable(TableDetails.tableId);

                await DeleteUserInTable(UserDetails.userId);

                await DeleteEmptyTable(TableDetails.bootValue, TableDetails.maxPlayers, TableDetails.tableId);

                return;
            };

            if (!TableDetails.isGameStart) {

                await RemoveUserFromTable(UserDetails.userId, UserDetails.tableId, true);

                return;
            };

            await BullTimer.AddJob.DisconnectUser(UserDetails.userId, UserDetails.tableId, UserDetails.bootValue, UserDetails.playerCount);

        };

    } catch (error: any) {

        await Logger('DisconnectHandler Error : ', error);

    } finally {

        await RemoveLock(Path, Tablelock);
        await RemoveLock(Path, MatchMakingLock);

    };
};

export { DisconnectHandler };
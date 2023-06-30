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

    try {

        const Path = 'LeaveTable';

        Logger("DisconnectHandler", JSON.stringify({}));

        const userId = socket.handshake.auth?.userId;
        const playerCount = socket.handshake.auth?.playerCount;
        const bootValue = socket.handshake.auth?.bootValue;

        const { LOCK, EMPTY_TABLE, TABLES } = CONSTANTS.REDIS_COLLECTION;

        const MatchMakingId = `${LOCK}:${EMPTY_TABLE}:${bootValue}:${playerCount}`;

        const MatchMakingLock = await ApplyLock(Path, MatchMakingId);

        let UserDetails: SignUpInterface = await GetUser(userId);

        if (!UserDetails) {

            await RemoveLock(Path, MatchMakingLock);
            throw new Error(CONSTANTS.ERROR_MESSAGES.USER_NOT_FOUND);

        };

        const IsUserOnline = io.sockets.sockets.get(UserDetails.socketId); // * Find User Socket

        if (IsUserOnline) {

            await RemoveLock(Path, MatchMakingLock);
            throw new Error(CONSTANTS.ERROR_MESSAGES.USER_IS_ONLINE);

        };

        // ! Bull ...........
        await BullTimer.CancelJob.CancelDisconnectUser(UserDetails.userId);

        if (UserDetails.tableId !== '') {

            const TablelockId = `${LOCK}:${TABLES}:${UserDetails?.tableId}`;
            const Tablelock = await ApplyLock(Path, TablelockId);

            let TableDetails: TableInterface = await GetTable(UserDetails?.tableId);

            if (!TableDetails) {

                UserDetails.tableId = '';
                await SetUser(userId, UserDetails);

                await RemoveLock(Path, Tablelock);
                await RemoveLock(Path, MatchMakingLock);

                return;
            };

            if (TableDetails.playersArray.length < 1) {

                UserDetails.tableId = '';
                await SetUser(UserDetails.userId, UserDetails);

                await DeleteTable(TableDetails.tableId);

                await DeleteUserInTable(UserDetails.userId);

                await DeleteEmptyTable(TableDetails.bootValue, TableDetails.maxPlayers, TableDetails.tableId);

                await RemoveLock(Path, Tablelock);
                await RemoveLock(Path, MatchMakingLock);

                return;
            };

            if (!TableDetails.isGameStart) {

                await RemoveUserFromTable(UserDetails.userId, UserDetails.tableId);

                await RemoveLock(Path, Tablelock);
                await RemoveLock(Path, MatchMakingLock);

                return;
            };

            // ! Bull ...........
            await BullTimer.AddJob.DisconnectUser(UserDetails.userId, UserDetails.tableId, UserDetails.bootValue, UserDetails.playerCount);

            await RemoveLock(Path, Tablelock);
            await RemoveLock(Path, MatchMakingLock);

        } else { await RemoveLock(Path, MatchMakingLock); };

    } catch (error: any) {
        Logger('DisconnectHandler Error : ', error);
    };
};

export { DisconnectHandler };
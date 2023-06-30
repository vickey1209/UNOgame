import { ApplyLock, RemoveLock } from "../Connection/redlock";
import { io } from "../Connection/socket";
import { CONSTANTS } from "../Constants";
import { GetTable, GetUser } from "../GameRedisOperations/gameRedisOperations";
import { SignUpInterface } from "../Interface/SignUp/SignUpInterface";
import { TableInterface } from "../Interface/Table/TableInterface";
import { Logger } from "../Logger/logger";
import { RemoveUserFromTable } from "../Table/leaveTable";

const DisconnectUserProcessAction = async (Data: any) => {

    const Path = 'DisconnectUserProcessAction';

    const userId = Data?.userId;
    const tableId = Data?.tableId;
    const bootValue = Data?.bootValue;
    const playerCount = Data?.playerCount;

    const { LOCK, EMPTY_TABLE, TABLES } = CONSTANTS.REDIS_COLLECTION;

    const TablelockId = `${LOCK}:${TABLES}:${tableId}`;
    const MatchMakingId = `${LOCK}:${EMPTY_TABLE}:${bootValue}:${playerCount}`;

    const Tablelock = await ApplyLock(Path, TablelockId);
    const MatchMakingLock = await ApplyLock(Path, MatchMakingId);

    try {

        Logger("DisconnectUserProcessAction", JSON.stringify(Data));

        if (userId === undefined || tableId === undefined || bootValue === undefined || playerCount === undefined) { throw new Error(CONSTANTS.ERROR_MESSAGES.BULL_DATA_NOT_FOUND) };

        let UserDetails: SignUpInterface = await GetUser(userId);

        if (!UserDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_NOT_FOUND) };

        const IsUserOnline = io.sockets.sockets.get(UserDetails.socketId); // * Find User Socket

        if (IsUserOnline) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_IS_ONLINE); };

        let TableDetails: TableInterface = await GetTable(tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        await RemoveUserFromTable(userId, tableId);

    } catch (error: any) {

        Logger('DisconnectUserProcessAction Error : ', error);

    } finally {

        await RemoveLock(Path, Tablelock);
        await RemoveLock(Path, MatchMakingLock);

    };
};

export { DisconnectUserProcessAction };
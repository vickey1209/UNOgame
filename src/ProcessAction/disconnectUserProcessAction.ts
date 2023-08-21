import { ApplyLock, RemoveLock } from "../Connection/redlock";
import { io } from "../Connection/socket";
import { CONSTANTS } from "../Constants";
import { GetTable, GetUser, SetTable, SetUser } from "../GameRedisOperations/gameRedisOperations";
import { SignUpInterface } from "../Interface/SignUp/SignUpInterface";
import { ErrorLogger, Logger } from "../Logger/logger";
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

        await Logger("DisconnectUserProcessAction", JSON.stringify(Data));

        if (userId === undefined || tableId === undefined || bootValue === undefined || playerCount === undefined) { throw new Error(CONSTANTS.ERROR_MESSAGES.BULL_DATA_NOT_FOUND) };

        let UserDetails: SignUpInterface = await GetUser(userId);

        if (!UserDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_NOT_FOUND) };

        const IsUserOnline = io.sockets.sockets.get(UserDetails.socketId); // * Find User Socket

        if (IsUserOnline) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_IS_ONLINE); };

        let TableDetails = await GetTable(tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        if (TableDetails.isWinning) { throw new Error(CONSTANTS.ERROR_MESSAGES.WINNING_DONE) };

        if (TableDetails.isLeaveLock || TableDetails.isTurnLock) {

            UserDetails.tableId = CONSTANTS.COMMON.DISCONNECTED_OR_TURN_MISS;

            await SetUser(UserDetails.userId, UserDetails);

            TableDetails.disconnectedUsers.push(UserDetails.userId);

            await SetTable(TableDetails.tableId, TableDetails);

        } else {

            await RemoveUserFromTable(userId, tableId, false);

        };

    } catch (error: any) {

        await ErrorLogger('DisconnectUserProcessAction Error : ', error);

    } finally {

        await RemoveLock(Path, Tablelock);
        await RemoveLock(Path, MatchMakingLock);

    };
};

export { DisconnectUserProcessAction };
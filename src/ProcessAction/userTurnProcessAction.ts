import { ChangeUserTurn } from "../ChangeUserTurn/changeUserTurn";
import { ApplyLock, RemoveLock } from "../Connection/redlock";
import { CONSTANTS } from "../Constants";
import { GetTable, GetUserInTable, SetUserInTable } from "../GameRedisOperations/gameRedisOperations";
import { TableInterface } from "../Interface/Table/TableInterface";
import { UserInTableInterface } from "../Interface/UserInTable/UserInTableInterface";
import { Logger } from "../Logger/logger";

const UserTurnProcessAction = async (Data: any) => {

    const Path = 'UserTurnProcessAction';

    const { LOCK, TABLES } = CONSTANTS.REDIS_COLLECTION;

    const TablelockId = `${LOCK}:${TABLES}:${Data?.tableId}`;

    const Tablelock = await ApplyLock(Path, TablelockId);

    try {

        Logger("UserTurnProcessAction", JSON.stringify(Data));

        const tableId = Data?.tableId;
        const currentTurn = Data?.currentTurn;

        let TableDetails: TableInterface = await GetTable(tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        if (TableDetails.currentTurn !== currentTurn) { throw new Error(CONSTANTS.ERROR_MESSAGES.WRONG_CURRENT_TURN_AT_PROCESS) };

        const CurrentTurnUser = TableDetails.playersArray.find(e => { return e.seatIndex === TableDetails.currentTurn });

        if (!CurrentTurnUser) { throw new Error(CONSTANTS.ERROR_MESSAGES.ARRAY_FIND_ERROR) };

        let UserInTableDetails: UserInTableInterface = await GetUserInTable(CurrentTurnUser?.userId);

        if (!UserInTableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_IN_TABLE_NOT_FOUND) };

        if (UserInTableDetails.lastPickCard !== '' && UserInTableDetails.cardArray.includes(UserInTableDetails.lastPickCard)) {

            UserInTableDetails.lastPickCard = '';

        };

        await SetUserInTable(UserInTableDetails.userId, UserInTableDetails);

        await ChangeUserTurn(TableDetails.tableId);

    } catch (error: any) {

        Logger('UserTurnProcessAction Error : ', error);

    } finally {

        await RemoveLock(Path, Tablelock);

    }
};

export { UserTurnProcessAction };
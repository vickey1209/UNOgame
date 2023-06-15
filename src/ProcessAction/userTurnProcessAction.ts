import { ApplyLock, RemoveLock } from "../Connection/redlock";
import { CONSTANTS } from "../Constants";
import { GetTable } from "../GameRedisOperations/gameRedisOperations";
import { TableInterface } from "../Interface/Table/TableInterface";
import { Logger } from "../Logger/logger";

const UserTurnProcessAction = async (Data: any) => {

    const Path = 'UserTurnProcessAction';

    const { LOCK, TABLES } = CONSTANTS.REDIS_COLLECTION;

    const TablelockId = `${LOCK}:${TABLES}:${Data?.tableId}`;

    const Tablelock = await ApplyLock(Path, TablelockId);

    try {

        Logger("UserTurnProcessAction", JSON.stringify(Data));

        const tableId = Data?.tableId;

        let TableDetails: TableInterface = await GetTable(tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

    } catch (error: any) {

        Logger('UserTurnProcessAction Error : ', error);

    } finally {

        await RemoveLock(Path, Tablelock);

    }
};

export { UserTurnProcessAction };
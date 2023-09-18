import { ApplyLock, RemoveLock } from "../Connection/redlock";
import { CONSTANTS } from "../Constants";
import { DeleteRoundHistory, DeleteTable, DeleteTableConfig, GetTable } from "../GameRedisOperations/gameRedisOperations";
import { ErrorLogger, Logger } from "../Logger/logger";

const GameEndProcessAction = async (Data: any) => {

    const Path = 'GameEndProcessAction';

    const tableId = Data?.tableId;

    const { LOCK, TABLES } = CONSTANTS.REDIS_COLLECTION;

    const TablelockId = `${LOCK}:${TABLES}:${tableId}`;
    const Tablelock = await ApplyLock(Path, TablelockId);

    try {

        await Logger("GameEndProcessAction", JSON.stringify(Data));

        const TableDetails = await GetTable(tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        await DeleteRoundHistory(TableDetails.tableId);

        await DeleteTable(TableDetails.tableId);

        await DeleteTableConfig(TableDetails.tableId);

    } catch (error: any) {

        await ErrorLogger('GameEndProcessAction Error : ', error);

    } finally {

        await RemoveLock(Path, Tablelock);

    };
};

export { GameEndProcessAction };
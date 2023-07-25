import { ApplyLock, RemoveLock } from "../Connection/redlock";
import { CONSTANTS } from "../Constants";
import { DeleteRoundHistory, DeleteTable, DeleteUserInTable, GetTable } from "../GameRedisOperations/gameRedisOperations";
import { TableInterface } from "../Interface/Table/TableInterface";
import { Logger } from "../Logger/logger";

const GameEndProcessAction = async (Data: any) => {

    const Path = 'GameEndProcessAction';

    const tableId = Data?.tableId;

    const { LOCK, TABLES } = CONSTANTS.REDIS_COLLECTION;

    const TablelockId = `${LOCK}:${TABLES}:${tableId}`;
    const Tablelock = await ApplyLock(Path, TablelockId);

    try {

        Logger("GameEndProcessAction", JSON.stringify(Data));

        const TableDetails: TableInterface = await GetTable(tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        for (let i = 0; i < TableDetails.playersArray.length; i++) {

            await DeleteUserInTable(TableDetails.playersArray[i].userId);

        };

        await DeleteRoundHistory(TableDetails.tableId);

        await DeleteTable(TableDetails.tableId);

    } catch (error: any) {

        Logger('GameEndProcessAction Error : ', error);

    } finally {

        await RemoveLock(Path, Tablelock);

    };
};

export { GameEndProcessAction };
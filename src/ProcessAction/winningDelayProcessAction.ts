import { BullTimer } from "../BullTimer";
import { EventEmitter } from "../Connection/emitter";
import { ApplyLock, RemoveLock } from "../Connection/redlock";
import { CONSTANTS } from "../Constants";
import { GetTable } from "../GameRedisOperations/gameRedisOperations";
import { TableInterface } from "../Interface/Table/TableInterface";
import { ErrorLogger, Logger } from "../Logger/logger";

const WinningDelayProcessAction = async (Data: any) => {

    const Path = 'WinningDelayProcessAction';

    const { WINNER_DECLARE } = CONSTANTS.EVENTS_NAME;
    const { LOCK, TABLES } = CONSTANTS.REDIS_COLLECTION;

    const TablelockId = `${LOCK}:${TABLES}:${Data?.tableId}`;

    const Tablelock = await ApplyLock(Path, TablelockId);

    try {

        await Logger("WinningDelayProcessAction", JSON.stringify(Data));

        let TableDetails: TableInterface = await GetTable(Data?.tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        // if (!TableDetails.isWinning) { throw new Error(CONSTANTS.ERROR_MESSAGES.WINNER_NOT_DECLARE) };

        await BullTimer.AddJob.GameEnd(TableDetails.tableId);

        EventEmitter.emit(WINNER_DECLARE, { en: WINNER_DECLARE, RoomId: TableDetails.tableId, Data: { winningArray: TableDetails.winningArray } });

    } catch (error: any) {

        await ErrorLogger('WinningDelayProcessAction Error : ', error);

    } finally {

        await RemoveLock(Path, Tablelock);

    };
};

export { WinningDelayProcessAction };
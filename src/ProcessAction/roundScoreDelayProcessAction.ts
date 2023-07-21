import { BullTimer } from "../BullTimer";
import { Config } from "../Config";
import { EventEmitter } from "../Connection/emitter";
import { ApplyLock, RemoveLock } from "../Connection/redlock";
import { CONSTANTS } from "../Constants";
import { GetRoundHistory, GetTable } from "../GameRedisOperations/gameRedisOperations";
import { TableInterface } from "../Interface/Table/TableInterface";
import { Logger } from "../Logger/logger";

const RoundScoreDelayProcessAction = async (Data: any) => {


    const Path = 'RoundScoreDelayProcessAction';

    const { ROUND_SCORE } = CONSTANTS.EVENTS_NAME;
    const { LOCK, TABLES } = CONSTANTS.REDIS_COLLECTION;

    const TablelockId = `${LOCK}:${TABLES}:${Data?.tableId}`;

    const Tablelock = await ApplyLock(Path, TablelockId);

    try {

        Logger("RoundScoreDelayProcessAction", JSON.stringify(Data));

        const CONFIG = Config();

        const tableId = Data?.tableId;

        if (!tableId) { throw new Error(CONSTANTS.ERROR_MESSAGES.BULL_DATA_NOT_FOUND); };

        let TableDetails: TableInterface = await GetTable(tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND); };

        const AllRoundScore = await GetRoundHistory(TableDetails.tableId);

        await BullTimer.AddJob.NextRound(TableDetails.tableId);

        EventEmitter.emit(ROUND_SCORE, { en: ROUND_SCORE, RoomId: TableDetails.tableId, Data: { roundScreenTimer: CONFIG.GamePlay.NEXT_ROUND_TIMER, AllRoundScore } });

    } catch (error: any) {

        Logger('RoundScoreDelayProcessAction Error : ', error);

    } finally {

        await RemoveLock(Path, Tablelock);

    };
};

export { RoundScoreDelayProcessAction };
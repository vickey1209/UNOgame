import { Config } from "../../Config";
import { CONSTANTS } from "../../Constants";
import { GetTable } from "../../GameRedisOperations/gameRedisOperations";
import { TableInterface } from "../../Interface/Table/TableInterface";
import { Logger } from "../../Logger/logger";
import { NextRoundQueue } from "../AllQueues/allQueues";
import { NextRoundProcess } from "../ProcessJob/nextRoundProcess";

const NextRound = async (tableId: string) => {

    try {

        Logger("NextRound", JSON.stringify({ tableId }));

        const CONFIG = Config();

        let TableDetails: TableInterface = await GetTable(tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        const jobId = `${tableId}`;

        const options = {
            delay: CONFIG.GamePlay.NEXT_ROUND_TIMER * 1000,
            jobId,
            removeOnComplete: true
        };

        await NextRoundQueue.add({ tableId }, options);

    } catch (error: any) {
        Logger('NextRound Error : ', error);
    };
};

NextRoundQueue.process(NextRoundProcess);

export { NextRound };
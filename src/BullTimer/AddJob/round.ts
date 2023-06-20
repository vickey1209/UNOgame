import { Config } from "../../Config";
import { CONSTANTS } from "../../Constants";
import { GetTable } from "../../GameRedisOperations/gameRedisOperations";
import { TableInterface } from "../../Interface/Table/TableInterface";
import { Logger } from "../../Logger/logger";
import { RoundQueue } from "../AllQueues/allQueues";
import { RoundProcess } from "../ProcessJob/roundProcess";

const Round = async (tableId: string) => {

    try {

        Logger("Round", JSON.stringify({ tableId }));

        const CONFIG = Config();

        let TableDetails: TableInterface = await GetTable(tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        const jobId = `${tableId}`;

        const options = {
            delay: CONFIG.GamePlay.ROUND_TIMER * 1000,
            jobId,
            removeOnComplete: true
        };

        RoundQueue.add({ tableId }, options);

    } catch (error: any) {
        Logger('Round Error : ', error);
    };
};

RoundQueue.process(RoundProcess);

export { Round };
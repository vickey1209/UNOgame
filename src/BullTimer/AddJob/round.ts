import { Config } from "../../Config";
import { CONSTANTS } from "../../Constants";
import { GetTableConfig } from "../../GameRedisOperations/gameRedisOperations";
import { ErrorLogger, Logger } from "../../Logger/logger";
import { RoundQueue } from "../AllQueues/allQueues";
import { RoundProcess } from "../ProcessJob/roundProcess";

const Round = async (tableId: string) => {

    try {

        await Logger("Round", JSON.stringify({ tableId }));

        const jobId = `${tableId}`;

        const TableConfigDetails = await GetTableConfig(tableId);

        if (!TableConfigDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_CONFIG_NOT_FOUND) };

        const options = {
            delay: TableConfigDetails?.ROUND_TIMER * 1000,
            jobId,
            removeOnComplete: true
        };

        await RoundQueue.add({ tableId }, options);

    } catch (error: any) {
        await ErrorLogger('Round Error : ', error);
    };
};

RoundQueue.process(RoundProcess);

export { Round };
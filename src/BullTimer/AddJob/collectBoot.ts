import { Config } from "../../Config";
import { ErrorLogger, Logger } from "../../Logger/logger";
import { CollectBootQueue } from "../AllQueues/allQueues";
import { CollectBootValueProcess } from "../ProcessJob/collectBootValueProcess";

const CollectBootValue = async (tableId: string) => {

    try {

        await Logger("CollectBootValue", JSON.stringify({ tableId }));

        const CONFIG = Config();

        const jobId = `${tableId}`;

        const options = {
            delay: CONFIG.GamePlay.GAME_START_TIMER * 1000,
            jobId,
            removeOnComplete: true
        };

        await CollectBootQueue.add({ tableId }, options);

    } catch (error: any) {
        await ErrorLogger('CollectBootValue Error : ', error);
    };
};

CollectBootQueue.process(CollectBootValueProcess);

export { CollectBootValue };
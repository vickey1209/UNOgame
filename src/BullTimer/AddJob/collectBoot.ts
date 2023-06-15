import { Config } from "../../Config";
import { Logger } from "../../Logger/logger";
import { CollectBootQueue } from "../AllQueues/allQueues";
import { CollectBootValueProcess } from "../ProcessJob/collectBootValueProcess";

const CONFIG = Config();

const CollectBootValue = async (tableId: string) => {

    try {

        Logger("CollectBootValue", JSON.stringify({ tableId }));

        const jobId = `${tableId}`;

        const options = {
            delay: CONFIG.GamePlay.GAME_START_TIMER * 1000,
            jobId,
            removeOnComplete: true
        }

        CollectBootQueue.add({ tableId }, options);

    } catch (error: any) {
        Logger('CollectBootValue Error : ', error);
    }
};

CollectBootQueue.process(CollectBootValueProcess);

export { CollectBootValue };
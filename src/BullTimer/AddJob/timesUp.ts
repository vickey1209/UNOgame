import { Config } from "../../Config";
import { Logger } from "../../Logger/logger";
import { TimesUpQueue } from "../AllQueues/allQueues";
import { TimesUpProcess } from "../ProcessJob/timesUpProcess";

const TimesUp = async (tableId: string) => {

    try {

        await Logger("TimesUp", JSON.stringify({ tableId }));

        const CONFIG = Config();

        const jobId = `${tableId}`;

        const options = {
            delay: CONFIG.GamePlay.DELAY_FOR_TIMES_UP * 1000,
            jobId,
            removeOnComplete: true
        };

        await TimesUpQueue.add({ tableId }, options);

    } catch (error: any) {
        await Logger('TimesUp Error : ', error);
    };
};

TimesUpQueue.process(TimesUpProcess)

export { TimesUp };
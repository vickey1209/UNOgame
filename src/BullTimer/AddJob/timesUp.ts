import { Config } from "../../Config";
import { Logger } from "../../Logger/logger";
import { TimesUpQueue } from "../AllQueues/allQueues";
import { TimesUpProcess } from "../ProcessJob/timesUpProcess";

const TimesUp = async (tableId: string) => {

    try {

        Logger("TimesUp", JSON.stringify({ tableId }));

        const CONFIG = Config();

        const jobId = `${tableId}`;

        const options = {
            delay: CONFIG.GamePlay.TIMES_UP_DELAY_TIMER * 1000,
            jobId,
            removeOnComplete: true
        };

        await TimesUpQueue.add({ tableId }, options);

    } catch (error: any) {
        Logger('TimesUp Error : ', error);
    };
};

TimesUpQueue.process(TimesUpProcess)

export { TimesUp };
import { Config } from "../../Config";
import { Logger } from "../../Logger/logger";
import { RoundQueue } from "../AllQueues/allQueues";
import { RoundProcess } from "../ProcessJob/roundProcess";

const Round = async (tableId: string) => {

    try {

        await Logger("Round", JSON.stringify({ tableId }));

        const CONFIG = Config();

        const jobId = `${tableId}`;

        const options = {
            delay: CONFIG.GamePlay.ROUND_TIMER * 1000,
            jobId,
            removeOnComplete: true
        };

        await RoundQueue.add({ tableId }, options);

    } catch (error: any) {
        await Logger('Round Error : ', error);
    };
};

RoundQueue.process(RoundProcess);

export { Round };
import { Config } from "../../Config";
import { Logger } from "../../Logger/logger";
import { NextRoundQueue } from "../AllQueues/allQueues";
import { NextRoundProcess } from "../ProcessJob/nextRoundProcess";

const NextRound = async (tableId: string) => {

    try {

        await Logger("NextRound", JSON.stringify({ tableId }));

        const CONFIG = Config();

        const jobId = `${tableId}`;

        const options = {
            delay: CONFIG.GamePlay.NEXT_ROUND_TIMER * 1000,
            jobId,
            removeOnComplete: true
        };

        await NextRoundQueue.add({ tableId }, options);

    } catch (error: any) {
        await Logger('NextRound Error : ', error);
    };
};

NextRoundQueue.process(NextRoundProcess);

export { NextRound };
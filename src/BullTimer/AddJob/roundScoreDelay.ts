import { ErrorLogger, Logger } from "../../Logger/logger";
import { RoundScoreDelayQueue } from "../AllQueues/allQueues";
import { RoundScoreDelayProcess } from "../ProcessJob/roundScoreDelayProcess";

const RoundScoreDelay = async (tableId: string, delayNumber: number) => {

    try {

        await Logger("RoundScoreDelay", JSON.stringify({ tableId, delayNumber }));

        const jobId = `${tableId}`;

        const options = {
            delay: delayNumber * 1000,
            jobId,
            removeOnComplete: true
        };

        await RoundScoreDelayQueue.add({ tableId }, options);

    } catch (error: any) {
        await ErrorLogger('RoundScoreDelay Error : ', error);
    };
};

RoundScoreDelayQueue.process(RoundScoreDelayProcess);

export { RoundScoreDelay };
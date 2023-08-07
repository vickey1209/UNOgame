import { ErrorLogger, Logger } from "../../Logger/logger";
import { NextRoundQueue } from "../AllQueues/allQueues";

const CheckNextRound = async (tableId: string) => {

    try {

        await Logger("CheckNextRound", JSON.stringify({ tableId }));

        const jobId = `${tableId}`;

        const Job = await NextRoundQueue.getJob(jobId);

        if (Job) { return Job; };

        return;

    } catch (error: any) {
        await ErrorLogger('CheckNextRound Error : ', error);
    };
};

export { CheckNextRound };
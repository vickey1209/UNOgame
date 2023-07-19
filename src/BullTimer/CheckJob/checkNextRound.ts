import { Logger } from "../../Logger/logger";
import { NextRoundQueue } from "../AllQueues/allQueues";

const CheckNextRound = async (tableId: string) => {

    try {

        Logger("CheckNextRound", JSON.stringify({ tableId }));

        const jobId = `${tableId}`;

        const Job = await NextRoundQueue.getJob(jobId);

        if (Job) { return Job; };

        return;

    } catch (error: any) {
        Logger('CheckNextRound Error', error);
    };
};

export { CheckNextRound };
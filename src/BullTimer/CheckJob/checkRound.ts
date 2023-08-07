import { ErrorLogger, Logger } from "../../Logger/logger";
import { RoundQueue } from "../AllQueues/allQueues";

const CheckRound = async (tableId: string) => {

    try {

        await Logger("CheckRound", JSON.stringify({ tableId }));

        const jobId = `${tableId}`;

        const Job = await RoundQueue.getJob(jobId);

        if (Job) { return Job; };

        return;

    } catch (error: any) {
        await ErrorLogger('CheckRound Error : ', error);
    };
};

export { CheckRound };
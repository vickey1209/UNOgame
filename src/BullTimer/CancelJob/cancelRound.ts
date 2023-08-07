import { Logger, ErrorLogger } from "../../Logger/logger";
import { RoundQueue } from "../AllQueues/allQueues";

const CancelRound = async (tableId: string) => {

    try {

        await Logger("CancelRound", JSON.stringify({ tableId }));

        const jobId = `${tableId}`;

        const Job = await RoundQueue.getJob(jobId);

        if (Job) { Job.remove(); };

        return;

    } catch (error: any) {
        await ErrorLogger('CancelRound Error : ', error);
    };
};

export { CancelRound };
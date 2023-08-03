import { ErrorLogger, Logger } from "../../Logger/logger";
import { TurnInfoQueue } from "../AllQueues/allQueues";

const CancelTurnInfo = async (tableId: string) => {

    try {

        await Logger("CancelTurnInfo", JSON.stringify({ tableId }));

        const jobId = `${tableId}`;

        const Job = await TurnInfoQueue.getJob(jobId);

        if (Job) { Job.remove(); };

        return;

    } catch (error: any) {
        await ErrorLogger('CancelTurnInfo Error : ', error);
    };
};

export { CancelTurnInfo };
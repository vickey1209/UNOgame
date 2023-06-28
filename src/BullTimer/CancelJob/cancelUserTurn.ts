import { Logger } from "../../Logger/logger";
import { UserTurnQueue } from "../AllQueues/allQueues";

const CancelUserTurn = async (tableId: string, currentTurn: number) => {

    try {

        Logger("CancelUserTurn", JSON.stringify({ tableId, currentTurn }));

        const jobId = `${tableId}:${currentTurn}`;

        const Job = await UserTurnQueue.getJob(jobId);

        if (Job) { Job.remove(); };

        return;

    } catch (error: any) {
        Logger('CancelUserTurn Error', error);
    };
};

export { CancelUserTurn };
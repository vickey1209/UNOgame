import { Logger } from "../../Logger/logger";
import { UserTurnQueue } from "../AllQueues/allQueues";

const CheckUserTurn = async (tableId: string, currentTurn: number) => {

    try {

        await Logger("CheckUserTurn", JSON.stringify({ tableId, currentTurn }));

        const jobId = `${tableId}:${currentTurn}`;

        const Job = await UserTurnQueue.getJob(jobId);

        if (Job) { return Job; };

        return;

    } catch (error: any) {
        await Logger('CheckUserTurn Error', error);
    };
};

export { CheckUserTurn };
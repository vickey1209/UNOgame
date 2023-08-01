import { Logger } from "../../Logger/logger";
import { DisconnectUserQueue } from "../AllQueues/allQueues";

const CancelDisconnectUser = async (userId: string) => {

    try {

        await Logger("CancelDisconnectUser", JSON.stringify({ userId }));

        const jobId = `${userId}`;

        const Job = await DisconnectUserQueue.getJob(jobId);

        if (Job) { Job.remove(); };

        return;

    } catch (error: any) {
        await Logger('CancelDisconnectUser Error : ', error);
    };
};

export { CancelDisconnectUser };
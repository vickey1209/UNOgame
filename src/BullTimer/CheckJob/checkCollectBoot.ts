import { ErrorLogger, Logger } from "../../Logger/logger";
import { CollectBootQueue } from "../AllQueues/allQueues";

const CheckCollectBootValue = async (tableId: string) => {

    try {

        await Logger("CheckCollectBootValue", JSON.stringify({ tableId }));

        const jobId = `${tableId}`;

        const Job = await CollectBootQueue.getJob(jobId);

        if (Job) { return Job; };

        return;

    } catch (error: any) {
        await ErrorLogger('CheckCollectBootValue Error : ', error);
    };
};

export { CheckCollectBootValue };
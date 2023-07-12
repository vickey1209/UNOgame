import { Logger } from "../../Logger/logger";
import { CollectBootQueue } from "../AllQueues/allQueues";

const CheckCollectBootValue = async (tableId: string) => {

    try {

        Logger("CheckCollectBootValue", JSON.stringify({ tableId }));

        const jobId = `${tableId}`;

        const Job = await CollectBootQueue.getJob(jobId);

        if (Job) { return Job; };

        return;

    } catch (error: any) {
        Logger('CheckCollectBootValue Error : ', error);
    };
};

export { CheckCollectBootValue };
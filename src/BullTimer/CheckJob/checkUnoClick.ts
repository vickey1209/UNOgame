import { ErrorLogger, Logger } from "../../Logger/logger";
import { UnoClickQueue } from "../AllQueues/allQueues";

const CheckUnoClick = async (tableId: string, unoSeatIndex: number) => {

    try {

        await Logger("CheckUnoClick", JSON.stringify({ tableId, unoSeatIndex }));

        const jobId = `${tableId}:${unoSeatIndex}`;

        const Job = await UnoClickQueue.getJob(jobId);

        if (Job) { return Job; };

        return;

    } catch (error: any) {
        await ErrorLogger('CheckUnoClick Error : ', error);
    };
};

export { CheckUnoClick };
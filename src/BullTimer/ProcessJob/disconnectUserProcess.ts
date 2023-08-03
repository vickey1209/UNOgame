import { DoneCallback, Job } from "bull";
import { ErrorLogger, Logger } from "../../Logger/logger";
import { PROCESS_ACTION } from "../../ProcessAction";

const DisconnectUserProcess = async (job: Job, done: DoneCallback) => {

    try {

        await Logger("DisconnectUserProcess", JSON.stringify(job.data));

        done();

        await PROCESS_ACTION.DisconnectUserProcessAction(job.data);

    } catch (error: any) {
        await ErrorLogger('DisconnectUserProcess Error : ', error);
    };
};

export { DisconnectUserProcess };
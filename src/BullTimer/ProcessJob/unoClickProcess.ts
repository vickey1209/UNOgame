import { DoneCallback, Job } from "bull";
import { Logger } from "../../Logger/logger";
import { PROCESS_ACTION } from "../../ProcessAction";

const UnoClickProcess = async (job: Job, done: DoneCallback) => {

    try {

        Logger("UnoClickProcess", JSON.stringify(job.data));

        done();

        await PROCESS_ACTION.UnoClickProcessAction(job.data);

    } catch (error: any) {
        Logger('UnoClickProcess Error : ', error);
    };
};

export { UnoClickProcess };
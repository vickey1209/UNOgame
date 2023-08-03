import { DoneCallback, Job } from "bull";
import { ErrorLogger, Logger } from "../../Logger/logger";
import { PROCESS_ACTION } from "../../ProcessAction";

const GameEndProcess = async (job: Job, done: DoneCallback) => {

    try {

        await Logger("GameEndProcess", JSON.stringify(job.data));

        done();

        await PROCESS_ACTION.GameEndProcessAction(job.data);

    } catch (error: any) {
        await ErrorLogger('GameEndProcess Error : ', error);
    };
};

export { GameEndProcess };
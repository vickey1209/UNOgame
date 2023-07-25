import { DoneCallback, Job } from "bull";
import { Logger } from "../../Logger/logger";
import { PROCESS_ACTION } from "../../ProcessAction";

const GameEndProcess = async (job: Job, done: DoneCallback) => {

    try {

        Logger("GameEndProcess", JSON.stringify(job.data));

        done();

        await PROCESS_ACTION.GameEndProcessAction(job.data);

    } catch (error: any) {
        Logger('GameEndProcess Error : ', error);
    };
};

export { GameEndProcess };
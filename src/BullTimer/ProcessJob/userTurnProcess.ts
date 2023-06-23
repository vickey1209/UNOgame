import { DoneCallback, Job } from 'bull';
import { Logger } from "../../Logger/logger";
import { PROCESS_ACTION } from '../../ProcessAction';

const UserTurnProcess = async (job: Job, done: DoneCallback) => {

    try {

        Logger('UserTurnProcess', JSON.stringify(job.data));

        done();

        await PROCESS_ACTION.UserTurnProcessAction(job.data);

    } catch (error: any) {
        Logger('UserTurnProcess Error : ', error);
    }
};

export { UserTurnProcess };
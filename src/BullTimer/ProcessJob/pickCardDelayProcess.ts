import { DoneCallback, Job } from 'bull';
import { ErrorLogger, Logger } from '../../Logger/logger';
import { PROCESS_ACTION } from '../../ProcessAction';

const PickCardDelayProcess = async (job: Job, done: DoneCallback) => {

    try {

        await Logger('PickCardDelayProcess', JSON.stringify(job.data));

        done();

        await PROCESS_ACTION.PickCardDelayProcessAction(job.data);

    } catch (error: any) {
        await ErrorLogger('PickCardDelayProcess Error : ', error);
    };
};

export { PickCardDelayProcess };
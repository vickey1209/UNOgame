import { DoneCallback, Job } from 'bull';
import { Logger } from '../../Logger/logger';
import { PROCESS_ACTION } from '../../ProcessAction';

const PickCardDelayProcess = async (job: Job, done: DoneCallback) => {

    try {

        Logger('PickCardDelayProcess', JSON.stringify(job.data));

        done();

        await PROCESS_ACTION.PickCardDelayProcessAction(job.data);

    } catch (error: any) {
        Logger('PickCardDelayProcess Error : ', error);
    };
};

export { PickCardDelayProcess };
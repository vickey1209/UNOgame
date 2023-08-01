import { DoneCallback, Job } from 'bull';
import { Logger } from '../../Logger/logger';
import { PROCESS_ACTION } from '../../ProcessAction';

const RoundProcess = async (job: Job, done: DoneCallback) => {

    try {

        await Logger('RoundProcess', JSON.stringify(job.data));

        done();

        await PROCESS_ACTION.RoundProcessAction(job.data);

    } catch (error: any) {
        await Logger('RoundProcess Error : ', error);
    };
};

export { RoundProcess };
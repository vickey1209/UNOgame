import { DoneCallback, Job } from 'bull';
import { ErrorLogger, Logger } from '../../Logger/logger';
import { PROCESS_ACTION } from '../../ProcessAction';

const NextRoundProcess = async (job: Job, done: DoneCallback) => {

    try {

        await Logger('NextRoundProcess', JSON.stringify(job.data));

        done();

        await PROCESS_ACTION.NextRoundProcessAction(job.data);

    } catch (error: any) {
        await ErrorLogger('NextRoundProcess Error : ', error);
    };
};

export { NextRoundProcess };
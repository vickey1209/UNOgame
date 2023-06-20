import { DoneCallback, Job } from 'bull';
import { Logger } from '../../Logger/logger';
import { PROCESS_ACTION } from '../../ProcessAction';

const NextRoundProcess = async (job: Job, done: DoneCallback) => {

    try {

        Logger('NextRoundProcess', JSON.stringify(job.data));

        done();

        await PROCESS_ACTION.NextRoundProcessAction(job.data);

    } catch (error: any) {
        Logger('NextRoundProcess Error : ', error);
    };
};

export { NextRoundProcess };
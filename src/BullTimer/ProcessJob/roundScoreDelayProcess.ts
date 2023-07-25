import { DoneCallback, Job } from 'bull';
import { Logger } from '../../Logger/logger';
import { PROCESS_ACTION } from '../../ProcessAction';

const RoundScoreDelayProcess = async (job: Job, done: DoneCallback) => {

    try {

        Logger('RoundScoreDelayProcess', JSON.stringify(job.data));

        done();

        await PROCESS_ACTION.RoundScoreDelayProcessAction(job.data);

    } catch (error: any) {
        Logger('RoundScoreDelayProcess Error : ', error);
    };
};

export { RoundScoreDelayProcess };
import { DoneCallback, Job } from 'bull';
import { Logger } from '../../Logger/logger';
import { PROCESS_ACTION } from '../../ProcessAction';

const TurnInfoProcess = async (job: Job, done: DoneCallback) => {

    try {

        Logger('TurnInfoProcess', JSON.stringify(job.data));

        done();

        await PROCESS_ACTION.TurnInfoProcessAction(job.data);

    } catch (error: any) {
        Logger('TurnInfoProcess Error : ', error);
    };
};

export { TurnInfoProcess };
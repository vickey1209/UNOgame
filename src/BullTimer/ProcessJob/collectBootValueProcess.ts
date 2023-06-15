import { DoneCallback, Job } from 'bull';
import { Logger } from '../../Logger/logger';
import { PROCESS_ACTION } from '../../ProcessAction';

const CollectBootValueProcess = async (job: Job, done: DoneCallback) => {

    try {

        Logger('CollectBootValueProcess', JSON.stringify(job.data));

        done();

        await PROCESS_ACTION.CollectBootValueProcessAction(job.data);

    } catch (error: any) {
        Logger('CollectBootValueProcess Error : ', error);
    }
}

export { CollectBootValueProcess };
import { DoneCallback, Job } from 'bull';
import { ErrorLogger, Logger } from '../../Logger/logger';
import { PROCESS_ACTION } from '../../ProcessAction';

const CollectBootValueProcess = async (job: Job, done: DoneCallback) => {

    try {

        await Logger('CollectBootValueProcess', JSON.stringify(job.data));

        done();

        await PROCESS_ACTION.CollectBootValueProcessAction(job.data);

    } catch (error: any) {
        await ErrorLogger('CollectBootValueProcess Error : ', error);
    };
};

export { CollectBootValueProcess };
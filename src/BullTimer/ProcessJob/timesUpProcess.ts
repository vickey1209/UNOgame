import { DoneCallback, Job } from 'bull';
import { ErrorLogger, Logger } from "../../Logger/logger";
import { PROCESS_ACTION } from '../../ProcessAction';

const TimesUpProcess = async (job: Job, done: DoneCallback) => {

    try {

        await Logger('TimesUpProcess', JSON.stringify(job.data));

        done();

        await PROCESS_ACTION.TimesUpProcessAction(job.data);

    } catch (error: any) {
        await ErrorLogger('TimesUpProcess Error : ', error);
    };
};

export { TimesUpProcess };
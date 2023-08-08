import { DoneCallback, Job } from 'bull';
import { ErrorLogger, Logger } from "../../Logger/logger";
import { PROCESS_ACTION } from '../../ProcessAction';

const WinningDelayProcess = async (job: Job, done: DoneCallback) => {

    try {

        await Logger('WinningDelayProcess', JSON.stringify(job.data));

        done();

        await PROCESS_ACTION.WinningDelayProcessAction(job.data);

    } catch (error: any) {
        await ErrorLogger('WinningDelayProcess Error : ', error);
    };
};

export { WinningDelayProcess };
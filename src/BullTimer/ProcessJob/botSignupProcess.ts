import { DoneCallback, Job } from 'bull';
import { ErrorLogger, Logger } from '../../Logger/logger';
import { BOT_ACTION } from "../../Bot";

const BotSignupProcess = async (job: Job, done: DoneCallback) => {

    try {

        await Logger('BotSignupProcess', JSON.stringify(job.data));

        done();

        await BOT_ACTION.BotSignUp(job.data)

    } catch (error: any) {
        await ErrorLogger('BotSignupProcess Error : ', error);
    };
};

export { BotSignupProcess };
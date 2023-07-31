import { DoneCallback, Job } from 'bull';
import { Logger } from '../../Logger/logger';
import { BOT_ACTION } from "../../Bot";

const BotSignupProcess = async (job: Job, done: DoneCallback) => {

    try {

        Logger('BotSignupProcess', JSON.stringify(job.data));

        done();

        await BOT_ACTION.BotSignUp(job.data)

    } catch (error: any) {
        Logger('BotSignupProcess Error : ', error);
    };
};

export { BotSignupProcess };
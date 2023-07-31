import { DoneCallback, Job } from 'bull';
import { Logger } from '../../Logger/logger';
import { BOT_ACTION } from "../../Bot";

const BotTurnProcess = async (job: Job, done: DoneCallback) => {

    try {

        Logger('BotTurnProcess', JSON.stringify(job.data));

        done();

        await BOT_ACTION.TakeTurn(job.data.tableId)

    } catch (error: any) {
        Logger('BotTurnProcess Error : ', error);
    };
};

export { BotTurnProcess };
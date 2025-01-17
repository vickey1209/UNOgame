import { DoneCallback, Job } from 'bull';
import { ErrorLogger, Logger } from '../../Logger/logger';
// import { PROCESS_ACTION } from '../../ProcessAction';
import { ThrowCard } from '../../ThrowCard/throwCard';

const BotCardThrowProcess = async (job: Job, done: DoneCallback) => {

    try {

        await Logger('BotCardThrowProcess', JSON.stringify(job.data));

        done();

        await ThrowCard(job.data.eventName,job.data.socket,job.data.Fake_Data);

    } catch (error: any) {
        await ErrorLogger('BotCardThrowProcess Error : ', error);
    };
};

export { BotCardThrowProcess };
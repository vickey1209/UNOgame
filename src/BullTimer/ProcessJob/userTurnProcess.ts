import { DoneCallback, Job } from 'bull';
import { Logger } from "../../Logger/logger";
import { TableInterface } from '../../Interface/Table/TableInterface';
import { GetTable } from '../../GameRedisOperations/gameRedisOperations';
import { CONSTANTS } from '../../Constants';

const UserTurnProcess = async (job: Job, done: DoneCallback) => {

    try {

        Logger('UserTurnProcess', JSON.stringify(job.data));

        const tableId = job.data?.tableId;

        let TableDetails: TableInterface = await GetTable(tableId);

        done();

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };


    } catch (error: any) {
        Logger('UserTurnProcess Error : ', error);
    }
};

export { UserTurnProcess };
import { DoneCallback, Job } from 'bull';
import { Logger } from '../../Logger/logger';
import { GetTable, GetUser, SetUser } from '../../GameRedisOperations/gameRedisOperations';
import { TableInterface } from '../../Interface/Table/TableInterface';
import { SignUpInterface } from '../../Interface/SignUp/SignUpInterface';
import { GAME_ACTIONS } from '../../GameActions';
import { EventEmitter } from '../../Connection/emitter';
import { CONSTANTS } from '../../Constants';

const CollectBootValueProcess = async (job: Job, done: DoneCallback) => {

    try {

        Logger('CollectBootValueProcess', JSON.stringify(job.data));

        const { COLLECT_BOOT } = CONSTANTS.EVENTS_NAME;

        const tableId = job.data?.tableId;

        let TableDetails: TableInterface = await GetTable(tableId);

        done();

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        await CutBootValueFromUser(TableDetails);

        const ResData = {

            Message: `Collect Boot ${TableDetails.bootValue} !`,
            bootValue: TableDetails.bootValue

        };

        EventEmitter.emit(COLLECT_BOOT, { en: COLLECT_BOOT, RoomId: TableDetails.tableId, Data: ResData });

        await GAME_ACTIONS.DistributeCards(TableDetails.tableId);

    } catch (error: any) {
        Logger('CollectBootValueProcess Error : ', error);
    }
}

const CutBootValueFromUser = async (TableDetails: TableInterface) => {

    try {

        Logger("CutBootValueFromUser", JSON.stringify({ TableDetails }));

        for (let i = 0; i < TableDetails.playersArray.length; i++) {

            let UserDetails: SignUpInterface = await GetUser(TableDetails.playersArray[i].userId);

            UserDetails.chips -= TableDetails.bootValue;

            await SetUser(TableDetails.playersArray[i].userId, UserDetails);

        }

    } catch (error: any) {
        Logger('CutBootValueFromUser Error', error);
    }
}

export { CollectBootValueProcess };
import { EventEmitter } from "../Connection/emitter";
import { ApplyLock, RemoveLock } from "../Connection/redlock";
import { CONSTANTS } from "../Constants";
import { GAME_ACTIONS } from "../GameActions";
import { GetTable, GetUser, SetUser } from "../GameRedisOperations/gameRedisOperations";
import { SignUpInterface } from "../Interface/SignUp/SignUpInterface";
import { TableInterface } from "../Interface/Table/TableInterface";
import { Logger } from "../Logger/logger";

const CollectBootValueProcessAction = async (Data: any) => {

    const Path = 'CollectBootValueProcessAction';

    const { COLLECT_BOOT } = CONSTANTS.EVENTS_NAME;
    const { LOCK, TABLES } = CONSTANTS.REDIS_COLLECTION;

    const TablelockId = `${LOCK}:${TABLES}:${Data?.tableId}`;

    const Tablelock = await ApplyLock(Path, TablelockId);

    try {

        Logger("CollectBootValueProcessAction", JSON.stringify(Data));

        const tableId = Data?.tableId;

        if (!tableId) { throw new Error(CONSTANTS.ERROR_MESSAGES.BULL_DATA_NOT_FOUND) };

        let TableDetails: TableInterface = await GetTable(tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        await CutBootValueFromUser(TableDetails);

        // const ResData = {

        //     Message: `Collect Boot ${TableDetails.bootValue} !`,
        //     bootValue: TableDetails.bootValue

        // };

        // EventEmitter.emit(COLLECT_BOOT, { en: COLLECT_BOOT, RoomId: TableDetails.tableId, Data: ResData });

        await GAME_ACTIONS.DistributeCards(TableDetails.tableId);

    } catch (error: any) {

        Logger('CollectBootValueProcessAction Error : ', error);

    } finally {

        await RemoveLock(Path, Tablelock);

    };
};

const CutBootValueFromUser = async (TableDetails: TableInterface) => {

    try {

        Logger("CutBootValueFromUser", JSON.stringify({ TableDetails }));

        for (let i = 0; i < TableDetails.playersArray.length; i++) {

            let UserDetails: SignUpInterface = await GetUser(TableDetails.playersArray[i].userId);

            UserDetails.chips -= TableDetails.bootValue;

            await SetUser(TableDetails.playersArray[i].userId, UserDetails);

        };

    } catch (error: any) {
        Logger('CutBootValueFromUser Error', error);
    };
};

export { CollectBootValueProcessAction };
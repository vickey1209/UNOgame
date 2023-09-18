import { EventEmitter } from "../Connection/emitter";
import { ApplyLock, RemoveLock } from "../Connection/redlock";
import { CONSTANTS } from "../Constants";
import { GAME_ACTIONS } from "../GameActions";
import { GetTable, GetUser, SetTable, SetUser } from "../GameRedisOperations/gameRedisOperations";
import { TableInterface } from "../Interface/Table/TableInterface";
import { ErrorLogger, Logger } from "../Logger/logger";

const CollectBootValueProcessAction = async (Data: any) => {

    const Path = 'CollectBootValueProcessAction';

    const { COLLECT_BOOT } = CONSTANTS.EVENTS_NAME;
    const { LOCK, TABLES } = CONSTANTS.REDIS_COLLECTION;

    const TablelockId = `${LOCK}:${TABLES}:${Data?.tableId}`;

    const Tablelock = await ApplyLock(Path, TablelockId);

    try {

        await Logger("CollectBootValueProcessAction", JSON.stringify(Data));

        const tableId = Data?.tableId;

        if (!tableId) { throw new Error(CONSTANTS.ERROR_MESSAGES.BULL_DATA_NOT_FOUND) };

        let TableDetails = await GetTable(tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        TableDetails.playersArray = TableDetails.playersArray.sort((a, b) => { return a.seatIndex - b.seatIndex });

        // await CutBootValueFromUser(TableDetails);

        await SetTable(tableId, TableDetails);

        // const ResData = {

        //     Message: `Collect Boot ${TableDetails.bootValue} !`,
        //     bootValue: TableDetails.bootValue

        // };

        // EventEmitter.emit(COLLECT_BOOT, { en: COLLECT_BOOT, RoomId: TableDetails.tableId, Data: ResData });

        await GAME_ACTIONS.DistributeCards(TableDetails.tableId);

    } catch (error: any) {

        await ErrorLogger('CollectBootValueProcessAction Error : ', error);

    } finally {

        await RemoveLock(Path, Tablelock);

    };
};

// const CutBootValueFromUser = async (TableDetails: TableInterface) => {

//     try {

//         await Logger("CutBootValueFromUser", JSON.stringify({ TableDetails }));

//         for (let i = 0; i < TableDetails.playersArray.length; i++) {

//             let UserDetails = await GetUser(TableDetails.playersArray[i].userId);

//             UserDetails.chips -= TableDetails.bootValue;

//             await SetUser(TableDetails.playersArray[i].userId, UserDetails);

//         };

//     } catch (error: any) {
//         await ErrorLogger('CutBootValueFromUser Error : ', error);
//     };
// };

export { CollectBootValueProcessAction };
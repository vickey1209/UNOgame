import { BullTimer } from "../BullTimer";
import { CONSTANTS } from "../Constants";
import { GAME_ACTIONS } from "../GameActions";
import { GetTable, SetTable } from "../GameRedisOperations/gameRedisOperations";
import { TableInterface } from "../Interface/Table/TableInterface";
import { Logger } from "../Logger/logger";

const RandomPlayerTurn = async (tableId: string) => {

    try {

        Logger('RandomPlayerTurn', JSON.stringify({ tableId }));

        let isSkip = false, skipSeatIndex = -1, isRevers = false;

        let TableDetails: TableInterface = await GetTable(tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        const RandomPlayerSelect = await GAME_ACTIONS.RandomNumber(0, (TableDetails.playersArray.length - 1));

        TableDetails.isTurnLock = true;
        TableDetails.currentTurn = RandomPlayerSelect;

        await SetTable(TableDetails.tableId, TableDetails);

        // await BullTimer.AddJob.TurnInfo(TableDetails.tableId, isSkip, skipSeatIndex, isRevers, 1);
        await BullTimer.AddJob.TurnInfo(TableDetails.tableId, isSkip, skipSeatIndex, isRevers, 15);

    } catch (error: any) {
        Logger('RandomPlayerTurn Error : ', error);
    };
};

export { RandomPlayerTurn };
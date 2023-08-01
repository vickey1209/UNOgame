import { BullTimer } from "../BullTimer";
import { Config } from "../Config";
import { CONSTANTS } from "../Constants";
import { GAME_ACTIONS } from "../GameActions";
import { GetTable, SetTable } from "../GameRedisOperations/gameRedisOperations";
import { TableInterface } from "../Interface/Table/TableInterface";
import { Logger } from "../Logger/logger";

const RandomPlayerTurn = async (tableId: string) => {

    try {

        Logger('RandomPlayerTurn', JSON.stringify({ tableId }));

        const CONFIG = Config();

        let isSkip = false, skipSeatIndex = -1, isRevers = false;

        let TableDetails: TableInterface = await GetTable(tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        const RandomPlayerSelect = await GAME_ACTIONS.RandomNumber(0, (TableDetails.playersArray.length - 1));

        TableDetails.isTurnLock = true;
        TableDetails.currentTurn = RandomPlayerSelect;

        if (TableDetails.playersArray[RandomPlayerSelect].isLeave) {

            let NextTurn = await GAME_ACTIONS.ClockWiseTurnChange(TableDetails);

            if (!NextTurn && NextTurn !== 0) { throw new Error(CONSTANTS.ERROR_MESSAGES.TURN_CHANGE_ERROR) };

            TableDetails.currentTurn = NextTurn;

        };

        await SetTable(TableDetails.tableId, TableDetails);

        // await BullTimer.AddJob.TurnInfo(TableDetails.tableId, isSkip, skipSeatIndex, isRevers, 1);
        await BullTimer.AddJob.TurnInfo(TableDetails.tableId, isSkip, skipSeatIndex, isRevers, CONFIG.GamePlay.DELAY_FOR_CARD_DISTRIBUTION);

    } catch (error: any) {
        Logger('RandomPlayerTurn Error : ', error);
    };
};

export { RandomPlayerTurn };
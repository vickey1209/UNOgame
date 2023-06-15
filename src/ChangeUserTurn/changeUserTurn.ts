import { BullTimer } from "../BullTimer";
import { Config } from "../Config";
import { EventEmitter } from "../Connection/emitter";
import { CONSTANTS } from "../Constants";
import { GAME_ACTIONS } from "../GameActions";
import { GetTable, SetTable } from "../GameRedisOperations/gameRedisOperations";
import { TableInterface } from "../Interface/Table/TableInterface";
import { Logger } from "../Logger/logger";

const ChangeUserTurn = async (tableId: string) => {

    try {

        Logger("ChangeUserTurn", JSON.stringify({ tableId }));

        const CONFIG = Config();

        const { TURN_INFO } = CONSTANTS.EVENTS_NAME;

        let TableDetails: TableInterface = await GetTable(tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        if (TableDetails.isClockwise) {

            const NextTurn = await GAME_ACTIONS.ClockWiseTurnChange(TableDetails);

            if (!NextTurn && NextTurn !== 0) { throw new Error(CONSTANTS.ERROR_MESSAGES.TURN_CHANGE_ERROR) };

            TableDetails.currentTurn = NextTurn;

        } else {

            const NextTurn = await GAME_ACTIONS.AntiClockWiseTurnChange(TableDetails);

            if (!NextTurn && NextTurn !== 0) { throw new Error(CONSTANTS.ERROR_MESSAGES.TURN_CHANGE_ERROR) };

            TableDetails.currentTurn = NextTurn;

        }

        await SetTable(TableDetails.tableId, TableDetails);

        await BullTimer.AddJob.UserTurn(TableDetails.tableId);

        const ResData = {

            currentTurn: TableDetails.currentTurn,
            activeCard: TableDetails.activeCard,
            activeCardType: TableDetails.activeCardType,
            activeCardColor: TableDetails.activeCardColor,

            totalTime: CONFIG.GamePlay.USER_TURN_TIMER,
            remainingTime: CONFIG.GamePlay.USER_TURN_TIMER
        }

        EventEmitter.emit(TURN_INFO, { en: TURN_INFO, RoomId: TableDetails.tableId, Data: ResData });

    } catch (error: any) {
        Logger('ChangeUserTurn Error : ', error);
    }
};

export { ChangeUserTurn };
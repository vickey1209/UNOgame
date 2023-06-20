import { AllUserScore } from "../AllUserScore/allUserScore";
import { BullTimer } from "../BullTimer";
import { Config } from "../Config";
import { EventEmitter } from "../Connection/emitter";
import { CONSTANTS } from "../Constants";
import { GAME_ACTIONS } from "../GameActions";
import { GetTable, SetTable } from "../GameRedisOperations/gameRedisOperations";
import { TableInterface } from "../Interface/Table/TableInterface";
import { TurnInfoResInterface } from "../Interface/TurnInfoRes/TurnInfoResInterface";
import { Logger } from "../Logger/logger";

const RandomPlayerTurn = async (tableId: string) => {

    try {

        Logger('RandomPlayerTurn', JSON.stringify({ tableId }));

        const CONFIG = Config();

        const { TURN_INFO } = CONSTANTS.EVENTS_NAME;

        let TableDetails: TableInterface = await GetTable(tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        const RandomPlayerSelect = await GAME_ACTIONS.RandomNumber(0, (TableDetails.playersArray.length - 1));

        if (TableDetails.currentRound === -1) {

            TableDetails.currentRound = 1;

        } else { TableDetails.currentRound += 1; };

        TableDetails.isLeaveLock = false;
        TableDetails.currentTurn = RandomPlayerSelect;

        const ResData: TurnInfoResInterface = {

            currentTurn: TableDetails.currentTurn,
            activeCard: TableDetails.activeCard,
            activeCardType: TableDetails.activeCardType,
            activeCardColor: TableDetails.activeCardColor,

            isSkip: false,
            skipSeatIndex: -1,

            totalTime: CONFIG.GamePlay.USER_TURN_TIMER,
            remainingTime: CONFIG.GamePlay.USER_TURN_TIMER

        }

        await SetTable(TableDetails.tableId, TableDetails);

        setTimeout(async () => {

            await AllUserScore(TableDetails.tableId);

            await BullTimer.AddJob.UserTurn(tableId);

            EventEmitter.emit(TURN_INFO, { en: TURN_INFO, RoomId: TableDetails.tableId, Data: ResData });

        }, 2000);

    } catch (error: any) {
        Logger('RandomPlayerTurn Error : ', error);
    }
};

export { RandomPlayerTurn };
import { AllUserScore } from "../AllUserScore/allUserScore";
import { BullTimer } from "../BullTimer";
import { Config } from "../Config";
import { EventEmitter } from "../Connection/emitter";
import { CONSTANTS } from "../Constants";
import { GAME_ACTIONS } from "../GameActions";
import { GetTable, GetUserInTable, SetTable } from "../GameRedisOperations/gameRedisOperations";
import { TableInterface } from "../Interface/Table/TableInterface";
import { TurnInfoResInterface } from "../Interface/TurnInfoRes/TurnInfoResInterface";
import { UserInTableInterface } from "../Interface/UserInTable/UserInTableInterface";
import { Logger } from "../Logger/logger";

const RandomPlayerTurn = async (tableId: string) => {

    try {

        Logger('RandomPlayerTurn', JSON.stringify({ tableId }));

        const CONFIG = Config();

        const { TURN_INFO } = CONSTANTS.EVENTS_NAME;

        let isSkip = false, skipSeatIndex = -1, isRevers = false;

        let TableDetails: TableInterface = await GetTable(tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        const RandomPlayerSelect = await GAME_ACTIONS.RandomNumber(0, (TableDetails.playersArray.length - 1));

        // if (TableDetails.currentRound === -1) {

        //     TableDetails.currentRound = 1;

        // } else { TableDetails.currentRound += 1; };

        TableDetails.isTurnLock = true;
        // TableDetails.isLeaveLock = false;
        TableDetails.currentTurn = RandomPlayerSelect;

        await SetTable(TableDetails.tableId, TableDetails);

        // await BullTimer.AddJob.TurnInfo(TableDetails.tableId, isSkip, skipSeatIndex, isRevers, 1);
        await BullTimer.AddJob.TurnInfo(TableDetails.tableId, isSkip, skipSeatIndex, isRevers, 5);

        // const ResData: TurnInfoResInterface = {

        //     currentTurn: TableDetails.currentTurn,
        //     activeCard: TableDetails.activeCard,
        //     activeCardType: TableDetails.activeCardType,
        //     activeCardColor: TableDetails.activeCardColor,

        //     isSkip,
        //     skipSeatIndex,

        //     isRevers,
        //     isClockwise: TableDetails.isClockwise,

        //     totalTime: CONFIG.GamePlay.USER_TURN_TIMER,
        //     remainingTime: CONFIG.GamePlay.USER_TURN_TIMER

        // };

        // await SetTable(TableDetails.tableId, TableDetails);

        // setTimeout(async () => {

        //     await AllUserScore(TableDetails.tableId);

        //     await BullTimer.AddJob.UserTurn(tableId);

        //     EventEmitter.emit(TURN_INFO, { en: TURN_INFO, RoomId: TableDetails.tableId, Data: ResData });

        // }, 7000);

    } catch (error: any) {
        Logger('RandomPlayerTurn Error : ', error);
    };
};

export { RandomPlayerTurn };
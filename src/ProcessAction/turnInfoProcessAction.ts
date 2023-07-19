import { AllUserScore } from "../AllUserScore/allUserScore";
import { BullTimer } from "../BullTimer";
import { Config } from "../Config";
import { EventEmitter } from "../Connection/emitter";
import { ApplyLock, RemoveLock } from "../Connection/redlock";
import { CONSTANTS } from "../Constants";
import { GAME_ACTIONS } from "../GameActions";
import { GetTable, GetUserInTable, SetTable } from "../GameRedisOperations/gameRedisOperations";
import { TableInterface } from "../Interface/Table/TableInterface";
import { TurnInfoResInterface } from "../Interface/TurnInfoRes/TurnInfoResInterface";
import { UserInTableInterface } from "../Interface/UserInTable/UserInTableInterface";
import { Logger } from "../Logger/logger";

const TurnInfoProcessAction = async (Data: any) => {

    const Path = 'TurnInfoProcessAction';

    const { TURN_INFO, ROUND_START } = CONSTANTS.EVENTS_NAME;
    const { LOCK, TABLES } = CONSTANTS.REDIS_COLLECTION;

    const TablelockId = `${LOCK}:${TABLES}:${Data?.tableId}`;

    const Tablelock = await ApplyLock(Path, TablelockId);

    try {

        Logger("TurnInfoProcessAction", JSON.stringify(Data));

        const CONFIG = Config();

        let TableDetails: TableInterface = await GetTable(Data?.tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        if (TableDetails.isWinning) { throw new Error(CONSTANTS.ERROR_MESSAGES.WINNING_DONE) };

        if (TableDetails.isScoreScreen) { throw new Error(CONSTANTS.ERROR_MESSAGES.ROUND_SCORE_DONE) };

        if (!TableDetails.isRoundStart) {

            TableDetails.isRoundStart = true;

            await BullTimer.AddJob.Round(TableDetails.tableId);

            EventEmitter.emit(ROUND_START, { en: ROUND_START, RoomId: TableDetails.tableId, Data: { timer: CONFIG.GamePlay.ROUND_TIMER, currentRound: TableDetails.currentRound } });

        };

        TableDetails.isTurnLock = false;
        TableDetails.isLeaveLock = false;

        let UserInTableDetails: UserInTableInterface = await GetUserInTable(TableDetails.playersArray[TableDetails.currentTurn]?.userId);

        if (!UserInTableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_IN_TABLE_NOT_FOUND) };

        const isThrowPossible = await GAME_ACTIONS.IsThrowPossible(UserInTableDetails, TableDetails);

        if (isThrowPossible === undefined) { throw new Error(CONSTANTS.ERROR_MESSAGES.IS_POSSIBLE_THROW_ERROR); };

        await SetTable(TableDetails.tableId, TableDetails);

        const TurnInfoResData: TurnInfoResInterface = {

            currentTurn: TableDetails.currentTurn,
            activeCard: TableDetails.activeCard,
            activeCardType: TableDetails.activeCardType,
            activeCardColor: TableDetails.activeCardColor,

            isSkip: Data?.isSkip,
            skipSeatIndex: Data?.skipSeatIndex,

            isRevers: Data?.isRevers,
            isClockwise: TableDetails.isClockwise,

            isThrowPossible,

            totalTime: CONFIG.GamePlay.USER_TURN_TIMER,
            remainingTime: CONFIG.GamePlay.USER_TURN_TIMER

        };

        await AllUserScore(TableDetails.tableId);

        await BullTimer.AddJob.UserTurn(TableDetails.tableId, TableDetails.currentTurn);

        EventEmitter.emit(TURN_INFO, { en: TURN_INFO, RoomId: TableDetails.tableId, Data: TurnInfoResData });

        if (TableDetails.disconnectedUsers.length) { await GAME_ACTIONS.RemoveDisconnectedUsers(TableDetails.tableId); };

    } catch (error: any) {

        Logger('TurnInfoProcessAction Error : ', error);

    } finally {

        await RemoveLock(Path, Tablelock);

    };
};

export { TurnInfoProcessAction };
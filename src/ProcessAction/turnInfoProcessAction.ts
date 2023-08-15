import { AllUserScore } from "../AllUserScore/allUserScore";
import { BullTimer } from "../BullTimer";
import { Config } from "../Config";
import { EventEmitter } from "../Connection/emitter";
import { ApplyLock, RemoveLock } from "../Connection/redlock";
import { CONSTANTS } from "../Constants";
import { GAME_ACTIONS } from "../GameActions";
import { GetTable, GetUserInTable, SetTable } from "../GameRedisOperations/gameRedisOperations";
import { TurnInfoResInterface } from "../Interface/TurnInfoRes/TurnInfoResInterface";
import { ErrorLogger, Logger } from "../Logger/logger";
import { BOT_ACTION } from "../Bot";

const TurnInfoProcessAction = async (Data: any) => {

    const Path = 'TurnInfoProcessAction';

    const { TURN_INFO, ROUND_START, UNO_HIGHLIGHT } = CONSTANTS.EVENTS_NAME;
    const { LOCK, TABLES } = CONSTANTS.REDIS_COLLECTION;

    const TablelockId = `${LOCK}:${TABLES}:${Data?.tableId}`;

    const Tablelock = await ApplyLock(Path, TablelockId);

    try {

        await Logger("TurnInfoProcessAction", JSON.stringify(Data));

        const CONFIG = Config();

        let TableDetails = await GetTable(Data?.tableId);

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

        let UserInTableDetails = await GetUserInTable(TableDetails.playersArray[TableDetails.currentTurn]?.userId);

        if (!UserInTableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_IN_TABLE_NOT_FOUND) };

        const isThrowPossibleData = await GAME_ACTIONS.IsThrowPossible(UserInTableDetails, TableDetails);

        if (isThrowPossibleData === undefined) { throw new Error(CONSTANTS.ERROR_MESSAGES.IS_POSSIBLE_THROW_ERROR); };

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

            isThrowPossible: isThrowPossibleData.isThrowPossible,
            throwPossibleCards: isThrowPossibleData.throwPossibleCards,

            totalTime: CONFIG.GamePlay.USER_TURN_TIMER,
            remainingTime: CONFIG.GamePlay.USER_TURN_TIMER

        };

        await AllUserScore(TableDetails.tableId);

        await BullTimer.AddJob.UserTurn(TableDetails.tableId, TableDetails.currentTurn);

        EventEmitter.emit(TURN_INFO, { en: TURN_INFO, RoomId: TableDetails.tableId, Data: TurnInfoResData });

        if (isThrowPossibleData.isThrowPossible && UserInTableDetails.cardArray.length === 2) {

            const UnoHighlightResData = {

                userId: UserInTableDetails.userId,
                tableId: UserInTableDetails.tableId,
                seatIndex: UserInTableDetails.seatIndex,

            };

            EventEmitter.emit(UNO_HIGHLIGHT, { en: UNO_HIGHLIGHT, RoomId: TableDetails.tableId, Data: UnoHighlightResData });
        };

        if (TableDetails.disconnectedUsers.length) { await GAME_ACTIONS.RemoveDisconnectedUsers(TableDetails.tableId); };

        if (TableDetails.playersArray[TableDetails.currentTurn].isBot) {

            const RoundJob = await BullTimer.CheckJob.CheckRound(TableDetails.tableId);
            let RemainingRoundTimer: any = 0;
            if (RoundJob) { RemainingRoundTimer = await GAME_ACTIONS.RemainTimeCalculation(RoundJob); };


            let nextTurn: any = null;
            if (TableDetails.isClockwise) {

                nextTurn = await GAME_ACTIONS.ClockWiseTurnChange(TableDetails);

                if (nextTurn === undefined) { throw new Error(CONSTANTS.ERROR_MESSAGES.TURN_CHANGE_ERROR) };
                // if (!nextTurn && nextTurn !== 0) { throw new Error(CONSTANTS.ERROR_MESSAGES.TURN_CHANGE_ERROR) };

            } else {

                nextTurn = await GAME_ACTIONS.AntiClockWiseTurnChange(TableDetails);

                if (nextTurn === undefined) { throw new Error(CONSTANTS.ERROR_MESSAGES.TURN_CHANGE_ERROR) };
                // if (!nextTurn && nextTurn !== 0) { throw new Error(CONSTANTS.ERROR_MESSAGES.TURN_CHANGE_ERROR) };

            };
            const UserAvailableInTable: any = TableDetails.playersArray.find((e: any) => { return e.seatIndex === nextTurn });

            let nextPlayerUserInTableDetails = await GetUserInTable(UserAvailableInTable.userId);

            if (UserInTableDetails.cardArray.length < nextPlayerUserInTableDetails.cardArray.length && RemainingRoundTimer < CONFIG.GamePlay.USER_TURN_TIMER && TableDetails.botPriority === CONSTANTS.BOT_PRIORITY.HARD) {

                // Search for draw 4 card
                let card_bot_w4c = UserInTableDetails.cardArray.filter(item => new RegExp("D4C-", 'i').test(item));

                // Search for wild card
                let card_bot_wild = UserInTableDetails.cardArray.filter(item => new RegExp("W-CH", 'i').test(item));
                let lastRemainingRoundTimer = RemainingRoundTimer - 5;
                if (card_bot_w4c.length > 0 && lastRemainingRoundTimer > 5) {
                    await BullTimer.AddJob.BotTurn({ delayNumber: lastRemainingRoundTimer, tableId: TableDetails.tableId })
                } else if (card_bot_wild.length > 0 && lastRemainingRoundTimer > 5) {
                    await BullTimer.AddJob.BotTurn({ delayNumber: lastRemainingRoundTimer, tableId: TableDetails.tableId })
                } else if (UserInTableDetails.cardArray.length === 1) {
                    let isPlayableCard = false, playableCard = '';

                    for (let i = 0; i < UserInTableDetails.cardArray.length; i++) {
                        if (UserInTableDetails.cardArray[i].split("-")[1] === TableDetails.activeCardType || UserInTableDetails.cardArray[i].split("-")[0] === TableDetails.activeCardColor) {
                            playableCard = UserInTableDetails.cardArray[i];
                            isPlayableCard = true;
                            break;
                        };
                    };
                    if (isPlayableCard) {
                        await BullTimer.AddJob.BotTurn({ delayNumber: 2, tableId: TableDetails.tableId })
                    }

                }

            } else {
                await BullTimer.AddJob.BotTurn({ delayNumber: 2, tableId: TableDetails.tableId })
            }


        };

    } catch (error: any) {

        await ErrorLogger('TurnInfoProcessAction Error : ', error);

    } finally {

        await RemoveLock(Path, Tablelock);

    };
};

export { TurnInfoProcessAction };
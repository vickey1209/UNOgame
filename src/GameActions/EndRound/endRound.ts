import { CheckUserScore } from "../../AllUserScore/allUserScore";
import { BullTimer } from "../../BullTimer";
import { Config } from "../../Config";
import { EventEmitter } from "../../Connection/emitter";
import { CONSTANTS } from "../../Constants";
import { GetRoundHistory, GetTable, GetUserInTable, SetRoundHistory, SetTable, SetUserInTable } from "../../GameRedisOperations/gameRedisOperations";
import { ErrorLogger, Logger } from "../../Logger/logger";
import { Win } from "../../Win/win";

const EndRound = async (tableId: string, isRoundTimeEnd: boolean, delayNumber: number) => {

    try {

        await Logger("EndRound", JSON.stringify({ tableId, isRoundTimeEnd, delayNumber }));

        const CONFIG = Config();

        const { ROUND_SCORE, TIMES_UP } = CONSTANTS.EVENTS_NAME;

        let TableDetails = await GetTable(tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        if (TableDetails.isWinning) { throw new Error(CONSTANTS.ERROR_MESSAGES.WINNING_DONE) };

        await BullTimer.CancelJob.CancelRound(TableDetails.tableId);
        await BullTimer.CancelJob.CancelTurnInfo(TableDetails.tableId);
        await BullTimer.CancelJob.CancelUserTurn(TableDetails.tableId, TableDetails.currentTurn);

        let RoundScoreArray: any = [], AllRoundScore: any = [];

        const RoundHistoryDetails = await GetRoundHistory(TableDetails.tableId);

        if (RoundHistoryDetails) { AllRoundScore = RoundHistoryDetails };

        for (let i = 0; i < TableDetails.playersArray.length; i++) {

            const { userId, userName, userProfile, isLeave, seatIndex } = TableDetails.playersArray[i];

            let UserInTableDetails = await GetUserInTable(TableDetails.playersArray[i].userId);

            if (!UserInTableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_IN_TABLE_NOT_FOUND) };

            const Score = await CheckUserScore(UserInTableDetails);

            if (!Score) { throw new Error(CONSTANTS.ERROR_MESSAGES.CHECK_SCORE_ERROR) };

            UserInTableDetails.userScore = Score.totalScore;
            UserInTableDetails.isUnoClick = false;
            UserInTableDetails.cardArray = [];
            UserInTableDetails.lastPickCard = '';

            RoundScoreArray.push({ userId, userName, userProfile, isLeave, seatIndex, userScore: Score.currentRoundScore, currentRound: TableDetails.currentRound, ...Score });

            await SetUserInTable(UserInTableDetails.userId, UserInTableDetails);

        };

        RoundScoreArray = RoundScoreArray.sort((a: any, b: any) => { return b.userScore - a.userScore; }).sort((a: any, b: any) => { return a.isLeave - b.isLeave; });

        AllRoundScore.push({ roundScore: RoundScoreArray });

        await SetRoundHistory(TableDetails.tableId, AllRoundScore);

        TableDetails.isLeaveLock = true;
        TableDetails.isRoundStart = false;
        TableDetails.isScoreScreen = true;

        await SetTable(TableDetails.tableId, TableDetails);

        const PlayersAvailableInTable = TableDetails.playersArray.filter(player => { return player.isLeave === false });

        if (TableDetails.currentRound === CONFIG.GamePlay.TOTAL_ROUND_NUMBER || PlayersAvailableInTable.length < 2) {
            // if (TableDetails.currentRound === CONFIG.GamePlay.TOTAL_ROUND_NUMBER) {

            if (isRoundTimeEnd) {

                EventEmitter.emit(TIMES_UP, { en: TIMES_UP, RoomId: TableDetails.tableId, Data: {} });

                await Win(TableDetails.tableId, (CONFIG.GamePlay.DELAY_FOR_TIMES_UP + delayNumber));

            } else {

                await Win(TableDetails.tableId, delayNumber);

            };

        } else if (isRoundTimeEnd) {

            EventEmitter.emit(TIMES_UP, { en: TIMES_UP, RoomId: TableDetails.tableId, Data: {} });

            await BullTimer.AddJob.RoundScoreDelay(TableDetails.tableId, (CONFIG.GamePlay.DELAY_FOR_TIMES_UP + delayNumber));

        } else {

            await BullTimer.AddJob.RoundScoreDelay(TableDetails.tableId, delayNumber);

            // await BullTimer.AddJob.NextRound(TableDetails.tableId);

            // EventEmitter.emit(ROUND_SCORE, { en: ROUND_SCORE, RoomId: TableDetails.tableId, Data: { roundScreenTimer: CONFIG.GamePlay.NEXT_ROUND_TIMER, allRoundScore: AllRoundScore } });

        };

    } catch (error: any) {
        await ErrorLogger('EndRound Error : ', error);
    };
};

export { EndRound };
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EndRound = void 0;
const allUserScore_1 = require("../../AllUserScore/allUserScore");
const BullTimer_1 = require("../../BullTimer");
const Config_1 = require("../../Config");
const emitter_1 = require("../../Connection/emitter");
const Constants_1 = require("../../Constants");
const gameRedisOperations_1 = require("../../GameRedisOperations/gameRedisOperations");
const logger_1 = require("../../Logger/logger");
const win_1 = require("../../Win/win");
const EndRound = (tableId, isRoundTimeEnd) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, logger_1.Logger)("EndRound", JSON.stringify({ tableId }));
        const CONFIG = (0, Config_1.Config)();
        const { ROUND_SCORE, TIMES_UP } = Constants_1.CONSTANTS.EVENTS_NAME;
        let TableDetails = yield (0, gameRedisOperations_1.GetTable)(tableId);
        if (!TableDetails) {
            throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND);
        }
        ;
        if (TableDetails.isWinning) {
            throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.WINNING_DONE);
        }
        ;
        yield BullTimer_1.BullTimer.CancelJob.CancelRound(TableDetails.tableId);
        yield BullTimer_1.BullTimer.CancelJob.CancelTurnInfo(TableDetails.tableId);
        yield BullTimer_1.BullTimer.CancelJob.CancelUserTurn(TableDetails.tableId, TableDetails.currentTurn);
        let RoundScoreArray = [], RoundWiseScore = [];
        let AllRoundScore = [];
        const RoundHistoryDetails = yield (0, gameRedisOperations_1.GetRoundHistory)(TableDetails.tableId);
        if (RoundHistoryDetails) {
            AllRoundScore = RoundHistoryDetails;
        }
        ;
        // if (RoundHistoryDetails) { RoundScoreArray = RoundHistoryDetails };
        // if (RoundHistoryDetails) { RoundWiseScore = RoundHistoryDetails };
        for (let i = 0; i < TableDetails.playersArray.length; i++) {
            // const { currentRound } = TableDetails
            // const { userId, userName, userProfile, isLeave } = TableDetails.playersArray[i];
            // let UserInTableDetails: UserInTableInterface = await GetUserInTable(TableDetails.playersArray[i].userId);
            // if (!UserInTableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_IN_TABLE_NOT_FOUND) };
            // const Score = await CheckUserScore(UserInTableDetails);
            // if (!Score) { throw new Error(CONSTANTS.ERROR_MESSAGES.CHECK_SCORE_ERROR) };
            // UserInTableDetails.userScore += (-Math.abs(Score.totalScore));
            // const { userScore } = UserInTableDetails;
            // // const { cardArray, userScore } = UserInTableDetails;
            // RoundScoreArray.push({ userId, userName, userProfile, isLeave, userScore, currentRound, ...Score });
            // // RoundScoreArray.push({ userId, userName, userProfile, isLeave, userScore, cardArray });
            // // RoundWiseScore.push({ userId, roundScore: (-Math.abs(Score.totalScore)), currentRound: TableDetails.currentRound });
            // await SetUserInTable(UserInTableDetails.userId, UserInTableDetails);
            const { currentRound } = TableDetails;
            const { userId, userName, userProfile, isLeave, seatIndex } = TableDetails.playersArray[i];
            let UserInTableDetails = yield (0, gameRedisOperations_1.GetUserInTable)(TableDetails.playersArray[i].userId);
            if (!UserInTableDetails) {
                throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.USER_IN_TABLE_NOT_FOUND);
            }
            ;
            const Score = yield (0, allUserScore_1.CheckUserScore)(UserInTableDetails);
            if (!Score) {
                throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.CHECK_SCORE_ERROR);
            }
            ;
            // UserInTableDetails.userScore += Math.abs(Score.totalScore)
            UserInTableDetails.userScore += (-Math.abs(Score.totalScore));
            const { userScore } = UserInTableDetails;
            RoundScoreArray.push(Object.assign({ userId, userName, userProfile, isLeave, seatIndex, userScore, currentRound }, Score));
            yield (0, gameRedisOperations_1.SetUserInTable)(UserInTableDetails.userId, UserInTableDetails);
        }
        ;
        RoundScoreArray = RoundScoreArray.sort((a, b) => { return b.userScore - a.userScore; }).sort((a, b) => { return a.isLeave - b.isLeave; });
        AllRoundScore.push({ roundScore: RoundScoreArray });
        yield (0, gameRedisOperations_1.SetRoundHistory)(TableDetails.tableId, AllRoundScore);
        TableDetails.isLeaveLock = true;
        TableDetails.isRoundStart = false;
        TableDetails.isScoreScreen = true;
        yield (0, gameRedisOperations_1.SetTable)(TableDetails.tableId, TableDetails);
        // if (TableDetails.currentRound === CONFIG.GamePlay.TOTAL_ROUND_NUMBER) {
        //     console.log('3 Round Done !!');
        //     console.log('3 Round Done !!');
        //     console.log('3 Round Done !!');
        //     console.log('3 Round Done !!');
        //     console.log('3 Round Done !!');
        //     console.log('3 Round Done !!');
        //     // console.log({ RoundScoreArray });
        //     await Win(TableDetails.tableId);
        // } else {
        //     await BullTimer.AddJob.NextRound(TableDetails.tableId);
        //     EventEmitter.emit(ROUND_SCORE, { en: ROUND_SCORE, RoomId: TableDetails.tableId, Data: { roundScreenTimer: CONFIG.GamePlay.NEXT_ROUND_TIMER, AllRoundScore } });
        //     // EventEmitter.emit(ROUND_SCORE, { en: ROUND_SCORE, RoomId: TableDetails.tableId, Data: { roundScore: RoundScoreArray } });
        // };
        if (TableDetails.currentRound === CONFIG.GamePlay.TOTAL_ROUND_NUMBER) {
            yield (0, win_1.Win)(TableDetails.tableId);
        }
        else if (isRoundTimeEnd) {
            yield BullTimer_1.BullTimer.AddJob.TimesUp(TableDetails.tableId);
            emitter_1.EventEmitter.emit(TIMES_UP, { en: TIMES_UP, RoomId: TableDetails.tableId, Data: {} });
        }
        else {
            yield BullTimer_1.BullTimer.AddJob.NextRound(TableDetails.tableId);
            emitter_1.EventEmitter.emit(ROUND_SCORE, { en: ROUND_SCORE, RoomId: TableDetails.tableId, Data: { roundScreenTimer: CONFIG.GamePlay.NEXT_ROUND_TIMER, AllRoundScore } });
        }
        ;
    }
    catch (error) {
        (0, logger_1.Logger)('EndRound Error : ', error);
    }
    ;
});
exports.EndRound = EndRound;

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
exports.Win = void 0;
const allUserScore_1 = require("../AllUserScore/allUserScore");
const BullTimer_1 = require("../BullTimer");
const emitter_1 = require("../Connection/emitter");
const Constants_1 = require("../Constants");
const gameRedisOperations_1 = require("../GameRedisOperations/gameRedisOperations");
const logger_1 = require("../Logger/logger");
const Win = (tableId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, logger_1.Logger)("Win", JSON.stringify({ tableId }));
        const { WINNER_DECLARE } = Constants_1.CONSTANTS.EVENTS_NAME;
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
        let CurrentRoundScoreArray = [];
        for (let i = 0; i < TableDetails.playersArray.length; i++) {
            const { userId, userName, userProfile, isLeave } = TableDetails.playersArray[i];
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
            const { userScore } = UserInTableDetails;
            CurrentRoundScoreArray.push({ userId, userName, userProfile, userScore, isLeave });
        }
        ;
        CurrentRoundScoreArray = CurrentRoundScoreArray.sort((a, b) => { return b.userScore - a.userScore; }).sort((a, b) => { return a.isLeave - b.isLeave; });
        let FinalArray = [], rankNumber = 1, lastScore = 0; /* , price = 0, RoundWiseScoreArray: any = [], previousScore: any = []; */
        for (let i = 0; i < CurrentRoundScoreArray.length; i++) { // ^ For ...
            if (i === 0) {
                lastScore = CurrentRoundScoreArray[i].userScore;
            }
            ;
            if (lastScore === CurrentRoundScoreArray[i].userScore && rankNumber <= 2) {
                // if (lastScore === CurrentRoundScoreArray[i].userScore) {
                FinalArray.push(Object.assign(Object.assign({}, CurrentRoundScoreArray[i]), { rankNumber, price: 0, previousScore: [] }));
            }
            else {
                rankNumber += 1;
                lastScore = CurrentRoundScoreArray[i].userScore;
                FinalArray.push(Object.assign(Object.assign({}, CurrentRoundScoreArray[i]), { rankNumber, price: 0, previousScore: [] }));
            }
            ;
        }
        ;
        let UserWiseRoundHistory = [];
        let RoundHistoryDetails = yield (0, gameRedisOperations_1.GetRoundHistory)(TableDetails.tableId);
        for (let i = 0; i < RoundHistoryDetails.length; i++) {
            for (let k = 0; k < RoundHistoryDetails[i].roundScore.length; k++) {
                UserWiseRoundHistory.push(RoundHistoryDetails[i].roundScore[k]);
            }
            ;
        }
        ;
        if (UserWiseRoundHistory.length) {
            for (let i = 0; i < FinalArray.length; i++) {
                const OneUser = UserWiseRoundHistory.filter((e) => { var _a; return e.userId === ((_a = FinalArray[i]) === null || _a === void 0 ? void 0 : _a.userId); });
                OneUser.forEach((element) => { var _a; (_a = FinalArray[i]) === null || _a === void 0 ? void 0 : _a.previousScore.push(element === null || element === void 0 ? void 0 : element.totalScore); });
            }
            ;
        }
        ;
        emitter_1.EventEmitter.emit(WINNER_DECLARE, { en: WINNER_DECLARE, RoomId: TableDetails.tableId, Data: { winningArray: FinalArray } });
    }
    catch (error) {
        (0, logger_1.Logger)('Win Error : ', error);
    }
    ;
});
exports.Win = Win;

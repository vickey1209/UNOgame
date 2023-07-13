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
exports.CheckUserScore = exports.AllUserScore = void 0;
const Config_1 = require("../Config");
const emitter_1 = require("../Connection/emitter");
const Constants_1 = require("../Constants");
const gameRedisOperations_1 = require("../GameRedisOperations/gameRedisOperations");
const logger_1 = require("../Logger/logger");
const AllUserScore = (tableId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, logger_1.Logger)("AllUserScore", JSON.stringify({ tableId }));
        const { USERS_SCORE } = Constants_1.CONSTANTS.EVENTS_NAME;
        let ScoreResData = { allUserScore: [] };
        let TableDetails = yield (0, gameRedisOperations_1.GetTable)(tableId);
        if (!TableDetails) {
            throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND);
        }
        ;
        for (let i = 0; i < TableDetails.playersArray.length; i++) {
            let UserInTableDetails = yield (0, gameRedisOperations_1.GetUserInTable)(TableDetails.playersArray[i].userId);
            if (!UserInTableDetails) {
                throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.USER_IN_TABLE_NOT_FOUND);
            }
            ;
            const Score = yield CheckUserScore(UserInTableDetails);
            if (!Score) {
                throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.CHECK_SCORE_ERROR);
            }
            ;
            ScoreResData.allUserScore.push({ userScore: Math.abs(Score.totalScore), seatIndex: UserInTableDetails.seatIndex, cardsLength: UserInTableDetails.cardArray.length });
        }
        ;
        emitter_1.EventEmitter.emit(USERS_SCORE, { en: USERS_SCORE, RoomId: TableDetails.tableId, Data: ScoreResData });
    }
    catch (error) {
        (0, logger_1.Logger)('AllUserScore Error : ', error);
    }
    ;
});
exports.AllUserScore = AllUserScore;
const CheckUserScore = (UserInTableDetails) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, logger_1.Logger)("CheckUserScore", JSON.stringify({ UserInTableDetails }));
        const CONFIG = (0, Config_1.Config)();
        // let totalScore = 0,
        //     simpleCardsPoint = 0, specialCardsPoint = 0, wildColorChangePoints = 0, wildPlusFourPoints = 0,
        //     simpleCards = [], specialCards = [], wildColorChangeCards = [], wildPlusFourCards = [];
        // for (let i = 0; i < UserInTableDetails.cardArray.length; i++) {
        //     if (UserInTableDetails.cardArray[i].split("-")[1] === CONSTANTS.UNO_CARDS.CARDS_TYPE.PLUS_FOUR) {
        //         totalScore += CONFIG.GamePlay.PUSE_FOUR_POINT;
        //         wildPlusFourPoints += CONFIG.GamePlay.PUSE_FOUR_POINT;
        //         // specialCardsPoint += CONFIG.GamePlay.PUSE_FOUR_POINT;
        //         // specialCards.push(UserInTableDetails.cardArray[i]);
        //         wildPlusFourCards.push(UserInTableDetails.cardArray[i]);
        //     } else if (UserInTableDetails.cardArray[i].split("-")[1] === CONSTANTS.UNO_CARDS.CARDS_TYPE.COLOR_CHANGE) {
        //         totalScore += CONFIG.GamePlay.COLOR_CHANGE_POINT;
        //         wildColorChangePoints += CONFIG.GamePlay.COLOR_CHANGE_POINT;
        //         // specialCardsPoint += CONFIG.GamePlay.COLOR_CHANGE_POINT;
        //         // specialCards.push(UserInTableDetails.cardArray[i]);
        //         wildColorChangeCards.push(UserInTableDetails.cardArray[i]);
        //     } else if (UserInTableDetails.cardArray[i].split("-")[1] === CONSTANTS.UNO_CARDS.CARDS_TYPE.PLUS_TWO) {
        //         totalScore += CONFIG.GamePlay.PUSE_TWO_POINT;
        //         specialCardsPoint += CONFIG.GamePlay.PUSE_TWO_POINT;
        //         specialCards.push(UserInTableDetails.cardArray[i]);
        //     } else if (UserInTableDetails.cardArray[i].split("-")[1] === CONSTANTS.UNO_CARDS.CARDS_TYPE.REVERS) {
        //         totalScore += CONFIG.GamePlay.REVERS_POINT;
        //         specialCardsPoint += CONFIG.GamePlay.REVERS_POINT;
        //         specialCards.push(UserInTableDetails.cardArray[i]);
        //     } else if (UserInTableDetails.cardArray[i].split("-")[1] === CONSTANTS.UNO_CARDS.CARDS_TYPE.SKIP) {
        //         totalScore += CONFIG.GamePlay.SKIP_POINT;
        //         specialCardsPoint += CONFIG.GamePlay.SKIP_POINT;
        //         specialCards.push(UserInTableDetails.cardArray[i]);
        //     } else if (UserInTableDetails.cardArray[i].split("-")[1] === CONSTANTS.UNO_CARDS.CARDS_TYPE.ZERO) {
        //         totalScore += CONFIG.GamePlay.ZERO_POINT;
        //         simpleCardsPoint += CONFIG.GamePlay.ZERO_POINT;
        //         simpleCards.push(UserInTableDetails.cardArray[i]);
        //     } else {
        //         totalScore += Number(UserInTableDetails.cardArray[i].split("-")[1]);
        //         simpleCardsPoint += Number(UserInTableDetails.cardArray[i].split("-")[1]);
        //         simpleCards.push(UserInTableDetails.cardArray[i]);
        //     };
        // };
        // return { totalScore, simpleCardsPoint, specialCardsPoint, wildColorChangePoints, wildPlusFourPoints, simpleCards, specialCards, wildColorChangeCards, wildPlusFourCards };
        let totalScore = 0, simple = { Cards: [], Score: 0 }, zero = { Cards: [], Score: 0 }, special = { Cards: [], Score: 0 }, wildColorChange = { Cards: [], Score: 0 }, wildPlusFour = { Cards: [], Score: 0 };
        for (let i = 0; i < UserInTableDetails.cardArray.length; i++) {
            if (UserInTableDetails.cardArray[i].split("-")[1] === Constants_1.CONSTANTS.UNO_CARDS.CARDS_TYPE.PLUS_FOUR) {
                totalScore += CONFIG.GamePlay.PUSE_FOUR_POINT;
                wildPlusFour.Score += CONFIG.GamePlay.PUSE_FOUR_POINT;
                wildPlusFour.Cards.push(UserInTableDetails.cardArray[i]);
            }
            else if (UserInTableDetails.cardArray[i].split("-")[1] === Constants_1.CONSTANTS.UNO_CARDS.CARDS_TYPE.COLOR_CHANGE) {
                totalScore += CONFIG.GamePlay.COLOR_CHANGE_POINT;
                wildColorChange.Score += CONFIG.GamePlay.COLOR_CHANGE_POINT;
                wildColorChange.Cards.push(UserInTableDetails.cardArray[i]);
            }
            else if (UserInTableDetails.cardArray[i].split("-")[1] === Constants_1.CONSTANTS.UNO_CARDS.CARDS_TYPE.PLUS_TWO) {
                totalScore += CONFIG.GamePlay.PUSE_TWO_POINT;
                special.Score += CONFIG.GamePlay.PUSE_TWO_POINT;
                special.Cards.push(UserInTableDetails.cardArray[i]);
            }
            else if (UserInTableDetails.cardArray[i].split("-")[1] === Constants_1.CONSTANTS.UNO_CARDS.CARDS_TYPE.REVERS) {
                totalScore += CONFIG.GamePlay.REVERS_POINT;
                special.Score += CONFIG.GamePlay.REVERS_POINT;
                special.Cards.push(UserInTableDetails.cardArray[i]);
            }
            else if (UserInTableDetails.cardArray[i].split("-")[1] === Constants_1.CONSTANTS.UNO_CARDS.CARDS_TYPE.SKIP) {
                totalScore += CONFIG.GamePlay.SKIP_POINT;
                special.Score += CONFIG.GamePlay.SKIP_POINT;
                special.Cards.push(UserInTableDetails.cardArray[i]);
            }
            else if (UserInTableDetails.cardArray[i].split("-")[1] === Constants_1.CONSTANTS.UNO_CARDS.CARDS_TYPE.ZERO) {
                totalScore += CONFIG.GamePlay.ZERO_POINT;
                zero.Score += CONFIG.GamePlay.ZERO_POINT;
                zero.Cards.push(UserInTableDetails.cardArray[i]);
            }
            else {
                totalScore += Number(UserInTableDetails.cardArray[i].split("-")[1]);
                simple.Score += Number(UserInTableDetails.cardArray[i].split("-")[1]);
                simple.Cards.push(UserInTableDetails.cardArray[i]);
            }
            ;
        }
        ;
        totalScore = -Math.abs(totalScore);
        return { totalScore, simple, special, zero, wildColorChange, wildPlusFour };
    }
    catch (error) {
        (0, logger_1.Logger)('CheckUserScore Error : ', error);
    }
    ;
});
exports.CheckUserScore = CheckUserScore;

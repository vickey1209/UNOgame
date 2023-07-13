"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GAME_ACTIONS = void 0;
const distributeCards_1 = require("./DistributeCards/distributeCards");
const endRound_1 = require("./EndRound/endRound");
const isShufflePossible_1 = require("./IsShufflePossible/isShufflePossible");
const isThrowPossible_1 = require("./IsThrowPossible/isThrowPossible");
const plusFour_1 = require("./PlusFour/plusFour");
const plusTwo_1 = require("./PlusTwo/plusTwo");
const randomNumber_1 = require("./RandomNumber/randomNumber");
const remainTimeCalculation_1 = require("./RemainTimeCalculation/remainTimeCalculation");
const shuffleArray_1 = require("./ShuffleArray/shuffleArray");
const skip_1 = require("./Skip/skip");
const turnChange_1 = require("./TurnChange/turnChange");
const GAME_ACTIONS = {
    RandomNumber: randomNumber_1.RandomNumber,
    DistributeCards: distributeCards_1.DistributeCards,
    ShuffleArray: shuffleArray_1.ShuffleArray,
    ClockWiseTurnChange: turnChange_1.ClockWiseTurnChange,
    AntiClockWiseTurnChange: turnChange_1.AntiClockWiseTurnChange,
    RemainTimeCalculation: remainTimeCalculation_1.RemainTimeCalculation,
    Skip: skip_1.Skip,
    PlusTwo: plusTwo_1.PlusTwo,
    PlusFour: plusFour_1.PlusFour,
    EndRound: endRound_1.EndRound,
    IsShufflePossible: isShufflePossible_1.IsShufflePossible,
    IsThrowPossible: isThrowPossible_1.IsThrowPossible,
};
exports.GAME_ACTIONS = GAME_ACTIONS;

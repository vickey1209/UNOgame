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
exports.IsShufflePossible = void 0;
const __1 = require("..");
const Constants_1 = require("../../Constants");
const gameRedisOperations_1 = require("../../GameRedisOperations/gameRedisOperations");
const logger_1 = require("../../Logger/logger");
const IsShufflePossible = (tableId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, logger_1.Logger)("IsShufflePossible", JSON.stringify({ tableId }));
        let TableDetails = yield (0, gameRedisOperations_1.GetTable)(tableId);
        if (!TableDetails) {
            throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND);
        }
        ;
        let isShuffle = true;
        let cardsForCloseDeckArray = TableDetails.openCardDeck.splice(0, TableDetails.openCardDeck.length - 1);
        if (cardsForCloseDeckArray.length < 1) {
            isShuffle = false;
        }
        else {
            cardsForCloseDeckArray = yield __1.GAME_ACTIONS.ShuffleArray(cardsForCloseDeckArray);
        }
        ;
        return { isShuffle, cardsForCloseDeckArray, cardsForOpenDeckArray: TableDetails.openCardDeck };
    }
    catch (error) {
        (0, logger_1.Logger)('IsShufflePossible Error : ', error);
    }
    ;
});
exports.IsShufflePossible = IsShufflePossible;

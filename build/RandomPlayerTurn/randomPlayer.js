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
exports.RandomPlayerTurn = void 0;
const BullTimer_1 = require("../BullTimer");
const Constants_1 = require("../Constants");
const GameActions_1 = require("../GameActions");
const gameRedisOperations_1 = require("../GameRedisOperations/gameRedisOperations");
const logger_1 = require("../Logger/logger");
const RandomPlayerTurn = (tableId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, logger_1.Logger)('RandomPlayerTurn', JSON.stringify({ tableId }));
        let isSkip = false, skipSeatIndex = -1, isRevers = false;
        let TableDetails = yield (0, gameRedisOperations_1.GetTable)(tableId);
        if (!TableDetails) {
            throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND);
        }
        ;
        const RandomPlayerSelect = yield GameActions_1.GAME_ACTIONS.RandomNumber(0, (TableDetails.playersArray.length - 1));
        TableDetails.isTurnLock = true;
        TableDetails.currentTurn = RandomPlayerSelect;
        yield (0, gameRedisOperations_1.SetTable)(TableDetails.tableId, TableDetails);
        // await BullTimer.AddJob.TurnInfo(TableDetails.tableId, isSkip, skipSeatIndex, isRevers, 1);
        yield BullTimer_1.BullTimer.AddJob.TurnInfo(TableDetails.tableId, isSkip, skipSeatIndex, isRevers, 5);
    }
    catch (error) {
        (0, logger_1.Logger)('RandomPlayerTurn Error : ', error);
    }
    ;
});
exports.RandomPlayerTurn = RandomPlayerTurn;

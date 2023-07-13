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
exports.Skip = void 0;
const __1 = require("..");
const Constants_1 = require("../../Constants");
const gameRedisOperations_1 = require("../../GameRedisOperations/gameRedisOperations");
const logger_1 = require("../../Logger/logger");
const Skip = (tableId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, logger_1.Logger)("Skip", JSON.stringify({ tableId }));
        let isSkip = false, skipSeatIndex = -1, nextTurnSeatIndex = -1;
        let TableDetails = yield (0, gameRedisOperations_1.GetTable)(tableId);
        if (!TableDetails) {
            throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND);
        }
        ;
        if (TableDetails.isClockwise) {
            let NextTurn = yield __1.GAME_ACTIONS.ClockWiseTurnChange(TableDetails);
            if (!NextTurn && NextTurn !== 0) {
                throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.TURN_CHANGE_ERROR);
            }
            ;
            TableDetails.currentTurn = NextTurn;
            skipSeatIndex = NextTurn;
            NextTurn = yield __1.GAME_ACTIONS.ClockWiseTurnChange(TableDetails);
            if (!NextTurn && NextTurn !== 0) {
                throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.TURN_CHANGE_ERROR);
            }
            ;
            TableDetails.currentTurn = NextTurn;
            isSkip = true;
            nextTurnSeatIndex = NextTurn;
        }
        else {
            let NextTurn = yield __1.GAME_ACTIONS.AntiClockWiseTurnChange(TableDetails);
            if (!NextTurn && NextTurn !== 0) {
                throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.TURN_CHANGE_ERROR);
            }
            ;
            TableDetails.currentTurn = NextTurn;
            skipSeatIndex = NextTurn;
            NextTurn = yield __1.GAME_ACTIONS.AntiClockWiseTurnChange(TableDetails);
            if (!NextTurn && NextTurn !== 0) {
                throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.TURN_CHANGE_ERROR);
            }
            ;
            TableDetails.currentTurn = NextTurn;
            isSkip = true;
            nextTurnSeatIndex = NextTurn;
        }
        ;
        return { isSkip, skipSeatIndex, nextTurnSeatIndex };
    }
    catch (error) {
        (0, logger_1.Logger)('Skip Error : ', error);
    }
    ;
});
exports.Skip = Skip;

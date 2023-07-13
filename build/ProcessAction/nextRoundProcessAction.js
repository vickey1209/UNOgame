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
exports.NextRoundProcessAction = void 0;
const redlock_1 = require("../Connection/redlock");
const Constants_1 = require("../Constants");
const GameActions_1 = require("../GameActions");
const gameRedisOperations_1 = require("../GameRedisOperations/gameRedisOperations");
const logger_1 = require("../Logger/logger");
const NextRoundProcessAction = (Data) => __awaiter(void 0, void 0, void 0, function* () {
    const Path = 'NextRoundProcessAction';
    const { LOCK, TABLES } = Constants_1.CONSTANTS.REDIS_COLLECTION;
    const TablelockId = `${LOCK}:${TABLES}:${Data === null || Data === void 0 ? void 0 : Data.tableId}`;
    const Tablelock = yield (0, redlock_1.ApplyLock)(Path, TablelockId);
    try {
        (0, logger_1.Logger)("NextRoundProcessAction", JSON.stringify(Data));
        const tableId = Data === null || Data === void 0 ? void 0 : Data.tableId;
        if (!tableId) {
            throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.BULL_DATA_NOT_FOUND);
        }
        ;
        let TableDetails = yield (0, gameRedisOperations_1.GetTable)(tableId);
        if (!TableDetails) {
            throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND);
        }
        ;
        if (TableDetails.isWinning) {
            throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.WINNING_DONE);
        }
        ;
        for (let i = 0; i < TableDetails.playersArray.length; i++) {
            let UserInTableDetails = yield (0, gameRedisOperations_1.GetUserInTable)(TableDetails.playersArray[i].userId);
            if (!UserInTableDetails) {
                throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.USER_IN_TABLE_NOT_FOUND);
            }
            ;
            UserInTableDetails.cardArray = [];
            UserInTableDetails.lastPickCard = '';
            UserInTableDetails.lastThrowCard = '';
            UserInTableDetails.isUnoClick = false;
            yield (0, gameRedisOperations_1.SetUserInTable)(UserInTableDetails.userId, UserInTableDetails);
        }
        ;
        TableDetails.numberOfCardToPick = 0;
        TableDetails.activeCard = '';
        TableDetails.activeCardType = '';
        TableDetails.activeCardColor = '';
        TableDetails.closeCardDeck = [];
        TableDetails.openCardDeck = [];
        TableDetails.currentRound += 1;
        // TableDetails.isLeaveLock = true;
        TableDetails.isScoreScreen = false;
        yield (0, gameRedisOperations_1.SetTable)(TableDetails.tableId, TableDetails);
        yield GameActions_1.GAME_ACTIONS.DistributeCards(TableDetails.tableId);
    }
    catch (error) {
        (0, logger_1.Logger)('NextRoundProcessAction Error : ', error);
    }
    finally {
        yield (0, redlock_1.RemoveLock)(Path, Tablelock);
    }
    ;
});
exports.NextRoundProcessAction = NextRoundProcessAction;

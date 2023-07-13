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
exports.UnoClickProcessAction = void 0;
const BullTimer_1 = require("../BullTimer");
const Config_1 = require("../Config");
const emitter_1 = require("../Connection/emitter");
const redlock_1 = require("../Connection/redlock");
const Constants_1 = require("../Constants");
const GameActions_1 = require("../GameActions");
const gameRedisOperations_1 = require("../GameRedisOperations/gameRedisOperations");
const logger_1 = require("../Logger/logger");
const UnoClickProcessAction = (Data) => __awaiter(void 0, void 0, void 0, function* () {
    const Path = 'UnoClickProcessAction';
    const { PICK_CARD } = Constants_1.CONSTANTS.EVENTS_NAME;
    const { LOCK, TABLES } = Constants_1.CONSTANTS.REDIS_COLLECTION;
    const TablelockId = `${LOCK}:${TABLES}:${Data === null || Data === void 0 ? void 0 : Data.tableId}`;
    const Tablelock = yield (0, redlock_1.ApplyLock)(Path, TablelockId);
    try {
        (0, logger_1.Logger)("UnoClickProcessAction", JSON.stringify(Data));
        const CONFIG = (0, Config_1.Config)();
        let pickCards = [], isGameEnd = false, isPlayableCard = false;
        let TableDetails = yield (0, gameRedisOperations_1.GetTable)(Data === null || Data === void 0 ? void 0 : Data.tableId);
        if (!TableDetails) {
            throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND);
        }
        ;
        if (TableDetails.isWinning) {
            throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.WINNING_DONE);
        }
        ;
        if (TableDetails.isScoreScreen) {
            throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.ROUND_SCORE_DONE);
        }
        ;
        if (!TableDetails.isTurnLock) {
            throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.UNO_TURN_LOCK_ERROR);
        }
        ;
        const UserAvailableInTable = TableDetails.playersArray.find(e => { return e.seatIndex === (Data === null || Data === void 0 ? void 0 : Data.unoSeatIndex); });
        if (!UserAvailableInTable) {
            throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.WRONG_TABLE);
        }
        ;
        let UserInTableDetails = yield (0, gameRedisOperations_1.GetUserInTable)(UserAvailableInTable === null || UserAvailableInTable === void 0 ? void 0 : UserAvailableInTable.userId);
        if (!UserInTableDetails) {
            throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.USER_IN_TABLE_NOT_FOUND);
        }
        ;
        if (UserInTableDetails.cardArray.length !== 1) {
            throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.NO_UNO_PENALTY);
        }
        ;
        if (UserInTableDetails.isUnoClick) {
            yield BullTimer_1.BullTimer.AddJob.TurnInfo(TableDetails.tableId, Data === null || Data === void 0 ? void 0 : Data.isSkip, Data === null || Data === void 0 ? void 0 : Data.skipSeatIndex, Data === null || Data === void 0 ? void 0 : Data.isRevers, Data === null || Data === void 0 ? void 0 : Data.delayNumber);
        }
        else {
            if (TableDetails.closeCardDeck.length > CONFIG.GamePlay.UNO_PENALTY_NUMBER) {
                for (let i = 0; i < CONFIG.GamePlay.UNO_PENALTY_NUMBER; i++) {
                    UserInTableDetails.cardArray.push(TableDetails.closeCardDeck[0]);
                    pickCards.push(TableDetails.closeCardDeck[0]);
                    TableDetails.closeCardDeck.splice(0, 1);
                }
                ;
            }
            else {
                const IsShufflePossibleData = yield GameActions_1.GAME_ACTIONS.IsShufflePossible(TableDetails.tableId);
                if (!IsShufflePossibleData) {
                    throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.CLOSE_DECK_FILL_ERROR);
                }
                ;
                if (IsShufflePossibleData.isShuffle) {
                    TableDetails.closeCardDeck = IsShufflePossibleData.cardsForCloseDeckArray;
                    TableDetails.openCardDeck = IsShufflePossibleData.cardsForOpenDeckArray;
                }
                else {
                    isGameEnd = true;
                }
                ;
                if (TableDetails.closeCardDeck.length > CONFIG.GamePlay.UNO_PENALTY_NUMBER) {
                    for (let i = 0; i < CONFIG.GamePlay.UNO_PENALTY_NUMBER; i++) {
                        UserInTableDetails.cardArray.push(TableDetails.closeCardDeck[0]);
                        pickCards.push(TableDetails.closeCardDeck[0]);
                        TableDetails.closeCardDeck.splice(0, 1);
                    }
                    ;
                    isGameEnd = false;
                }
                else {
                    isGameEnd = true;
                }
                ;
            }
            ;
            UserInTableDetails.isUnoClick = false;
            yield (0, gameRedisOperations_1.SetUserInTable)(UserInTableDetails.userId, UserInTableDetails);
            yield (0, gameRedisOperations_1.SetTable)(TableDetails.tableId, TableDetails);
            if (isGameEnd) {
                yield GameActions_1.GAME_ACTIONS.EndRound(TableDetails.tableId, false);
            }
            else {
                const { userId, tableId, seatIndex } = UserInTableDetails;
                const PickCardResData = { userId, tableId, seatIndex, pickCards, isPlayableCard };
                emitter_1.EventEmitter.emit(PICK_CARD, { en: PICK_CARD, RoomId: TableDetails.tableId, Data: PickCardResData });
                yield BullTimer_1.BullTimer.AddJob.TurnInfo(TableDetails.tableId, Data === null || Data === void 0 ? void 0 : Data.isSkip, Data === null || Data === void 0 ? void 0 : Data.skipSeatIndex, Data === null || Data === void 0 ? void 0 : Data.isRevers, Data === null || Data === void 0 ? void 0 : Data.delayNumber);
            }
            ;
        }
        ;
    }
    catch (error) {
        (0, logger_1.Logger)('UnoClickProcessAction Error : ', error);
    }
    finally {
        yield (0, redlock_1.RemoveLock)(Path, Tablelock);
    }
    ;
});
exports.UnoClickProcessAction = UnoClickProcessAction;

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
exports.ChangeUserTurn = void 0;
const BullTimer_1 = require("../BullTimer");
const Config_1 = require("../Config");
const Constants_1 = require("../Constants");
const GameActions_1 = require("../GameActions");
const gameRedisOperations_1 = require("../GameRedisOperations/gameRedisOperations");
const logger_1 = require("../Logger/logger");
const ChangeUserTurn = (tableId, isThrow, remainingCardsNumber) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, logger_1.Logger)("ChangeUserTurn", JSON.stringify({ tableId }));
        const CONFIG = (0, Config_1.Config)();
        const { TURN_INFO, ERROR_POPUP } = Constants_1.CONSTANTS.EVENTS_NAME;
        let TableDetails = yield (0, gameRedisOperations_1.GetTable)(tableId);
        if (!TableDetails) {
            throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND);
        }
        ;
        let isSkip = false, skipSeatIndex = -1, isRevers = false, isGameEnd = false, unoSeatIndex = TableDetails.currentTurn;
        if (TableDetails.activeCardType === Constants_1.CONSTANTS.UNO_CARDS.CARDS_TYPE.REVERS && isThrow) { // ^ Revers Card !
            TableDetails.isClockwise = TableDetails.isClockwise ? false : true;
            isRevers = true;
        }
        ;
        if (TableDetails.activeCardType === Constants_1.CONSTANTS.UNO_CARDS.CARDS_TYPE.PLUS_FOUR && isThrow) { // ^ +4 Wild Card !
            const PlusFourData = yield GameActions_1.GAME_ACTIONS.PlusFour(TableDetails.tableId);
            if (!PlusFourData) {
                throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.PLUS_4_ERROR);
            }
            ;
            TableDetails.currentTurn = PlusFourData.nextTurnSeatIndex;
            TableDetails.numberOfCardToPick = PlusFourData.penaltyNumber;
            PlusFourData.pickCards.forEach(element => { TableDetails.closeCardDeck.splice(TableDetails.closeCardDeck.indexOf(element), 1); });
        }
        else if (TableDetails.activeCardType === Constants_1.CONSTANTS.UNO_CARDS.CARDS_TYPE.PLUS_TWO && isThrow) { // ^ +2 Card !
            const PlusTwoData = yield GameActions_1.GAME_ACTIONS.PlusTwo(TableDetails.tableId);
            if (!PlusTwoData) {
                throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.PLUS_2_ERROR);
            }
            ;
            TableDetails.currentTurn = PlusTwoData.nextTurnSeatIndex;
            TableDetails.numberOfCardToPick = PlusTwoData.penaltyNumber;
            PlusTwoData.pickCards.forEach(element => { TableDetails.closeCardDeck.splice(TableDetails.closeCardDeck.indexOf(element), 1); });
        }
        else if (TableDetails.activeCardType === Constants_1.CONSTANTS.UNO_CARDS.CARDS_TYPE.SKIP && isThrow) { // ^ Skip Card !
            const SkipData = yield GameActions_1.GAME_ACTIONS.Skip(TableDetails.tableId);
            if (!SkipData) {
                throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.SKIP_ERROR);
            }
            ;
            TableDetails.currentTurn = SkipData.nextTurnSeatIndex;
            isSkip = SkipData.isSkip;
            skipSeatIndex = SkipData.skipSeatIndex;
        }
        else if (TableDetails.activeCardType === Constants_1.CONSTANTS.UNO_CARDS.CARDS_TYPE.REVERS && isThrow) { // ^ Revers Card !
            const PlayersAvailableInTable = TableDetails.playersArray.filter(player => { return player.isLeave === false; });
            if (PlayersAvailableInTable.length > 2) {
                if (TableDetails.isClockwise) {
                    let NextTurn = yield GameActions_1.GAME_ACTIONS.ClockWiseTurnChange(TableDetails);
                    if (!NextTurn && NextTurn !== 0) {
                        throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.TURN_CHANGE_ERROR);
                    }
                    ;
                    TableDetails.currentTurn = NextTurn;
                }
                else {
                    let NextTurn = yield GameActions_1.GAME_ACTIONS.AntiClockWiseTurnChange(TableDetails);
                    if (!NextTurn && NextTurn !== 0) {
                        throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.TURN_CHANGE_ERROR);
                    }
                    ;
                    TableDetails.currentTurn = NextTurn;
                }
                ;
            }
            ;
        }
        else { // ^ Normal Cards
            if (TableDetails.isClockwise) {
                let NextTurn = yield GameActions_1.GAME_ACTIONS.ClockWiseTurnChange(TableDetails);
                if (!NextTurn && NextTurn !== 0) {
                    throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.TURN_CHANGE_ERROR);
                }
                ;
                TableDetails.currentTurn = NextTurn;
            }
            else {
                let NextTurn = yield GameActions_1.GAME_ACTIONS.AntiClockWiseTurnChange(TableDetails);
                if (!NextTurn && NextTurn !== 0) {
                    throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.TURN_CHANGE_ERROR);
                }
                ;
                TableDetails.currentTurn = NextTurn;
            }
            ;
        }
        ;
        if (TableDetails.closeCardDeck.length < 1) {
            const IsShufflePossibleData = yield GameActions_1.GAME_ACTIONS.IsShufflePossible(TableDetails.tableId);
            if (!IsShufflePossibleData) {
                throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.CLOSE_DECK_FILL_ERROR);
            }
            if (IsShufflePossibleData.isShuffle) {
                TableDetails.closeCardDeck = IsShufflePossibleData.cardsForCloseDeckArray;
                TableDetails.openCardDeck = IsShufflePossibleData.cardsForOpenDeckArray;
            }
            else {
                isGameEnd = true;
            }
            ;
        }
        ;
        TableDetails.isTurnLock = true;
        yield (0, gameRedisOperations_1.SetTable)(TableDetails.tableId, TableDetails);
        if (isGameEnd) { // ^ End Game Immediately
            yield GameActions_1.GAME_ACTIONS.EndRound(tableId, false);
            console.log('End Game Immediately !!!');
            console.log('End Game Immediately !!!');
            console.log('End Game Immediately !!!');
            console.log('End Game Immediately !!!');
            console.log('End Game Immediately !!!');
            console.log('End Game Immediately !!!');
        }
        else {
            if (isThrow && remainingCardsNumber === 1) { // ^ UNO Bull
                yield BullTimer_1.BullTimer.AddJob.UnoClick(TableDetails.tableId, isSkip, skipSeatIndex, isRevers, 0.5, unoSeatIndex);
            }
            else { // ^ Turn Bull
                yield BullTimer_1.BullTimer.AddJob.TurnInfo(TableDetails.tableId, isSkip, skipSeatIndex, isRevers, 0.5);
            }
            ;
        }
        ;
    }
    catch (error) {
        (0, logger_1.Logger)('ChangeUserTurn Error : ', error);
    }
    ;
});
exports.ChangeUserTurn = ChangeUserTurn;

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
exports.PlusTwo = void 0;
const __1 = require("..");
const Config_1 = require("../../Config");
const emitter_1 = require("../../Connection/emitter");
const Constants_1 = require("../../Constants");
const gameRedisOperations_1 = require("../../GameRedisOperations/gameRedisOperations");
const logger_1 = require("../../Logger/logger");
const PlusTwo = (tableId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, logger_1.Logger)("PlusTwo", JSON.stringify({ tableId }));
        const CONFIG = (0, Config_1.Config)();
        const { PICK_CARD } = Constants_1.CONSTANTS.EVENTS_NAME;
        let isPenaltyFreeCard = false, penaltyNumber = 0;
        let TableDetails = yield (0, gameRedisOperations_1.GetTable)(tableId);
        if (!TableDetails) {
            throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND);
        }
        ;
        let pickCards = [], penaltySeatIndex = -1, forLimit = (TableDetails.numberOfCardToPick + 2);
        if (TableDetails.isClockwise) {
            let NextTurn = yield __1.GAME_ACTIONS.ClockWiseTurnChange(TableDetails);
            if (!NextTurn && NextTurn !== 0) {
                throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.TURN_CHANGE_ERROR);
            }
            ;
            penaltySeatIndex = NextTurn;
        }
        else {
            let NextTurn = yield __1.GAME_ACTIONS.AntiClockWiseTurnChange(TableDetails);
            if (!NextTurn && NextTurn !== 0) {
                throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.TURN_CHANGE_ERROR);
            }
            ;
            penaltySeatIndex = NextTurn;
        }
        ;
        const PenaltyUser = TableDetails.playersArray.find(e => { return e.seatIndex === penaltySeatIndex; });
        if (!PenaltyUser) {
            throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.ARRAY_FIND_ERROR);
        }
        ;
        let UserInTableDetails = yield (0, gameRedisOperations_1.GetUserInTable)(PenaltyUser === null || PenaltyUser === void 0 ? void 0 : PenaltyUser.userId);
        if (!UserInTableDetails) {
            throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.USER_IN_TABLE_NOT_FOUND);
        }
        ;
        for (let i = 0; i < UserInTableDetails.cardArray.length; i++) {
            if (TableDetails.activeCardType === UserInTableDetails.cardArray[i].split("-")[1] || Constants_1.CONSTANTS.UNO_CARDS.CARDS_TYPE.PLUS_FOUR === UserInTableDetails.cardArray[i].split("-")[1]) {
                isPenaltyFreeCard = true;
                break;
            }
        }
        ;
        if (isPenaltyFreeCard && CONFIG.GamePlay.PLUS_ON_PLUS) {
            let SkipData = yield __1.GAME_ACTIONS.Skip(TableDetails.tableId);
            if (!SkipData) {
                throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.SKIP_ERROR);
            }
            ;
            penaltyNumber = (TableDetails.numberOfCardToPick + 2);
            SkipData = Object.assign(Object.assign({}, SkipData), { nextTurnSeatIndex: SkipData.skipSeatIndex });
            return Object.assign(Object.assign({}, SkipData), { pickCards, isPenaltyFreeCard, penaltyNumber });
        }
        else {
            if (forLimit === 0) {
                forLimit = 2;
            }
            ;
            for (let i = 0; i < forLimit; i++) {
                // if (TableDetails.closeCardDeck.length < 1) { throw new Error(CONSTANTS.ERROR_MESSAGES.NOT_ENOUGH_CARDS) };
                if (TableDetails.closeCardDeck.length) {
                    UserInTableDetails.cardArray.push(TableDetails.closeCardDeck[0]);
                    pickCards.push(TableDetails.closeCardDeck[0]);
                    TableDetails.closeCardDeck.splice(0, 1);
                }
                ;
            }
            ;
            UserInTableDetails.isUnoClick = false;
            yield (0, gameRedisOperations_1.SetUserInTable)(UserInTableDetails.userId, UserInTableDetails);
            const PickCardResData = {
                userId: UserInTableDetails.userId,
                tableId: UserInTableDetails.tableId,
                seatIndex: UserInTableDetails.seatIndex,
                pickCards,
                isPlayableCard: false
            };
            emitter_1.EventEmitter.emit(PICK_CARD, { en: PICK_CARD, RoomId: TableDetails.tableId, Data: PickCardResData });
            let SkipData = yield __1.GAME_ACTIONS.Skip(TableDetails.tableId);
            if (!SkipData) {
                throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.SKIP_ERROR);
            }
            ;
            return Object.assign(Object.assign({}, SkipData), { pickCards, isPenaltyFreeCard, penaltyNumber });
        }
        ;
    }
    catch (error) {
        (0, logger_1.Logger)('PlusTwo Error : ', error);
    }
    ;
});
exports.PlusTwo = PlusTwo;

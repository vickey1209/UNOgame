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
exports.UserTurnProcessAction = void 0;
const changeUserTurn_1 = require("../ChangeUserTurn/changeUserTurn");
const Config_1 = require("../Config");
const emitter_1 = require("../Connection/emitter");
const redlock_1 = require("../Connection/redlock");
const Constants_1 = require("../Constants");
const gameRedisOperations_1 = require("../GameRedisOperations/gameRedisOperations");
const logger_1 = require("../Logger/logger");
const UserTurnProcessAction = (Data) => __awaiter(void 0, void 0, void 0, function* () {
    const Path = 'UserTurnProcessAction';
    const { LOCK, TABLES } = Constants_1.CONSTANTS.REDIS_COLLECTION;
    const { PICK_CARD, TURN_MISSED } = Constants_1.CONSTANTS.EVENTS_NAME;
    const TablelockId = `${LOCK}:${TABLES}:${Data === null || Data === void 0 ? void 0 : Data.tableId}`;
    const Tablelock = yield (0, redlock_1.ApplyLock)(Path, TablelockId);
    try {
        (0, logger_1.Logger)("UserTurnProcessAction", JSON.stringify(Data));
        const CONFIG = (0, Config_1.Config)();
        const tableId = Data === null || Data === void 0 ? void 0 : Data.tableId;
        const currentTurn = Data === null || Data === void 0 ? void 0 : Data.currentTurn;
        let pickCards = [];
        if (!tableId || currentTurn === undefined) {
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
        if (TableDetails.isScoreScreen) {
            throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.ROUND_SCORE_DONE);
        }
        ;
        if (TableDetails.currentTurn !== currentTurn) {
            throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.WRONG_CURRENT_TURN_AT_PROCESS);
        }
        ;
        const CurrentTurnUser = TableDetails.playersArray.find(e => { return e.seatIndex === TableDetails.currentTurn; });
        if (!CurrentTurnUser) {
            throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.ARRAY_FIND_ERROR);
        }
        ;
        let UserInTableDetails = yield (0, gameRedisOperations_1.GetUserInTable)(CurrentTurnUser === null || CurrentTurnUser === void 0 ? void 0 : CurrentTurnUser.userId);
        if (!UserInTableDetails) {
            throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.USER_IN_TABLE_NOT_FOUND);
        }
        ;
        if (UserInTableDetails.lastPickCard !== '' && UserInTableDetails.cardArray.includes(UserInTableDetails.lastPickCard)) {
            UserInTableDetails.lastPickCard = '';
        }
        else {
            if (TableDetails.numberOfCardToPick === 0) {
                // if (TableDetails.closeCardDeck.length < 1) { throw new Error(CONSTANTS.ERROR_MESSAGES.NOT_ENOUGH_CARDS) };
                if (TableDetails.closeCardDeck.length) {
                    UserInTableDetails.cardArray.push(TableDetails.closeCardDeck[0]);
                    pickCards.push(TableDetails.closeCardDeck[0]);
                    TableDetails.closeCardDeck.splice(0, 1);
                }
                ;
            }
            else {
                for (let i = 0; i < TableDetails.numberOfCardToPick; i++) {
                    // if (TableDetails.closeCardDeck.length < 1) { throw new Error(CONSTANTS.ERROR_MESSAGES.NOT_ENOUGH_CARDS) };
                    if (TableDetails.closeCardDeck.length) {
                        UserInTableDetails.cardArray.push(TableDetails.closeCardDeck[0]);
                        pickCards.push(TableDetails.closeCardDeck[0]);
                        TableDetails.closeCardDeck.splice(0, 1);
                    }
                    ;
                }
                ;
                TableDetails.numberOfCardToPick = 0;
            }
            ;
            const PickCardResData = {
                userId: UserInTableDetails.userId,
                tableId: UserInTableDetails.tableId,
                seatIndex: UserInTableDetails.seatIndex,
                pickCards,
                isPlayableCard: false
            };
            emitter_1.EventEmitter.emit(PICK_CARD, { en: PICK_CARD, RoomId: TableDetails.tableId, Data: PickCardResData });
        }
        ;
        UserInTableDetails.isUnoClick = false;
        UserInTableDetails.turnMissCount += 1;
        yield (0, gameRedisOperations_1.SetTable)(TableDetails.tableId, TableDetails);
        yield (0, gameRedisOperations_1.SetUserInTable)(UserInTableDetails.userId, UserInTableDetails);
        const TurnMissResData = { userId: UserInTableDetails.userId, tableId: UserInTableDetails.tableId, seatIndex: UserInTableDetails.seatIndex };
        emitter_1.EventEmitter.emit(TURN_MISSED, { en: TURN_MISSED, Data: TurnMissResData, RoomId: TableDetails.tableId });
        // if (UserInTableDetails.turnMissCount === CONFIG.GamePlay.TURN_TIMEOUT_COUNT) {
        //     await RemoveUserFromTable(UserInTableDetails.userId, TableDetails.tableId);
        // } else {
        yield (0, changeUserTurn_1.ChangeUserTurn)(TableDetails.tableId, false, 0);
        // };
    }
    catch (error) {
        (0, logger_1.Logger)('UserTurnProcessAction Error : ', error);
    }
    finally {
        yield (0, redlock_1.RemoveLock)(Path, Tablelock);
    }
    ;
});
exports.UserTurnProcessAction = UserTurnProcessAction;

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
exports.TurnInfoProcessAction = void 0;
const allUserScore_1 = require("../AllUserScore/allUserScore");
const Bot_1 = require("../Bot");
const BullTimer_1 = require("../BullTimer");
const Config_1 = require("../Config");
const emitter_1 = require("../Connection/emitter");
const redlock_1 = require("../Connection/redlock");
const Constants_1 = require("../Constants");
const GameActions_1 = require("../GameActions");
const gameRedisOperations_1 = require("../GameRedisOperations/gameRedisOperations");
const logger_1 = require("../Logger/logger");
const TurnInfoProcessAction = (Data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const Path = 'TurnInfoProcessAction';
    const { TURN_INFO, ROUND_START } = Constants_1.CONSTANTS.EVENTS_NAME;
    const { LOCK, TABLES } = Constants_1.CONSTANTS.REDIS_COLLECTION;
    const TablelockId = `${LOCK}:${TABLES}:${Data === null || Data === void 0 ? void 0 : Data.tableId}`;
    const Tablelock = yield (0, redlock_1.ApplyLock)(Path, TablelockId);
    try {
        (0, logger_1.Logger)("TurnInfoProcessAction", JSON.stringify(Data));
        const CONFIG = (0, Config_1.Config)();
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
        if (!TableDetails.isRoundStart) {
            TableDetails.isRoundStart = true;
            yield BullTimer_1.BullTimer.AddJob.Round(TableDetails.tableId);
            emitter_1.EventEmitter.emit(ROUND_START, { en: ROUND_START, RoomId: TableDetails.tableId, Data: { timer: CONFIG.GamePlay.ROUND_TIMER, currentRound: TableDetails.currentRound } });
        }
        ;
        TableDetails.isTurnLock = false;
        TableDetails.isLeaveLock = false;
        let UserInTableDetails = yield (0, gameRedisOperations_1.GetUserInTable)((_a = TableDetails.playersArray[TableDetails.currentTurn]) === null || _a === void 0 ? void 0 : _a.userId);
        if (!UserInTableDetails) {
            throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.USER_IN_TABLE_NOT_FOUND);
        }
        ;
        const isThrowPossible = yield GameActions_1.GAME_ACTIONS.IsThrowPossible(UserInTableDetails, TableDetails);
        if (isThrowPossible === undefined) {
            throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.IS_POSSIBLE_THROW_ERROR);
        }
        ;
        yield (0, gameRedisOperations_1.SetTable)(TableDetails.tableId, TableDetails);
        const TurnInfoResData = {
            currentTurn: TableDetails.currentTurn,
            activeCard: TableDetails.activeCard,
            activeCardType: TableDetails.activeCardType,
            activeCardColor: TableDetails.activeCardColor,
            isSkip: Data === null || Data === void 0 ? void 0 : Data.isSkip,
            skipSeatIndex: Data === null || Data === void 0 ? void 0 : Data.skipSeatIndex,
            isRevers: Data === null || Data === void 0 ? void 0 : Data.isRevers,
            isClockwise: TableDetails.isClockwise,
            isThrowPossible,
            totalTime: CONFIG.GamePlay.USER_TURN_TIMER,
            remainingTime: CONFIG.GamePlay.USER_TURN_TIMER
        };
        yield (0, allUserScore_1.AllUserScore)(TableDetails.tableId);
        yield BullTimer_1.BullTimer.AddJob.UserTurn(TableDetails.tableId);
        emitter_1.EventEmitter.emit(TURN_INFO, { en: TURN_INFO, RoomId: TableDetails.tableId, Data: TurnInfoResData });
        setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            if (TableDetails.playersArray[TableDetails.currentTurn].isBot) {
                yield Bot_1.BOT_ACTION.TakeTurn(TableDetails.tableId);
            }
            ;
        }), 2000);
    }
    catch (error) {
        (0, logger_1.Logger)('TurnInfoProcessAction Error : ', error);
    }
    finally {
        yield (0, redlock_1.RemoveLock)(Path, Tablelock);
    }
    ;
});
exports.TurnInfoProcessAction = TurnInfoProcessAction;

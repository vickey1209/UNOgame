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
exports.TimesUpProcessAction = void 0;
const BullTimer_1 = require("../BullTimer");
const Config_1 = require("../Config");
const emitter_1 = require("../Connection/emitter");
const redlock_1 = require("../Connection/redlock");
const Constants_1 = require("../Constants");
const gameRedisOperations_1 = require("../GameRedisOperations/gameRedisOperations");
const logger_1 = require("../Logger/logger");
const TimesUpProcessAction = (Data) => __awaiter(void 0, void 0, void 0, function* () {
    const Path = 'TimesUpProcessAction';
    const { ROUND_SCORE } = Constants_1.CONSTANTS.EVENTS_NAME;
    const { LOCK, TABLES } = Constants_1.CONSTANTS.REDIS_COLLECTION;
    const TablelockId = `${LOCK}:${TABLES}:${Data === null || Data === void 0 ? void 0 : Data.tableId}`;
    const Tablelock = yield (0, redlock_1.ApplyLock)(Path, TablelockId);
    try {
        (0, logger_1.Logger)("TimesUpProcessAction", JSON.stringify(Data));
        const CONFIG = (0, Config_1.Config)();
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
        const AllRoundScore = yield (0, gameRedisOperations_1.GetRoundHistory)(TableDetails.tableId);
        yield BullTimer_1.BullTimer.AddJob.NextRound(TableDetails.tableId);
        emitter_1.EventEmitter.emit(ROUND_SCORE, { en: ROUND_SCORE, RoomId: TableDetails.tableId, Data: { roundScreenTimer: CONFIG.GamePlay.NEXT_ROUND_TIMER, AllRoundScore } });
    }
    catch (error) {
        (0, logger_1.Logger)('TimesUpProcessAction Error : ', error);
    }
    finally {
        yield (0, redlock_1.RemoveLock)(Path, Tablelock);
    }
    ;
});
exports.TimesUpProcessAction = TimesUpProcessAction;

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
exports.RoundProcessAction = void 0;
const redlock_1 = require("../Connection/redlock");
const Constants_1 = require("../Constants");
const GameActions_1 = require("../GameActions");
const logger_1 = require("../Logger/logger");
const RoundProcessAction = (Data) => __awaiter(void 0, void 0, void 0, function* () {
    const Path = 'RoundProcessAction';
    const { LOCK, TABLES } = Constants_1.CONSTANTS.REDIS_COLLECTION;
    const TablelockId = `${LOCK}:${TABLES}:${Data === null || Data === void 0 ? void 0 : Data.tableId}`;
    const Tablelock = yield (0, redlock_1.ApplyLock)(Path, TablelockId);
    try {
        (0, logger_1.Logger)("RoundProcessAction", JSON.stringify(Data));
        const tableId = Data === null || Data === void 0 ? void 0 : Data.tableId;
        if (!tableId) {
            throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.BULL_DATA_NOT_FOUND);
        }
        ;
        yield GameActions_1.GAME_ACTIONS.EndRound(tableId, true);
    }
    catch (error) {
        (0, logger_1.Logger)('RoundProcessAction Error : ', error);
    }
    finally {
        yield (0, redlock_1.RemoveLock)(Path, Tablelock);
    }
    ;
});
exports.RoundProcessAction = RoundProcessAction;

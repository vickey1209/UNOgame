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
exports.CollectBootValueProcessAction = void 0;
const redlock_1 = require("../Connection/redlock");
const Constants_1 = require("../Constants");
const GameActions_1 = require("../GameActions");
const gameRedisOperations_1 = require("../GameRedisOperations/gameRedisOperations");
const logger_1 = require("../Logger/logger");
const CollectBootValueProcessAction = (Data) => __awaiter(void 0, void 0, void 0, function* () {
    const Path = 'CollectBootValueProcessAction';
    const { COLLECT_BOOT } = Constants_1.CONSTANTS.EVENTS_NAME;
    const { LOCK, TABLES } = Constants_1.CONSTANTS.REDIS_COLLECTION;
    const TablelockId = `${LOCK}:${TABLES}:${Data === null || Data === void 0 ? void 0 : Data.tableId}`;
    const Tablelock = yield (0, redlock_1.ApplyLock)(Path, TablelockId);
    try {
        (0, logger_1.Logger)("CollectBootValueProcessAction", JSON.stringify(Data));
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
        yield CutBootValueFromUser(TableDetails);
        // const ResData = {
        //     Message: `Collect Boot ${TableDetails.bootValue} !`,
        //     bootValue: TableDetails.bootValue
        // };
        // EventEmitter.emit(COLLECT_BOOT, { en: COLLECT_BOOT, RoomId: TableDetails.tableId, Data: ResData });
        yield GameActions_1.GAME_ACTIONS.DistributeCards(TableDetails.tableId);
    }
    catch (error) {
        (0, logger_1.Logger)('CollectBootValueProcessAction Error : ', error);
    }
    finally {
        yield (0, redlock_1.RemoveLock)(Path, Tablelock);
    }
    ;
});
exports.CollectBootValueProcessAction = CollectBootValueProcessAction;
const CutBootValueFromUser = (TableDetails) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, logger_1.Logger)("CutBootValueFromUser", JSON.stringify({ TableDetails }));
        for (let i = 0; i < TableDetails.playersArray.length; i++) {
            let UserDetails = yield (0, gameRedisOperations_1.GetUser)(TableDetails.playersArray[i].userId);
            UserDetails.chips -= TableDetails.bootValue;
            yield (0, gameRedisOperations_1.SetUser)(TableDetails.playersArray[i].userId, UserDetails);
        }
    }
    catch (error) {
        (0, logger_1.Logger)('CutBootValueFromUser Error', error);
    }
    ;
});

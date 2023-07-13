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
exports.DisconnectUserProcessAction = void 0;
const redlock_1 = require("../Connection/redlock");
const socket_1 = require("../Connection/socket");
const Constants_1 = require("../Constants");
const gameRedisOperations_1 = require("../GameRedisOperations/gameRedisOperations");
const logger_1 = require("../Logger/logger");
const leaveTable_1 = require("../Table/leaveTable");
const DisconnectUserProcessAction = (Data) => __awaiter(void 0, void 0, void 0, function* () {
    const Path = 'DisconnectUserProcessAction';
    const userId = Data === null || Data === void 0 ? void 0 : Data.userId;
    const tableId = Data === null || Data === void 0 ? void 0 : Data.tableId;
    const bootValue = Data === null || Data === void 0 ? void 0 : Data.bootValue;
    const playerCount = Data === null || Data === void 0 ? void 0 : Data.playerCount;
    const { LOCK, EMPTY_TABLE, TABLES } = Constants_1.CONSTANTS.REDIS_COLLECTION;
    const TablelockId = `${LOCK}:${TABLES}:${tableId}`;
    const MatchMakingId = `${LOCK}:${EMPTY_TABLE}:${bootValue}:${playerCount}`;
    const Tablelock = yield (0, redlock_1.ApplyLock)(Path, TablelockId);
    const MatchMakingLock = yield (0, redlock_1.ApplyLock)(Path, MatchMakingId);
    try {
        (0, logger_1.Logger)("DisconnectUserProcessAction", JSON.stringify(Data));
        if (userId === undefined || tableId === undefined || bootValue === undefined || playerCount === undefined) {
            throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.BULL_DATA_NOT_FOUND);
        }
        ;
        let UserDetails = yield (0, gameRedisOperations_1.GetUser)(userId);
        if (!UserDetails) {
            throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.USER_NOT_FOUND);
        }
        ;
        const IsUserOnline = socket_1.io.sockets.sockets.get(UserDetails.socketId); // * Find User Socket
        if (IsUserOnline) {
            throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.USER_IS_ONLINE);
        }
        ;
        let TableDetails = yield (0, gameRedisOperations_1.GetTable)(tableId);
        if (!TableDetails) {
            throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND);
        }
        ;
        yield (0, leaveTable_1.RemoveUserFromTable)(userId, tableId);
    }
    catch (error) {
        (0, logger_1.Logger)('DisconnectUserProcessAction Error : ', error);
    }
    finally {
        yield (0, redlock_1.RemoveLock)(Path, Tablelock);
        yield (0, redlock_1.RemoveLock)(Path, MatchMakingLock);
    }
    ;
});
exports.DisconnectUserProcessAction = DisconnectUserProcessAction;

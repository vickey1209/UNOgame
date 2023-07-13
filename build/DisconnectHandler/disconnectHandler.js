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
exports.DisconnectHandler = void 0;
const logger_1 = require("../Logger/logger");
const gameRedisOperations_1 = require("../GameRedisOperations/gameRedisOperations");
const Constants_1 = require("../Constants");
const socket_1 = require("../Connection/socket");
const redlock_1 = require("../Connection/redlock");
const leaveTable_1 = require("../Table/leaveTable");
const BullTimer_1 = require("../BullTimer");
const DisconnectHandler = (socket) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const Path = 'LeaveTable';
        (0, logger_1.Logger)("DisconnectHandler", JSON.stringify({}));
        const userId = (_a = socket.handshake.auth) === null || _a === void 0 ? void 0 : _a.userId;
        const playerCount = (_b = socket.handshake.auth) === null || _b === void 0 ? void 0 : _b.playerCount;
        const bootValue = (_c = socket.handshake.auth) === null || _c === void 0 ? void 0 : _c.bootValue;
        const { LOCK, EMPTY_TABLE, TABLES } = Constants_1.CONSTANTS.REDIS_COLLECTION;
        const MatchMakingId = `${LOCK}:${EMPTY_TABLE}:${bootValue}:${playerCount}`;
        const MatchMakingLock = yield (0, redlock_1.ApplyLock)(Path, MatchMakingId);
        let UserDetails = yield (0, gameRedisOperations_1.GetUser)(userId);
        if (!UserDetails) {
            yield (0, redlock_1.RemoveLock)(Path, MatchMakingLock);
            throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.USER_NOT_FOUND);
        }
        ;
        const IsUserOnline = socket_1.io.sockets.sockets.get(UserDetails.socketId); // * Find User Socket
        if (IsUserOnline) {
            yield (0, redlock_1.RemoveLock)(Path, MatchMakingLock);
            throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.USER_IS_ONLINE);
        }
        ;
        // ! Bull ...........
        yield BullTimer_1.BullTimer.CancelJob.CancelDisconnectUser(UserDetails.userId);
        if (UserDetails.tableId !== '') {
            const TablelockId = `${LOCK}:${TABLES}:${UserDetails === null || UserDetails === void 0 ? void 0 : UserDetails.tableId}`;
            const Tablelock = yield (0, redlock_1.ApplyLock)(Path, TablelockId);
            let TableDetails = yield (0, gameRedisOperations_1.GetTable)(UserDetails === null || UserDetails === void 0 ? void 0 : UserDetails.tableId);
            if (!TableDetails) {
                UserDetails.tableId = '';
                yield (0, gameRedisOperations_1.SetUser)(userId, UserDetails);
                yield (0, redlock_1.RemoveLock)(Path, Tablelock);
                yield (0, redlock_1.RemoveLock)(Path, MatchMakingLock);
                return;
            }
            ;
            if (TableDetails.playersArray.length < 1) {
                UserDetails.tableId = '';
                yield (0, gameRedisOperations_1.SetUser)(UserDetails.userId, UserDetails);
                yield (0, gameRedisOperations_1.DeleteTable)(TableDetails.tableId);
                yield (0, gameRedisOperations_1.DeleteUserInTable)(UserDetails.userId);
                yield (0, gameRedisOperations_1.DeleteEmptyTable)(TableDetails.bootValue, TableDetails.maxPlayers, TableDetails.tableId);
                yield (0, redlock_1.RemoveLock)(Path, Tablelock);
                yield (0, redlock_1.RemoveLock)(Path, MatchMakingLock);
                return;
            }
            ;
            if (!TableDetails.isGameStart) {
                yield (0, leaveTable_1.RemoveUserFromTable)(UserDetails.userId, UserDetails.tableId);
                yield (0, redlock_1.RemoveLock)(Path, Tablelock);
                yield (0, redlock_1.RemoveLock)(Path, MatchMakingLock);
                return;
            }
            ;
            // ! Bull ...........
            yield BullTimer_1.BullTimer.AddJob.DisconnectUser(UserDetails.userId, UserDetails.tableId, UserDetails.bootValue, UserDetails.playerCount);
            yield (0, redlock_1.RemoveLock)(Path, Tablelock);
            yield (0, redlock_1.RemoveLock)(Path, MatchMakingLock);
        }
        else {
            yield (0, redlock_1.RemoveLock)(Path, MatchMakingLock);
        }
        ;
    }
    catch (error) {
        (0, logger_1.Logger)('DisconnectHandler Error : ', error);
    }
    ;
});
exports.DisconnectHandler = DisconnectHandler;

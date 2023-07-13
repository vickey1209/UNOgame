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
exports.RemoveUserFromTable = exports.LeaveTable = void 0;
const logger_1 = require("../Logger/logger");
const Constants_1 = require("../Constants");
const redlock_1 = require("../Connection/redlock");
const gameRedisOperations_1 = require("../GameRedisOperations/gameRedisOperations");
const emitter_1 = require("../Connection/emitter");
const socket_1 = require("../Connection/socket");
const leaveRoom_1 = require("../SocketRooms/leaveRoom");
const BullTimer_1 = require("../BullTimer");
const changeUserTurn_1 = require("../ChangeUserTurn/changeUserTurn");
const win_1 = require("../Win/win");
const LeaveTable = (en, socket, Data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const Path = 'LeaveTable';
    // const userId = socket.handshake.auth?.userId;
    // const tableId = socket.handshake.auth?.tableId;
    const playerCount = (_a = socket.handshake.auth) === null || _a === void 0 ? void 0 : _a.playerCount;
    const bootValue = (_b = socket.handshake.auth) === null || _b === void 0 ? void 0 : _b.bootValue;
    const { LOCK, EMPTY_TABLE, TABLES } = Constants_1.CONSTANTS.REDIS_COLLECTION;
    const TablelockId = `${LOCK}:${TABLES}:${Data === null || Data === void 0 ? void 0 : Data.tableId}`;
    const MatchMakingId = `${LOCK}:${EMPTY_TABLE}:${bootValue}:${playerCount}`;
    const Tablelock = yield (0, redlock_1.ApplyLock)(Path, TablelockId);
    const MatchMakingLock = yield (0, redlock_1.ApplyLock)(Path, MatchMakingId);
    try {
        (0, logger_1.Logger)("LeaveTable", JSON.stringify({ Data }));
        const { userId, tableId } = Data;
        yield RemoveUserFromTable(userId, tableId);
    }
    catch (error) {
        (0, logger_1.Logger)('LeaveTable Error : ', error);
    }
    finally {
        yield (0, redlock_1.RemoveLock)(Path, Tablelock);
        yield (0, redlock_1.RemoveLock)(Path, MatchMakingLock);
    }
    ;
});
exports.LeaveTable = LeaveTable;
const RemoveUserFromTable = (userId, tableId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, logger_1.Logger)("RemoveUserFromTable", JSON.stringify({ userId, tableId }));
        const { LEAVE_TABLE, ERROR_POPUP } = Constants_1.CONSTANTS.EVENTS_NAME;
        let UserDetails = yield (0, gameRedisOperations_1.GetUser)(userId);
        if (!UserDetails) {
            throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.USER_NOT_FOUND);
        }
        ;
        let TableDetails = yield (0, gameRedisOperations_1.GetTable)(tableId);
        if (!TableDetails) {
            throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND);
        }
        ;
        const UserAvailableInTable = TableDetails.playersArray.find(e => { return e.userId === userId; });
        if (!UserAvailableInTable) {
            throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.WRONG_TABLE);
        }
        ;
        let UserInTableDetails = yield (0, gameRedisOperations_1.GetUserInTable)(userId);
        if (!UserInTableDetails) {
            throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.USER_IN_TABLE_NOT_FOUND);
        }
        ;
        if (TableDetails.isLeaveLock || TableDetails.isWinning) {
            return emitter_1.EventEmitter.emit(ERROR_POPUP, { en: ERROR_POPUP, SocketId: UserDetails.socketId, Data: { Message: Constants_1.CONSTANTS.ERROR_MESSAGES.CAN_NOT_ABLE_TO_LEAVE } });
        }
        ;
        if (!TableDetails.isGameStart) {
            const PlayerIndexInArray = TableDetails.playersArray.findIndex((e) => { return e.userId === userId; });
            TableDetails.playersArray.splice(PlayerIndexInArray, 1);
            UserDetails.tableId = '';
            yield (0, gameRedisOperations_1.SetUser)(UserDetails.userId, UserDetails);
            yield (0, gameRedisOperations_1.SetTable)(TableDetails.tableId, TableDetails);
            if (TableDetails.playersArray.length < 1) {
                yield (0, gameRedisOperations_1.DeleteTable)(TableDetails.tableId);
                yield (0, gameRedisOperations_1.DeleteUserInTable)(UserDetails.userId);
                yield (0, gameRedisOperations_1.DeleteEmptyTable)(TableDetails.bootValue, TableDetails.maxPlayers, TableDetails.tableId);
            }
            ;
            const LeaveTableResData = { userId, tableId, seatIndex: UserInTableDetails.seatIndex };
            emitter_1.EventEmitter.emit(LEAVE_TABLE, { en: LEAVE_TABLE, RoomId: TableDetails.tableId, Data: LeaveTableResData });
            const socket = socket_1.io.sockets.sockets.get(UserDetails.socketId); // * Find User Socket
            if (socket) {
                yield (0, leaveRoom_1.LeaveRoom)(socket, TableDetails.tableId);
            }
            ;
        }
        else {
            TableDetails = Object.assign(Object.assign({}, TableDetails), { playersArray: [
                    ...TableDetails.playersArray.map(player => {
                        return UserDetails.userId === player.userId ? Object.assign(Object.assign({}, player), { isLeave: true }) : player;
                    })
                ] });
            UserDetails.tableId = '';
            yield (0, gameRedisOperations_1.SetUser)(UserDetails.userId, UserDetails);
            yield (0, gameRedisOperations_1.SetTable)(TableDetails.tableId, TableDetails);
            const LeaveTableResData = { userId, tableId, seatIndex: UserInTableDetails.seatIndex };
            emitter_1.EventEmitter.emit(LEAVE_TABLE, { en: LEAVE_TABLE, RoomId: TableDetails.tableId, Data: LeaveTableResData });
            const socket = socket_1.io.sockets.sockets.get(UserDetails.socketId); // * Find User Socket
            if (socket) {
                yield (0, leaveRoom_1.LeaveRoom)(socket, TableDetails.tableId);
            }
            ;
            const PlayersAvailableInTable = TableDetails.playersArray.filter(player => { return player.isLeave === false; });
            if (PlayersAvailableInTable.length < 2) {
                console.log('LeaveTable End Game Immediately !!!');
                console.log('LeaveTable End Game Immediately !!!');
                console.log('LeaveTable End Game Immediately !!!');
                console.log('LeaveTable End Game Immediately !!!');
                console.log('LeaveTable End Game Immediately !!!');
                console.log('LeaveTable End Game Immediately !!!');
                yield (0, win_1.Win)(TableDetails.tableId);
            }
            else {
                if (TableDetails.currentTurn === UserInTableDetails.seatIndex) {
                    yield BullTimer_1.BullTimer.CancelJob.CancelUserTurn(TableDetails.tableId, TableDetails.currentTurn);
                    yield (0, changeUserTurn_1.ChangeUserTurn)(TableDetails.tableId, false, 0);
                }
                ;
            }
            ;
        }
        ;
    }
    catch (error) {
        (0, logger_1.Logger)('RemoveUserFromTable Error : ', error);
    }
    ;
});
exports.RemoveUserFromTable = RemoveUserFromTable;

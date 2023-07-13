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
exports.RejoinTable = void 0;
const BullTimer_1 = require("../BullTimer");
const emitter_1 = require("../Connection/emitter");
const redlock_1 = require("../Connection/redlock");
const Constants_1 = require("../Constants");
const GameActions_1 = require("../GameActions");
const gameRedisOperations_1 = require("../GameRedisOperations/gameRedisOperations");
const logger_1 = require("../Logger/logger");
const joinRoom_1 = require("../SocketRooms/joinRoom");
const createTable_1 = require("./createTable");
const RejoinTable = (socket, Data) => __awaiter(void 0, void 0, void 0, function* () {
    const Path = 'RejoinTable';
    let Tablelock;
    const { LOCK, TABLES } = Constants_1.CONSTANTS.REDIS_COLLECTION;
    const { ALERT, JOIN_TABLE, REJOIN } = Constants_1.CONSTANTS.EVENTS_NAME;
    const TablelockId = `${LOCK}:${TABLES}:${Data === null || Data === void 0 ? void 0 : Data.tableId}`;
    if ((Data === null || Data === void 0 ? void 0 : Data.tableId) !== '') {
        Tablelock = yield (0, redlock_1.ApplyLock)(Path, TablelockId);
    }
    try {
        (0, logger_1.Logger)('RejoinTable', JSON.stringify({ Data }));
        const UserDetails = yield (0, gameRedisOperations_1.GetUser)(Data === null || Data === void 0 ? void 0 : Data.userId);
        if (!UserDetails) {
            throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.USER_NOT_FOUND);
        }
        ;
        if (UserDetails.tableId === '') {
            yield (0, createTable_1.CreateTable)(socket, Data);
            return;
        }
        ;
        let TableDetails = yield (0, gameRedisOperations_1.GetTable)(UserDetails.tableId);
        if (!TableDetails) {
            emitter_1.EventEmitter.emit(ALERT, { en: ALERT, SocketId: UserDetails.socketId, Data: { Message: Constants_1.CONSTANTS.ERROR_MESSAGES.LAST_GAME_FINISHED } });
            UserDetails.tableId = '';
            yield (0, gameRedisOperations_1.SetUser)(UserDetails.userId, UserDetails);
            return;
        }
        ;
        const UserAvailableInTable = TableDetails.playersArray.find(e => { return e.userId === UserDetails.userId; });
        let UserInTableDetails = yield (0, gameRedisOperations_1.GetUserInTable)(UserDetails.userId);
        if (!UserInTableDetails) {
            throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.USER_IN_TABLE_NOT_FOUND);
        }
        ;
        if (UserAvailableInTable && UserInTableDetails) {
            if (TableDetails.isGameStart) {
                const { userId, seatIndex, turnMissCount, isBot, isUnoClick, cardArray } = UserInTableDetails;
                const { tableId, bootValue, currentTurn, currentRound, maxPlayers, playersArray, activeCard, activeCardType, activeCardColor, isClockwise, isGameStart } = TableDetails;
                const RoundJob = yield BullTimer_1.BullTimer.CheckJob.CheckRound(TableDetails.tableId);
                const UserTurnJob = yield BullTimer_1.BullTimer.CheckJob.CheckUserTurn(tableId, currentTurn);
                const GameStartJob = yield BullTimer_1.BullTimer.CheckJob.CheckCollectBootValue(TableDetails.tableId);
                let RemainingUserTurnTimer = 0, RemainingRoundTimer = 0, RemainingGameStartTimer = 0;
                if (UserTurnJob) {
                    RemainingUserTurnTimer = yield GameActions_1.GAME_ACTIONS.RemainTimeCalculation(UserTurnJob);
                }
                ;
                if (GameStartJob) {
                    RemainingGameStartTimer = yield GameActions_1.GAME_ACTIONS.RemainTimeCalculation(GameStartJob);
                }
                ;
                if (RoundJob) {
                    RemainingRoundTimer = yield GameActions_1.GAME_ACTIONS.RemainTimeCalculation(RoundJob);
                }
                ;
                const RejoinResData = {
                    table: { tableId, bootValue, currentTurn, currentRound, maxPlayers, playersArray, activeCard, activeCardType, activeCardColor, isClockwise, isGameStart, RemainingRoundTimer, RemainingGameStartTimer },
                    user: { userId, seatIndex, turnMissCount, isBot, isUnoClick, cardArray, RemainingUserTurnTimer }
                };
                yield (0, joinRoom_1.JoinRoom)(socket, TableDetails.tableId);
                emitter_1.EventEmitter.emit(REJOIN, { en: REJOIN, SocketId: UserDetails.socketId, Data: RejoinResData });
            }
            else {
                yield (0, joinRoom_1.JoinRoom)(socket, TableDetails.tableId);
                emitter_1.EventEmitter.emit(JOIN_TABLE, { en: JOIN_TABLE, SocketId: UserDetails.socketId, Data: TableDetails });
            }
            ;
        }
        else {
            yield (0, createTable_1.CreateTable)(socket, Data);
            return;
        }
        ;
    }
    catch (error) {
        (0, logger_1.Logger)('RejoinTable Error : ', error);
    }
    finally {
        if ((Data === null || Data === void 0 ? void 0 : Data.tableId) !== '') {
            yield (0, redlock_1.RemoveLock)(Path, Tablelock);
        }
        ;
    }
    ;
});
exports.RejoinTable = RejoinTable;

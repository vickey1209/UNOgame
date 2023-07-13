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
exports.JoinTable = void 0;
const logger_1 = require("../Logger/logger");
const gameRedisOperations_1 = require("../GameRedisOperations/gameRedisOperations");
const createTable_1 = require("./createTable");
const emitter_1 = require("../Connection/emitter");
const Constants_1 = require("../Constants");
const joinRoom_1 = require("../SocketRooms/joinRoom");
const BullTimer_1 = require("../BullTimer");
const Config_1 = require("../Config");
const JoinTable = (socket, Data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, logger_1.Logger)('JoinTable', JSON.stringify({ Data }));
        const CONFIG = (0, Config_1.Config)();
        const { JOIN_TABLE, GAME_START } = Constants_1.CONSTANTS.EVENTS_NAME;
        const UserDetails = yield (0, gameRedisOperations_1.GetUser)(Data.userId);
        if (!UserDetails) {
            throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.USER_NOT_FOUND);
        }
        ;
        const EmptyTableList = yield (0, gameRedisOperations_1.GetEmptyTable)(Data === null || Data === void 0 ? void 0 : Data.bootValue, Data === null || Data === void 0 ? void 0 : Data.playerCount);
        if (!EmptyTableList) {
            yield (0, createTable_1.CreateTable)(socket, Data);
            return;
        }
        let isSeatAvalilable = false;
        for (let i = 0; i < EmptyTableList.length; i++) {
            isSeatAvalilable = false;
            const ArrayLength = EmptyTableList[0].split(':').length;
            let TableDetails = yield (0, gameRedisOperations_1.GetTable)(EmptyTableList[0].split(':')[ArrayLength - 1]);
            if (TableDetails) {
                isSeatAvalilable = true;
                if (TableDetails.playersArray.length < TableDetails.maxPlayers) { // * Add Player Data In Table
                    TableDetails = yield SeatPlayerOnTable(socket, TableDetails, UserDetails);
                }
                ;
                // EventEmitter.emit(JOIN_TABLE, { en: JOIN_TABLE, SocketId: socket.id, Data: TableDetails });
                yield (0, joinRoom_1.JoinRoom)(socket, TableDetails.tableId);
                if (TableDetails.playersArray.length === TableDetails.maxPlayers) {
                    emitter_1.EventEmitter.emit(JOIN_TABLE, { en: JOIN_TABLE, SocketId: TableDetails.tableId, Data: TableDetails });
                    yield (0, gameRedisOperations_1.DeleteEmptyTable)(TableDetails.bootValue, TableDetails.maxPlayers, TableDetails.tableId);
                    const GameStartResData = { timer: CONFIG.GamePlay.GAME_START_TIMER };
                    emitter_1.EventEmitter.emit(GAME_START, { en: GAME_START, Data: GameStartResData, RoomId: TableDetails.tableId });
                    yield BullTimer_1.BullTimer.AddJob.CollectBootValue(TableDetails.tableId);
                }
            }
        }
    }
    catch (error) {
        (0, logger_1.Logger)('JoinTable Error : ', error);
    }
    ;
});
exports.JoinTable = JoinTable;
const SeatPlayerOnTable = (socket, TableDetails, UserDetails) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, logger_1.Logger)('SeatPlayerOnTable', JSON.stringify({ TableDetails, UserDetails }));
        const { NEW_USER } = Constants_1.CONSTANTS.EVENTS_NAME;
        const NumberOfSeatAvailable = [];
        for (let i = 0; i < TableDetails.maxPlayers; i++) {
            NumberOfSeatAvailable.push(i);
        }
        ;
        for (let i = 0; i < TableDetails.playersArray.length; i++) {
            const isSeatAvailable = NumberOfSeatAvailable.indexOf(TableDetails.playersArray[i].seatIndex);
            if (isSeatAvailable !== -1) {
                NumberOfSeatAvailable.splice(isSeatAvailable, 1);
            }
            ;
        }
        const PlayerForPlayerArray = {
            userId: UserDetails.userId,
            userName: UserDetails.userName,
            userProfile: UserDetails.userProfile,
            seatIndex: NumberOfSeatAvailable[0],
            isLeave: false,
            isBot: UserDetails.isBot,
        };
        const UserInTable = {
            userId: UserDetails.userId,
            tableId: TableDetails.tableId,
            seatIndex: NumberOfSeatAvailable[0],
            userScore: 0,
            turnMissCount: 0,
            isBot: false,
            isUnoClick: false,
            lastPickCard: '',
            lastThrowCard: '',
            cardArray: [],
        };
        socket.handshake.auth.tableId = TableDetails === null || TableDetails === void 0 ? void 0 : TableDetails.tableId;
        socket.handshake.auth.seatIndex = NumberOfSeatAvailable[0];
        TableDetails.playersArray.push(PlayerForPlayerArray);
        if (TableDetails.playersArray.length === TableDetails.maxPlayers) {
            TableDetails.isGameStart = true;
            TableDetails.isLeaveLock = true;
        }
        ;
        UserDetails.tableId = TableDetails.tableId;
        yield (0, gameRedisOperations_1.SetUser)(UserDetails.userId, UserDetails);
        yield (0, gameRedisOperations_1.SetTable)(TableDetails.tableId, TableDetails);
        yield (0, gameRedisOperations_1.SetUserInTable)(UserDetails.userId, UserInTable);
        // EventEmitter.emit(NEW_USER, { en: NEW_USER, Data: PlayerForPlayerArray, RoomId: TableDetails.tableId });
        return TableDetails;
    }
    catch (error) {
        (0, logger_1.Logger)('SeatPlayerOnTable Error : ', error);
    }
    ;
});

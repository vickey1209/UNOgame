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
exports.EmitterON = void 0;
const socket_1 = require("./socket");
const Constants_1 = require("../Constants");
const logger_1 = require("../Logger/logger");
const emitter_1 = require("./emitter");
const SendToSocket = (EVENT, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { en, SocketId, Data } = data;
        (0, logger_1.Logger)("SendToSocket", JSON.stringify({ EVENT, Data }));
        socket_1.io.to(SocketId).emit(EVENT, JSON.stringify({ en, Data }));
    }
    catch (error) {
        (0, logger_1.Logger)('SendToSocket Error : ', error);
    }
    ;
});
const SendToRoom = (EVENT, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { en, RoomId, Data } = data;
        (0, logger_1.Logger)("SendToRoom", JSON.stringify({ EVENT, Data }));
        socket_1.io.to(RoomId).emit(EVENT, JSON.stringify({ en, Data }));
    }
    catch (error) {
        (0, logger_1.Logger)('SendToRoom Error : ', error);
    }
    ;
});
const EmitterON = () => {
    try {
        console.log(`EmitterON Done !`);
        const { TEST, DEFAULT, ERROR_POPUP, SIGNUP, JOIN_TABLE, NEW_USER, GAME_START, COLLECT_BOOT, MY_CARDS, TURN_INFO, THROW_CARD, PICK_CARD, USERS_SCORE, ROUND_START, ROUND_SCORE, LEAVE_TABLE, UNO, TURN_MISSED, ALERT, REJOIN, TIMES_UP, WINNER_DECLARE } = Constants_1.CONSTANTS.EVENTS_NAME;
        emitter_1.EventEmitter.on(TEST, (data) => __awaiter(void 0, void 0, void 0, function* () {
            yield SendToSocket(TEST, data);
        }));
        emitter_1.EventEmitter.on(DEFAULT, (data) => __awaiter(void 0, void 0, void 0, function* () {
            yield SendToSocket(DEFAULT, data);
        }));
        emitter_1.EventEmitter.on(ERROR_POPUP, (data) => __awaiter(void 0, void 0, void 0, function* () {
            yield SendToSocket(ERROR_POPUP, data);
        }));
        emitter_1.EventEmitter.on(SIGNUP, (data) => __awaiter(void 0, void 0, void 0, function* () {
            yield SendToSocket(SIGNUP, data);
        }));
        emitter_1.EventEmitter.on(JOIN_TABLE, (data) => __awaiter(void 0, void 0, void 0, function* () {
            yield SendToSocket(JOIN_TABLE, data);
        }));
        emitter_1.EventEmitter.on(NEW_USER, (data) => __awaiter(void 0, void 0, void 0, function* () {
            yield SendToRoom(NEW_USER, data);
        }));
        emitter_1.EventEmitter.on(GAME_START, (data) => __awaiter(void 0, void 0, void 0, function* () {
            yield SendToRoom(GAME_START, data);
        }));
        emitter_1.EventEmitter.on(COLLECT_BOOT, (data) => __awaiter(void 0, void 0, void 0, function* () {
            yield SendToRoom(COLLECT_BOOT, data);
        }));
        emitter_1.EventEmitter.on(MY_CARDS, (data) => __awaiter(void 0, void 0, void 0, function* () {
            yield SendToSocket(MY_CARDS, data);
        }));
        emitter_1.EventEmitter.on(TURN_INFO, (data) => __awaiter(void 0, void 0, void 0, function* () {
            yield SendToRoom(TURN_INFO, data);
        }));
        emitter_1.EventEmitter.on(THROW_CARD, (data) => __awaiter(void 0, void 0, void 0, function* () {
            yield SendToRoom(THROW_CARD, data);
        }));
        emitter_1.EventEmitter.on(PICK_CARD, (data) => __awaiter(void 0, void 0, void 0, function* () {
            yield SendToRoom(PICK_CARD, data);
        }));
        emitter_1.EventEmitter.on(USERS_SCORE, (data) => __awaiter(void 0, void 0, void 0, function* () {
            yield SendToRoom(USERS_SCORE, data);
        }));
        emitter_1.EventEmitter.on(ROUND_START, (data) => __awaiter(void 0, void 0, void 0, function* () {
            yield SendToRoom(ROUND_START, data);
        }));
        emitter_1.EventEmitter.on(ROUND_SCORE, (data) => __awaiter(void 0, void 0, void 0, function* () {
            yield SendToRoom(ROUND_SCORE, data);
        }));
        emitter_1.EventEmitter.on(LEAVE_TABLE, (data) => __awaiter(void 0, void 0, void 0, function* () {
            yield SendToRoom(LEAVE_TABLE, data);
        }));
        emitter_1.EventEmitter.on(UNO, (data) => __awaiter(void 0, void 0, void 0, function* () {
            yield SendToRoom(UNO, data);
        }));
        emitter_1.EventEmitter.on(TURN_MISSED, (data) => __awaiter(void 0, void 0, void 0, function* () {
            yield SendToRoom(TURN_MISSED, data);
        }));
        emitter_1.EventEmitter.on(REJOIN, (data) => __awaiter(void 0, void 0, void 0, function* () {
            yield SendToSocket(REJOIN, data);
        }));
        emitter_1.EventEmitter.on(ALERT, (data) => __awaiter(void 0, void 0, void 0, function* () {
            yield SendToSocket(ALERT, data);
        }));
        emitter_1.EventEmitter.on(TIMES_UP, (data) => __awaiter(void 0, void 0, void 0, function* () {
            yield SendToRoom(TIMES_UP, data);
        }));
        emitter_1.EventEmitter.on(WINNER_DECLARE, (data) => __awaiter(void 0, void 0, void 0, function* () {
            yield SendToRoom(WINNER_DECLARE, data);
        }));
    }
    catch (error) {
        (0, logger_1.Logger)('EmitterON Error', error);
    }
    ;
};
exports.EmitterON = EmitterON;

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
exports.SignUp = void 0;
const logger_1 = require("../Logger/logger");
const gameRedisOperations_1 = require("../GameRedisOperations/gameRedisOperations");
const emitter_1 = require("../Connection/emitter");
const redlock_1 = require("../Connection/redlock");
const Constants_1 = require("../Constants");
const createTable_1 = require("../Table/createTable");
const SignUp = (en, socket, Data) => __awaiter(void 0, void 0, void 0, function* () {
    // const SignUp = async (en: string, socket: Socket, Data: SignUpInterface) => {
    const Path = 'SignUp';
    const { SIGNUP, ERROR_POPUP } = Constants_1.CONSTANTS.EVENTS_NAME;
    const { LOCK, EMPTY_TABLE } = Constants_1.CONSTANTS.REDIS_COLLECTION;
    const MatchMakingId = `${LOCK}:${EMPTY_TABLE}:${Data === null || Data === void 0 ? void 0 : Data.bootValue}:${Data === null || Data === void 0 ? void 0 : Data.playerCount}`;
    const MatchMakingLock = yield (0, redlock_1.ApplyLock)(Path, MatchMakingId);
    try {
        (0, logger_1.Logger)('SignUp', JSON.stringify({ Data }));
        if (!(Data === null || Data === void 0 ? void 0 : Data.bootValue) || !(Data === null || Data === void 0 ? void 0 : Data.playerCount) || !(Data === null || Data === void 0 ? void 0 : Data.userId)) {
            return emitter_1.EventEmitter.emit(ERROR_POPUP, { en: ERROR_POPUP, SocketId: socket.id, Data: { Message: "Provide Valid Data !" } });
        }
        ;
        if ((Data === null || Data === void 0 ? void 0 : Data.isBot) === undefined) {
            Data.isBot = false;
        }
        ;
        socket.handshake.auth.userId = Data === null || Data === void 0 ? void 0 : Data.userId;
        socket.handshake.auth.playerCount = Data === null || Data === void 0 ? void 0 : Data.playerCount;
        socket.handshake.auth.bootValue = Data === null || Data === void 0 ? void 0 : Data.bootValue;
        const UserDetails = yield (0, gameRedisOperations_1.GetUser)(Data.userId);
        if (UserDetails) {
            const UserData = yield UpdateUser(socket, Data, UserDetails);
            // EventEmitter.emit(SIGNUP, { en: SIGNUP, SocketId: socket.id, Data: UserData });
            yield (0, createTable_1.CreateTable)(socket, Data);
            // Data.tableId = UserData?.tableId ? UserData?.tableId : '';
            // await RejoinTable(socket, Data);
        }
        else {
            const UserData = yield NewUser(socket, Data);
            // EventEmitter.emit(SIGNUP, { en: SIGNUP, SocketId: socket.id, Data: UserData });
            yield (0, createTable_1.CreateTable)(socket, Data);
            // Data.tableId = UserData?.tableId ? UserData?.tableId : '';
            // await RejoinTable(socket, Data);
        }
        ;
    }
    catch (error) {
        (0, logger_1.Logger)('SignUp Error : ', error);
    }
    finally {
        yield (0, redlock_1.RemoveLock)(Path, MatchMakingLock);
    }
    ;
});
exports.SignUp = SignUp;
const NewUser = (socket, Data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, logger_1.Logger)("NewUser", JSON.stringify({ Data }));
        const { userId, userName, userProfile, chips, bootValue, playerCount, isBot } = Data;
        const NewUserData = {
            userId,
            userName: userName,
            userProfile,
            chips,
            socketId: socket.id,
            tableId: '',
            bootValue: bootValue,
            playerCount,
            isBot
        };
        const User = yield (0, gameRedisOperations_1.SetUser)(userId, NewUserData);
        if (User === 'OK')
            return NewUserData;
    }
    catch (error) {
        (0, logger_1.Logger)('NewUser Error : ', error);
    }
    ;
});
const UpdateUser = (socket, Data, AvailableUser) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, logger_1.Logger)("UpdateUser", JSON.stringify({ AvailableUser, Data }));
        const { userId, userName, userProfile, chips, bootValue, playerCount, isBot, } = Data;
        const UpdateUserData = {
            userId,
            userName,
            userProfile,
            chips,
            socketId: socket.id,
            tableId: AvailableUser.tableId,
            bootValue,
            playerCount,
            isBot
        };
        const User = yield (0, gameRedisOperations_1.SetUser)(userId, UpdateUserData);
        if (User === 'OK')
            return UpdateUserData;
    }
    catch (error) {
        (0, logger_1.Logger)('UpdateUser Error : ', error);
    }
    ;
});

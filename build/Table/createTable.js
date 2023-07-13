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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTable = void 0;
const crypto_random_string_1 = __importDefault(require("crypto-random-string"));
const logger_1 = require("../Logger/logger");
const gameRedisOperations_1 = require("../GameRedisOperations/gameRedisOperations");
const Constants_1 = require("../Constants");
const joinRoom_1 = require("../SocketRooms/joinRoom");
const emitter_1 = require("../Connection/emitter");
const joinTable_1 = require("./joinTable");
const Bot_1 = require("../Bot");
const Config_1 = require("../Config");
const CreateTable = (socket, Data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, logger_1.Logger)('CreateTable', JSON.stringify({ Data }));
        const { JOIN_TABLE, ERROR_POPUP } = Constants_1.CONSTANTS.EVENTS_NAME;
        const UserDetails = yield (0, gameRedisOperations_1.GetUser)(Data.userId);
        if (!UserDetails) {
            throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.USER_NOT_FOUND);
        }
        ;
        if (UserDetails.chips < Data.bootValue) {
            return emitter_1.EventEmitter.emit(ERROR_POPUP, { en: ERROR_POPUP, SocketId: socket.id, Data: { Message: Constants_1.CONSTANTS.ERROR_MESSAGES.ENOUGH_CHIPS } });
        }
        const EmptyTableList = yield (0, gameRedisOperations_1.GetEmptyTable)(Data === null || Data === void 0 ? void 0 : Data.bootValue, Data === null || Data === void 0 ? void 0 : Data.playerCount);
        if (EmptyTableList) {
            yield (0, joinTable_1.JoinTable)(socket, Data);
            return;
        }
        ;
        const Table = yield CreateNewTable(socket, UserDetails);
        setTimeout(() => __awaiter(void 0, void 0, void 0, function* () { yield Bot_1.BOT_ACTION.BotSignUp(); }), 2000);
        // EventEmitter.emit(JOIN_TABLE, { en: JOIN_TABLE, SocketId: socket.id, Data: Table });
    }
    catch (error) {
        (0, logger_1.Logger)('CreateTable Error : ', error);
    }
    ;
});
exports.CreateTable = CreateTable;
const CreateNewTable = (socket, UserDetails) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, logger_1.Logger)('CreateNewTable', JSON.stringify({ UserDetails }));
        const CONFIG = (0, Config_1.Config)();
        const Table = {
            // tableId: 'TABLE',
            tableId: (0, crypto_random_string_1.default)({ length: 24, type: 'hex' }),
            bootValue: UserDetails.bootValue,
            currentTurn: -1,
            currentRound: 1,
            totalRounds: CONFIG.GamePlay.TOTAL_ROUND_NUMBER,
            maxPlayers: UserDetails.playerCount,
            botPriority: Constants_1.CONSTANTS.BOT_PRIORITY.HARD,
            playersArray: [
                {
                    userId: UserDetails.userId,
                    userName: UserDetails.userName,
                    userProfile: UserDetails.userProfile,
                    seatIndex: 0,
                    isLeave: false,
                    isBot: UserDetails.isBot,
                }
            ],
            numberOfCardToPick: 0,
            activeCard: '',
            activeCardType: '',
            activeCardColor: '',
            closeCardDeck: [],
            openCardDeck: [],
            isClockwise: true,
            isGameStart: false,
            isRoundStart: false,
            isScoreScreen: false,
            isLeaveLock: false,
            isTurnLock: false,
            isWinning: false,
        };
        const UserInTable = {
            userId: UserDetails.userId,
            tableId: Table.tableId,
            seatIndex: 0,
            userScore: 0,
            turnMissCount: 0,
            isBot: false,
            isUnoClick: false,
            lastPickCard: '',
            lastThrowCard: '',
            cardArray: [],
        };
        socket.handshake.auth.tableId = Table === null || Table === void 0 ? void 0 : Table.tableId;
        socket.handshake.auth.seatIndex = 0;
        yield (0, joinRoom_1.JoinRoom)(socket, Table.tableId);
        UserDetails.tableId = Table.tableId;
        yield (0, gameRedisOperations_1.SetUser)(UserDetails.userId, UserDetails);
        yield (0, gameRedisOperations_1.SetTable)(Table.tableId, Table);
        yield (0, gameRedisOperations_1.SetUserInTable)(UserDetails.userId, UserInTable);
        yield (0, gameRedisOperations_1.SetEmptyTable)(UserDetails.bootValue, UserDetails.playerCount, Table.tableId);
        return Table;
    }
    catch (error) {
        (0, logger_1.Logger)('CreateNewTable Error : ', error);
    }
    ;
});

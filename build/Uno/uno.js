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
exports.Uno = void 0;
const logger_1 = require("../Logger/logger");
const redlock_1 = require("../Connection/redlock");
const Constants_1 = require("../Constants");
const gameRedisOperations_1 = require("../GameRedisOperations/gameRedisOperations");
const emitter_1 = require("../Connection/emitter");
const Uno = (en, socket, Data) => __awaiter(void 0, void 0, void 0, function* () {
    const Path = 'Uno';
    const { ERROR_POPUP, UNO } = Constants_1.CONSTANTS.EVENTS_NAME;
    const { LOCK, TABLES } = Constants_1.CONSTANTS.REDIS_COLLECTION;
    const TablelockId = `${LOCK}:${TABLES}:${Data === null || Data === void 0 ? void 0 : Data.tableId}`;
    const Tablelock = yield (0, redlock_1.ApplyLock)(Path, TablelockId);
    try {
        (0, logger_1.Logger)("Uno", JSON.stringify({ Data }));
        let TableDetails = yield (0, gameRedisOperations_1.GetTable)(Data === null || Data === void 0 ? void 0 : Data.tableId);
        if (!TableDetails) {
            throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND);
        }
        ;
        // if (TableDetails.currentTurn !== Data?.seatIndex) {
        //     return EventEmitter.emit(ERROR_POPUP, { en: ERROR_POPUP, SocketId: socket.id, Data: { Message: CONSTANTS.ERROR_MESSAGES.NOT_YOUR_TURN } });
        // };
        const UserAvailableInTable = TableDetails.playersArray.find(e => { return e.userId === (Data === null || Data === void 0 ? void 0 : Data.userId); });
        if (!UserAvailableInTable) {
            return emitter_1.EventEmitter.emit(ERROR_POPUP, { en: ERROR_POPUP, SocketId: socket.id, Data: { Message: Constants_1.CONSTANTS.ERROR_MESSAGES.WRONG_TABLE } });
        }
        ;
        let UserInTableDetails = yield (0, gameRedisOperations_1.GetUserInTable)(Data === null || Data === void 0 ? void 0 : Data.userId);
        if (!UserInTableDetails) {
            throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.USER_IN_TABLE_NOT_FOUND);
        }
        ;
        if (UserInTableDetails.cardArray.length !== 1) {
            return emitter_1.EventEmitter.emit(ERROR_POPUP, { en: ERROR_POPUP, SocketId: socket.id, Data: { Message: Constants_1.CONSTANTS.ERROR_MESSAGES.UNO_NOT_POSSIBLE } });
        }
        ;
        if (UserInTableDetails.isUnoClick) {
            return emitter_1.EventEmitter.emit(ERROR_POPUP, { en: ERROR_POPUP, SocketId: socket.id, Data: { Message: Constants_1.CONSTANTS.ERROR_MESSAGES.ALREADY_CLICKED_UNO } });
        }
        ;
        UserInTableDetails.isUnoClick = true;
        yield (0, gameRedisOperations_1.SetUserInTable)(UserInTableDetails.userId, UserInTableDetails);
        emitter_1.EventEmitter.emit(UNO, { en: UNO, RoomId: TableDetails.tableId, Data });
    }
    catch (error) {
        (0, logger_1.Logger)('Uno Error : ', error);
    }
    finally {
        yield (0, redlock_1.RemoveLock)(Path, Tablelock);
    }
    ;
});
exports.Uno = Uno;

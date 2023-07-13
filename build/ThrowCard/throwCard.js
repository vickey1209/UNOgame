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
exports.ThrowCard = void 0;
const logger_1 = require("../Logger/logger");
const Constants_1 = require("../Constants");
const redlock_1 = require("../Connection/redlock");
const gameRedisOperations_1 = require("../GameRedisOperations/gameRedisOperations");
const emitter_1 = require("../Connection/emitter");
const BullTimer_1 = require("../BullTimer");
const changeUserTurn_1 = require("../ChangeUserTurn/changeUserTurn");
const GameActions_1 = require("../GameActions");
const uno_1 = require("../Uno/uno");
const ThrowCard = (en, socket, Data) => __awaiter(void 0, void 0, void 0, function* () {
    // const ThrowCard = async (en: string, socket: Socket, Data: ThrowCardInterface) => {
    const Path = 'ThrowCard';
    const { ERROR_POPUP, THROW_CARD } = Constants_1.CONSTANTS.EVENTS_NAME;
    const { LOCK, TABLES } = Constants_1.CONSTANTS.REDIS_COLLECTION;
    const TablelockId = `${LOCK}:${TABLES}:${Data === null || Data === void 0 ? void 0 : Data.tableId}`;
    const Tablelock = yield (0, redlock_1.ApplyLock)(Path, TablelockId);
    try {
        (0, logger_1.Logger)("ThrowCard", JSON.stringify({ Data }));
        let TableDetails = yield (0, gameRedisOperations_1.GetTable)(Data === null || Data === void 0 ? void 0 : Data.tableId);
        let isWrongCard = true;
        if (!TableDetails) {
            throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND);
        }
        ;
        if (TableDetails.isTurnLock) {
            return emitter_1.EventEmitter.emit(ERROR_POPUP, { en: ERROR_POPUP, SocketId: socket.id, Data: { Message: Constants_1.CONSTANTS.ERROR_MESSAGES.WAIT_FOR_TURN_INFO } });
        }
        ;
        if (TableDetails.currentTurn !== (Data === null || Data === void 0 ? void 0 : Data.seatIndex)) {
            return emitter_1.EventEmitter.emit(ERROR_POPUP, { en: ERROR_POPUP, SocketId: socket.id, Data: { Message: Constants_1.CONSTANTS.ERROR_MESSAGES.NOT_YOUR_TURN } });
        }
        ;
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
        if (!UserInTableDetails.cardArray.includes(Data === null || Data === void 0 ? void 0 : Data.card)) {
            return emitter_1.EventEmitter.emit(ERROR_POPUP, { en: ERROR_POPUP, SocketId: socket.id, Data: { Message: Constants_1.CONSTANTS.ERROR_MESSAGES.NOT_YOUR_CARD } });
        }
        ;
        if (UserInTableDetails.lastPickCard !== '' && UserInTableDetails.lastPickCard !== (Data === null || Data === void 0 ? void 0 : Data.card)) {
            return emitter_1.EventEmitter.emit(ERROR_POPUP, { en: ERROR_POPUP, SocketId: socket.id, Data: { Message: Constants_1.CONSTANTS.ERROR_MESSAGES.MUST_THROW_PICK_CARD } });
        }
        ;
        if ((Data === null || Data === void 0 ? void 0 : Data.card.split("-")[0]) === Constants_1.CONSTANTS.UNO_CARDS.CARDS_TYPE.WILD_CARD && (Data === null || Data === void 0 ? void 0 : Data.cardType) === Constants_1.CONSTANTS.UNO_CARDS.CARDS_TYPE.PLUS_FOUR) {
            isWrongCard = false;
        }
        ;
        if ((Data === null || Data === void 0 ? void 0 : Data.card.split("-")[0]) === Constants_1.CONSTANTS.UNO_CARDS.CARDS_TYPE.WILD_CARD && TableDetails.numberOfCardToPick === 0) {
            isWrongCard = false;
        }
        ;
        // if (Data?.card.split("-")[0] === CONSTANTS.UNO_CARDS.CARDS_TYPE.WILD_CARD && TableDetails.activeCardType !== CONSTANTS.UNO_CARDS.CARDS_TYPE.PLUS_FOUR && TableDetails.numberOfCardToPick === 0) { isWrongCard = false; };
        // if (Data?.card.split("-")[0] === CONSTANTS.UNO_CARDS.CARDS_TYPE.WILD_CARD && TableDetails.activeCardType !== CONSTANTS.UNO_CARDS.CARDS_TYPE.PLUS_FOUR) { isWrongCard = false; };
        if (TableDetails.numberOfCardToPick === 0) {
            if (TableDetails.activeCardType === (Data === null || Data === void 0 ? void 0 : Data.cardType) || TableDetails.activeCardColor === (Data === null || Data === void 0 ? void 0 : Data.cardColor)) {
                isWrongCard = false;
            }
        }
        else {
            if (TableDetails.activeCardType === (Data === null || Data === void 0 ? void 0 : Data.cardType)) {
                isWrongCard = false;
            }
            ;
        }
        ;
        // if (TableDetails.numberOfCardToPick !== 0 && Data?.card.split("-")[1] === CONSTANTS.UNO_CARDS.CARDS_TYPE.PLUS_TWO) {
        // };
        // if ((TableDetails.activeCardType === Data?.cardType || TableDetails.activeCardColor === Data?.cardColor) && TableDetails.numberOfCardToPick === 0) { isWrongCard = false; };
        // if (TableDetails.activeCardType === Data?.cardType || TableDetails.activeCardColor === Data?.cardColor) { isWrongCard = false; };
        if (isWrongCard) {
            return emitter_1.EventEmitter.emit(ERROR_POPUP, { en: ERROR_POPUP, SocketId: socket.id, Data: { Message: Constants_1.CONSTANTS.ERROR_MESSAGES.WRONG_CARD } });
        }
        ;
        TableDetails.activeCard = Data === null || Data === void 0 ? void 0 : Data.card;
        TableDetails.activeCardType = Data === null || Data === void 0 ? void 0 : Data.cardType;
        TableDetails.activeCardColor = Data === null || Data === void 0 ? void 0 : Data.cardColor;
        TableDetails.openCardDeck.push(Data === null || Data === void 0 ? void 0 : Data.card);
        UserInTableDetails.lastPickCard = '';
        UserInTableDetails.cardArray.splice(UserInTableDetails.cardArray.indexOf(Data === null || Data === void 0 ? void 0 : Data.card), 1);
        yield (0, gameRedisOperations_1.SetUserInTable)(UserInTableDetails.userId, UserInTableDetails);
        yield (0, gameRedisOperations_1.SetTable)(TableDetails.tableId, TableDetails);
        yield BullTimer_1.BullTimer.CancelJob.CancelUserTurn(TableDetails.tableId, TableDetails.currentTurn);
        emitter_1.EventEmitter.emit(THROW_CARD, { en: THROW_CARD, RoomId: TableDetails.tableId, Data: Data });
        // if (UserInTableDetails.cardArray.length) {
        //     await ChangeUserTurn(TableDetails.tableId, true, UserInTableDetails.cardArray.length);
        // } else {
        //     await GAME_ACTIONS.EndRound(TableDetails.tableId);
        // };
        if (UserAvailableInTable.isBot && UserInTableDetails.cardArray.length === 1) {
            yield (0, uno_1.Uno)(en, socket, { "userId": UserInTableDetails.userId, "tableId": UserInTableDetails.tableId, "seatIndex": UserInTableDetails.seatIndex });
        }
        if (UserInTableDetails.cardArray.length < 1) {
            yield GameActions_1.GAME_ACTIONS.EndRound(TableDetails.tableId, false);
        }
        else {
            yield (0, changeUserTurn_1.ChangeUserTurn)(TableDetails.tableId, true, UserInTableDetails.cardArray.length);
        }
        ;
    }
    catch (error) {
        (0, logger_1.Logger)('ThrowCard Error : ', error);
    }
    finally {
        yield (0, redlock_1.RemoveLock)(Path, Tablelock);
    }
    ;
});
exports.ThrowCard = ThrowCard;

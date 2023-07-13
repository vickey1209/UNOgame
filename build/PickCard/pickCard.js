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
exports.PickCard = void 0;
const Constants_1 = require("../Constants");
const logger_1 = require("../Logger/logger");
const redlock_1 = require("../Connection/redlock");
const gameRedisOperations_1 = require("../GameRedisOperations/gameRedisOperations");
const emitter_1 = require("../Connection/emitter");
const BullTimer_1 = require("../BullTimer");
const changeUserTurn_1 = require("../ChangeUserTurn/changeUserTurn");
const throwCard_1 = require("../ThrowCard/throwCard");
const PickCard = (en, socket, Data) => __awaiter(void 0, void 0, void 0, function* () {
    // const PickCard = async (en: string, socket: Socket, Data: PickCardInterface) => {
    const Path = 'PickCard';
    const { PICK_CARD, ERROR_POPUP } = Constants_1.CONSTANTS.EVENTS_NAME;
    const { LOCK, TABLES } = Constants_1.CONSTANTS.REDIS_COLLECTION;
    const TablelockId = `${LOCK}:${TABLES}:${Data === null || Data === void 0 ? void 0 : Data.tableId}`;
    const Tablelock = yield (0, redlock_1.ApplyLock)(Path, TablelockId);
    try {
        (0, logger_1.Logger)("PickCard", JSON.stringify({ Data }));
        let TableDetails = yield (0, gameRedisOperations_1.GetTable)(Data === null || Data === void 0 ? void 0 : Data.tableId);
        let pickCards = [];
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
        if (UserInTableDetails.lastPickCard !== '') {
            return emitter_1.EventEmitter.emit(ERROR_POPUP, { en: ERROR_POPUP, SocketId: socket.id, Data: { Message: Constants_1.CONSTANTS.ERROR_MESSAGES.CAN_NOT_ABLE_TO_PICK_CARD } });
        }
        ;
        let isPlayableCard = false;
        if (TableDetails.numberOfCardToPick === 0) {
            // if (TableDetails.closeCardDeck.length < 1) { throw new Error(CONSTANTS.ERROR_MESSAGES.NOT_ENOUGH_CARDS) };
            if (TableDetails.closeCardDeck.length) {
                pickCards.push(TableDetails.closeCardDeck[0]);
                if (pickCards[0].split("-")[1] === TableDetails.activeCardType || pickCards[0].split("-")[0] === TableDetails.activeCardColor) {
                    isPlayableCard = true;
                    UserInTableDetails.lastPickCard = pickCards[0];
                }
                ;
                TableDetails.closeCardDeck.splice(0, 1);
                UserInTableDetails.cardArray.push(pickCards[0]);
            }
            ;
        }
        else {
            for (let i = 0; i < TableDetails.numberOfCardToPick; i++) {
                // if (TableDetails.closeCardDeck.length < 1) { throw new Error(CONSTANTS.ERROR_MESSAGES.NOT_ENOUGH_CARDS) };
                if (TableDetails.closeCardDeck.length) {
                    UserInTableDetails.cardArray.push(TableDetails.closeCardDeck[0]);
                    pickCards.push(TableDetails.closeCardDeck[0]);
                    TableDetails.closeCardDeck.splice(0, 1);
                }
                ;
            }
            ;
            TableDetails.numberOfCardToPick = 0;
        }
        ;
        UserInTableDetails.isUnoClick = false;
        yield (0, gameRedisOperations_1.SetUserInTable)(UserInTableDetails.userId, UserInTableDetails);
        yield (0, gameRedisOperations_1.SetTable)(TableDetails.tableId, TableDetails);
        const PickCardResData = Object.assign(Object.assign({}, Data), { pickCards, isPlayableCard });
        emitter_1.EventEmitter.emit(PICK_CARD, { en: PICK_CARD, RoomId: TableDetails.tableId, Data: PickCardResData });
        if (!isPlayableCard) {
            yield BullTimer_1.BullTimer.CancelJob.CancelUserTurn(TableDetails.tableId, TableDetails.currentTurn);
            yield (0, changeUserTurn_1.ChangeUserTurn)(TableDetails.tableId, false, 0);
        }
        else if (UserAvailableInTable.isBot && isPlayableCard) {
            const Fake_Data = {
                card: UserInTableDetails.lastPickCard,
                cardType: UserInTableDetails.lastPickCard.split('-')[1],
                cardColor: UserInTableDetails.lastPickCard.split('-')[0],
                cardIndex: 0,
                userId: UserInTableDetails.userId,
                tableId: UserInTableDetails.tableId,
                seatIndex: UserInTableDetails.seatIndex
            };
            yield (0, throwCard_1.ThrowCard)('THROW_CARD', socket, Fake_Data);
        }
    }
    catch (error) {
        (0, logger_1.Logger)('PickCard Error : ', error);
    }
    finally {
        yield (0, redlock_1.RemoveLock)(Path, Tablelock);
    }
    ;
});
exports.PickCard = PickCard;

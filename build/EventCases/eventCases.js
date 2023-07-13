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
exports.EventCases = void 0;
const logger_1 = require("../Logger/logger");
const emitter_1 = require("../Connection/emitter");
const signUp_1 = require("../SignUp/signUp");
const Constants_1 = require("../Constants");
const throwCard_1 = require("../ThrowCard/throwCard");
const pickCard_1 = require("../PickCard/pickCard");
const keepCard_1 = require("../KeepCard/keepCard");
const leaveTable_1 = require("../Table/leaveTable");
const uno_1 = require("../Uno/uno");
const EventCases = (socket) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        socket.onAny((EventName, Front_Side_Data, ack) => {
            const { TEST, DEFAULT, SIGNUP, THROW_CARD, PICK_CARD, KEEP_CARD, LEAVE_TABLE, UNO, } = Constants_1.CONSTANTS.EVENTS_NAME;
            if (typeof Front_Side_Data === "string") {
                Front_Side_Data = JSON.parse(Front_Side_Data);
            }
            ;
            const Data = Front_Side_Data.data;
            switch (EventName) {
                case TEST:
                    (0, logger_1.Logger)('EventCases TEST', JSON.stringify({ Data }));
                    emitter_1.EventEmitter.emit(TEST, { en: EventName, SocketId: socket.id, Data });
                    break;
                case SIGNUP:
                    (0, logger_1.Logger)('EventCases SIGNUP', JSON.stringify({ Data }));
                    (0, signUp_1.SignUp)(EventName, socket, Data);
                    break;
                case THROW_CARD:
                    (0, logger_1.Logger)('EventCases THROW_CARD', JSON.stringify({ Data }));
                    (0, throwCard_1.ThrowCard)(EventName, socket, Data);
                    break;
                case PICK_CARD:
                    (0, logger_1.Logger)('EventCases PICK_CARD', JSON.stringify({ Data }));
                    (0, pickCard_1.PickCard)(EventName, socket, Data);
                    break;
                case KEEP_CARD:
                    (0, logger_1.Logger)('EventCases KEEP_CARD', JSON.stringify({ Data }));
                    (0, keepCard_1.KeepCard)(EventName, socket, Data);
                    break;
                case LEAVE_TABLE:
                    (0, logger_1.Logger)('EventCases LEAVE_TABLE', JSON.stringify({ Data }));
                    (0, leaveTable_1.LeaveTable)(EventName, socket, Data);
                    break;
                case UNO:
                    (0, logger_1.Logger)('EventCases UNO', JSON.stringify({ Data }));
                    (0, uno_1.Uno)(EventName, socket, Data);
                    break;
                default:
                    (0, logger_1.Logger)("EventCases Default", JSON.stringify({ Data }));
                    emitter_1.EventEmitter.emit(DEFAULT, { en: EventName, SocketId: socket.id, Data: { "Message": "Unknown Event" } });
                    break;
            }
            ;
        });
    }
    catch (error) {
        console.log('EventCases Error : ', error);
    }
    ;
});
exports.EventCases = EventCases;

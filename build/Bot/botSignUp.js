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
exports.BotSignUp = void 0;
const logger_1 = require("../Logger/logger");
const signUp_1 = require("../SignUp/signUp");
const BotSignUp = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, logger_1.Logger)('BotSignUp', JSON.stringify({}));
        const SignUpData = {
            userId: `${Date.now()}`,
            userName: "Bot",
            userProfile: "No",
            chips: 100,
            bootValue: 1,
            playerCount: 2,
            socketId: '',
            tableId: '',
            isBot: true
        };
        let Fake_Socket = {
            id: 'Fake_SocketId',
            handshake: {
                auth: {
                    userId: '',
                    tableId: '',
                    seatIndex: -1,
                    playerCount: 0,
                    bootValue: 0,
                },
            },
        };
        yield (0, signUp_1.SignUp)('SIGNUP', Fake_Socket, SignUpData);
    }
    catch (error) {
        (0, logger_1.Logger)('BotSignUp Error : ', error);
    }
    ;
});
exports.BotSignUp = BotSignUp;

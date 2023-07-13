"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BOT_ACTION = void 0;
const botSignUp_1 = require("./botSignUp");
const takeTurn_1 = require("./takeTurn");
const BOT_ACTION = {
    BotSignUp: botSignUp_1.BotSignUp,
    TakeTurn: takeTurn_1.TakeTurn,
};
exports.BOT_ACTION = BOT_ACTION;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckJob = void 0;
const checkCollectBoot_1 = require("./checkCollectBoot");
const checkRound_1 = require("./checkRound");
const checkUserTurn_1 = require("./checkUserTurn");
const CheckJob = {
    CheckUserTurn: checkUserTurn_1.CheckUserTurn,
    CheckRound: checkRound_1.CheckRound,
    CheckCollectBootValue: checkCollectBoot_1.CheckCollectBootValue,
};
exports.CheckJob = CheckJob;

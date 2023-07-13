"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancelJob = void 0;
const cancelDisconnectUser_1 = require("./cancelDisconnectUser");
const cancelRound_1 = require("./cancelRound");
const cancelTurnInfo_1 = require("./cancelTurnInfo");
const cancelUserTurn_1 = require("./cancelUserTurn");
const CancelJob = {
    CancelUserTurn: cancelUserTurn_1.CancelUserTurn,
    CancelRound: cancelRound_1.CancelRound,
    CancelTurnInfo: cancelTurnInfo_1.CancelTurnInfo,
    CancelDisconnectUser: cancelDisconnectUser_1.CancelDisconnectUser,
};
exports.CancelJob = CancelJob;

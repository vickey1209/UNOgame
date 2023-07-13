"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROCESS_ACTION = void 0;
const collectBootValueProcessAction_1 = require("./collectBootValueProcessAction");
const disconnectUserProcessAction_1 = require("./disconnectUserProcessAction");
const nextRoundProcessAction_1 = require("./nextRoundProcessAction");
const roundProcessAction_1 = require("./roundProcessAction");
const timesUpProcessAction_1 = require("./timesUpProcessAction");
const turnInfoProcessAction_1 = require("./turnInfoProcessAction");
const unoClickProcessAction_1 = require("./unoClickProcessAction");
const userTurnProcessAction_1 = require("./userTurnProcessAction");
const PROCESS_ACTION = {
    CollectBootValueProcessAction: collectBootValueProcessAction_1.CollectBootValueProcessAction,
    UserTurnProcessAction: userTurnProcessAction_1.UserTurnProcessAction,
    RoundProcessAction: roundProcessAction_1.RoundProcessAction,
    NextRoundProcessAction: nextRoundProcessAction_1.NextRoundProcessAction,
    TurnInfoProcessAction: turnInfoProcessAction_1.TurnInfoProcessAction,
    DisconnectUserProcessAction: disconnectUserProcessAction_1.DisconnectUserProcessAction,
    UnoClickProcessAction: unoClickProcessAction_1.UnoClickProcessAction,
    TimesUpProcessAction: timesUpProcessAction_1.TimesUpProcessAction,
};
exports.PROCESS_ACTION = PROCESS_ACTION;

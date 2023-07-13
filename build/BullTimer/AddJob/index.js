"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddJob = void 0;
const collectBoot_1 = require("./collectBoot");
const disconnectUser_1 = require("./disconnectUser");
const nextRound_1 = require("./nextRound");
const round_1 = require("./round");
const timesUp_1 = require("./timesUp");
const turnInfo_1 = require("./turnInfo");
const unoClick_1 = require("./unoClick");
const userTurn_1 = require("./userTurn");
const AddJob = {
    CollectBootValue: collectBoot_1.CollectBootValue,
    UserTurn: userTurn_1.UserTurn,
    Round: round_1.Round,
    NextRound: nextRound_1.NextRound,
    TurnInfo: turnInfo_1.TurnInfo,
    DisconnectUser: disconnectUser_1.DisconnectUser,
    UnoClick: unoClick_1.UnoClick,
    TimesUp: timesUp_1.TimesUp,
};
exports.AddJob = AddJob;

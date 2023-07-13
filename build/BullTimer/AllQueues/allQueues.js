"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimesUpQueue = exports.UnoClickQueue = exports.DisconnectUserQueue = exports.TurnInfoQueue = exports.NextRoundQueue = exports.RoundQueue = exports.UserTurnQueue = exports.CollectBootQueue = void 0;
const bull_1 = __importDefault(require("bull"));
const Config_1 = require("../../Config");
const CONFIG = (0, Config_1.Config)();
const BullRedisOptions = {
    redis: {
        host: CONFIG.Redis.REDIS_HOST,
        port: CONFIG.Redis.REDIS_PORT,
        password: CONFIG.Redis.REDIS_PASSWORD,
        db: CONFIG.Redis.REDIS_DATABASE_NUMBER
    },
    prefix: 'Bull'
};
const CollectBootQueue = new bull_1.default('CollectBoot', BullRedisOptions);
exports.CollectBootQueue = CollectBootQueue;
const UserTurnQueue = new bull_1.default('UserTurn', BullRedisOptions);
exports.UserTurnQueue = UserTurnQueue;
const RoundQueue = new bull_1.default('Round', BullRedisOptions);
exports.RoundQueue = RoundQueue;
const NextRoundQueue = new bull_1.default('NextRound', BullRedisOptions);
exports.NextRoundQueue = NextRoundQueue;
const TurnInfoQueue = new bull_1.default('TurnInfo', BullRedisOptions);
exports.TurnInfoQueue = TurnInfoQueue;
const DisconnectUserQueue = new bull_1.default('DisconnectUser', BullRedisOptions);
exports.DisconnectUserQueue = DisconnectUserQueue;
const UnoClickQueue = new bull_1.default('UnoClick', BullRedisOptions);
exports.UnoClickQueue = UnoClickQueue;
const TimesUpQueue = new bull_1.default('TimesUp', BullRedisOptions);
exports.TimesUpQueue = TimesUpQueue;

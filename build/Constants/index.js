"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONSTANTS = void 0;
const eventsName_1 = __importDefault(require("./eventsName"));
const redisCollection_1 = __importDefault(require("./redisCollection"));
const errorMessages_1 = __importDefault(require("./errorMessages"));
const botPriority_1 = __importDefault(require("./botPriority"));
const UnoCards_1 = require("./UnoCards");
const CONSTANTS = Object.freeze({
    EVENTS_NAME: eventsName_1.default,
    REDIS_COLLECTION: redisCollection_1.default,
    ERROR_MESSAGES: errorMessages_1.default,
    UNO_CARDS: UnoCards_1.UNO_CARDS,
    BOT_PRIORITY: botPriority_1.default
});
exports.CONSTANTS = CONSTANTS;

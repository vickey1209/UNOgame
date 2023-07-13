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
exports.DisconnectUser = void 0;
const Config_1 = require("../../Config");
const logger_1 = require("../../Logger/logger");
const allQueues_1 = require("../AllQueues/allQueues");
const disconnectUserProcess_1 = require("../ProcessJob/disconnectUserProcess");
const CONFIG = (0, Config_1.Config)();
const DisconnectUser = (userId, tableId, bootValue, playerCount) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, logger_1.Logger)("DisconnectUser", JSON.stringify({ userId }));
        const jobId = `${userId}`;
        const options = {
            delay: CONFIG.GamePlay.RETURN_TO_TABLE_TIMER * 1000,
            jobId,
            removeOnComplete: true
        };
        yield allQueues_1.DisconnectUserQueue.add({ userId, tableId, bootValue, playerCount }, options);
    }
    catch (error) {
        (0, logger_1.Logger)('DisconnectUser Error : ', error);
    }
    ;
});
exports.DisconnectUser = DisconnectUser;
allQueues_1.DisconnectUserQueue.process(disconnectUserProcess_1.DisconnectUserProcess);

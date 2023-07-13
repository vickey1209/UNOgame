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
exports.NextRound = void 0;
const Config_1 = require("../../Config");
const Constants_1 = require("../../Constants");
const gameRedisOperations_1 = require("../../GameRedisOperations/gameRedisOperations");
const logger_1 = require("../../Logger/logger");
const allQueues_1 = require("../AllQueues/allQueues");
const nextRoundProcess_1 = require("../ProcessJob/nextRoundProcess");
const NextRound = (tableId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, logger_1.Logger)("NextRound", JSON.stringify({ tableId }));
        const CONFIG = (0, Config_1.Config)();
        let TableDetails = yield (0, gameRedisOperations_1.GetTable)(tableId);
        if (!TableDetails) {
            throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND);
        }
        ;
        const jobId = `${tableId}`;
        const options = {
            delay: CONFIG.GamePlay.NEXT_ROUND_TIMER * 1000,
            jobId,
            removeOnComplete: true
        };
        yield allQueues_1.NextRoundQueue.add({ tableId }, options);
    }
    catch (error) {
        (0, logger_1.Logger)('NextRound Error : ', error);
    }
    ;
});
exports.NextRound = NextRound;
allQueues_1.NextRoundQueue.process(nextRoundProcess_1.NextRoundProcess);

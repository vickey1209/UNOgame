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
exports.UserTurn = void 0;
const Config_1 = require("../../Config");
const Constants_1 = require("../../Constants");
const gameRedisOperations_1 = require("../../GameRedisOperations/gameRedisOperations");
const logger_1 = require("../../Logger/logger");
const allQueues_1 = require("../AllQueues/allQueues");
const userTurnProcess_1 = require("../ProcessJob/userTurnProcess");
const UserTurn = (tableId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, logger_1.Logger)("UserTurn", JSON.stringify({ tableId }));
        const CONFIG = (0, Config_1.Config)();
        let TableDetails = yield (0, gameRedisOperations_1.GetTable)(tableId);
        if (!TableDetails) {
            throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND);
        }
        ;
        const jobId = `${tableId}:${TableDetails.currentTurn}`;
        const options = {
            delay: CONFIG.GamePlay.USER_TURN_TIMER * 1000,
            jobId,
            removeOnComplete: true
        };
        yield allQueues_1.UserTurnQueue.add({ tableId, currentTurn: TableDetails.currentTurn }, options);
    }
    catch (error) {
        (0, logger_1.Logger)('UserTurn Error : ', error);
    }
    ;
});
exports.UserTurn = UserTurn;
allQueues_1.UserTurnQueue.process(userTurnProcess_1.UserTurnProcess);

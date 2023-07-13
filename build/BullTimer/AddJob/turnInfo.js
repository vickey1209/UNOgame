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
exports.TurnInfo = void 0;
const logger_1 = require("../../Logger/logger");
const allQueues_1 = require("../AllQueues/allQueues");
const turnInfoProcess_1 = require("../ProcessJob/turnInfoProcess");
const TurnInfo = (tableId, isSkip, skipSeatIndex, isRevers, delayNumber) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, logger_1.Logger)("TurnInfo", JSON.stringify({ tableId, isSkip, skipSeatIndex, isRevers }));
        const jobId = `${tableId}`;
        const options = {
            delay: delayNumber * 1000,
            jobId,
            removeOnComplete: true
        };
        yield allQueues_1.TurnInfoQueue.add({ tableId, isSkip, skipSeatIndex, isRevers }, options);
    }
    catch (error) {
        (0, logger_1.Logger)('TurnInfo Error : ', error);
    }
    ;
});
exports.TurnInfo = TurnInfo;
allQueues_1.TurnInfoQueue.process(turnInfoProcess_1.TurnInfoProcess);

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
exports.TimesUp = void 0;
const Config_1 = require("../../Config");
const logger_1 = require("../../Logger/logger");
const allQueues_1 = require("../AllQueues/allQueues");
const timesUpProcess_1 = require("../ProcessJob/timesUpProcess");
const TimesUp = (tableId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, logger_1.Logger)("TimesUp", JSON.stringify({ tableId }));
        const CONFIG = (0, Config_1.Config)();
        const jobId = `${tableId}`;
        const options = {
            delay: CONFIG.GamePlay.TIMES_UP_DELAY_TIMER * 1000,
            jobId,
            removeOnComplete: true
        };
        yield allQueues_1.TimesUpQueue.add({ tableId }, options);
    }
    catch (error) {
        (0, logger_1.Logger)('TimesUp Error : ', error);
    }
    ;
});
exports.TimesUp = TimesUp;
allQueues_1.TimesUpQueue.process(timesUpProcess_1.TimesUpProcess);

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
exports.UnoClick = void 0;
const Config_1 = require("../../Config");
const logger_1 = require("../../Logger/logger");
const allQueues_1 = require("../AllQueues/allQueues");
const unoClickProcess_1 = require("../ProcessJob/unoClickProcess");
const UnoClick = (tableId, isSkip, skipSeatIndex, isRevers, delayNumber, unoSeatIndex) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, logger_1.Logger)("UnoClick", JSON.stringify({ tableId, isSkip, skipSeatIndex, isRevers, delayNumber, unoSeatIndex }));
        const CONFIG = (0, Config_1.Config)();
        const jobId = `${tableId}`;
        const options = {
            delay: CONFIG.GamePlay.UNO_CLICK_TIMER * 1000,
            jobId,
            removeOnComplete: true
        };
        yield allQueues_1.UnoClickQueue.add({ tableId, isSkip, skipSeatIndex, isRevers, delayNumber, unoSeatIndex }, options);
    }
    catch (error) {
        (0, logger_1.Logger)('UnoClick Error : ', error);
    }
    ;
});
exports.UnoClick = UnoClick;
allQueues_1.UnoClickQueue.process(unoClickProcess_1.UnoClickProcess);

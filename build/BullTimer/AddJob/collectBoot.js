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
exports.CollectBootValue = void 0;
const Config_1 = require("../../Config");
const logger_1 = require("../../Logger/logger");
const allQueues_1 = require("../AllQueues/allQueues");
const collectBootValueProcess_1 = require("../ProcessJob/collectBootValueProcess");
const CollectBootValue = (tableId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, logger_1.Logger)("CollectBootValue", JSON.stringify({ tableId }));
        const CONFIG = (0, Config_1.Config)();
        const jobId = `${tableId}`;
        const options = {
            delay: CONFIG.GamePlay.GAME_START_TIMER * 1000,
            jobId,
            removeOnComplete: true
        };
        yield allQueues_1.CollectBootQueue.add({ tableId }, options);
    }
    catch (error) {
        (0, logger_1.Logger)('CollectBootValue Error : ', error);
    }
    ;
});
exports.CollectBootValue = CollectBootValue;
allQueues_1.CollectBootQueue.process(collectBootValueProcess_1.CollectBootValueProcess);

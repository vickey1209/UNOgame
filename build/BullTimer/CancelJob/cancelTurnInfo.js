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
exports.CancelTurnInfo = void 0;
const logger_1 = require("../../Logger/logger");
const allQueues_1 = require("../AllQueues/allQueues");
const CancelTurnInfo = (tableId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, logger_1.Logger)("CancelTurnInfo", JSON.stringify({ tableId }));
        const jobId = `${tableId}`;
        const Job = yield allQueues_1.TurnInfoQueue.getJob(jobId);
        if (Job) {
            Job.remove();
        }
        ;
        return;
    }
    catch (error) {
        (0, logger_1.Logger)('CancelTurnInfo Error : ', error);
    }
    ;
});
exports.CancelTurnInfo = CancelTurnInfo;

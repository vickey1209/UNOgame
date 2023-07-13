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
exports.RemainTimeCalculation = void 0;
const logger_1 = require("../../Logger/logger");
const RemainTimeCalculation = (Job) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        (0, logger_1.Logger)("RemainTimeCalculation", JSON.stringify(Job.data));
        if (!Job) {
            return 0;
        }
        ;
        const RemainingTime = (Date.now() - Job.timestamp) / 1000;
        const FixedRemainingTime = Number(RemainingTime.toFixed(2));
        const JobDelayTimer = ((_a = Job === null || Job === void 0 ? void 0 : Job.opts) === null || _a === void 0 ? void 0 : _a.delay) ? Job.opts.delay : 1;
        const JobDelayTimerInSecond = JobDelayTimer / 1000;
        const FixedJobDelayTimer = Number(JobDelayTimerInSecond.toFixed(2));
        const FinalRemainingTime = FixedJobDelayTimer - (FixedRemainingTime * 1);
        const FixedFinalRemainingTime = Number(FinalRemainingTime.toFixed(2));
        if (FixedFinalRemainingTime < 0) {
            return 0;
        }
        ;
        return FixedFinalRemainingTime;
    }
    catch (error) {
        (0, logger_1.Logger)('RemainTimeCalculation Error : ', error);
    }
    ;
});
exports.RemainTimeCalculation = RemainTimeCalculation;

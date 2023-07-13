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
exports.DisconnectUserProcess = void 0;
const logger_1 = require("../../Logger/logger");
const ProcessAction_1 = require("../../ProcessAction");
const DisconnectUserProcess = (job, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, logger_1.Logger)("DisconnectUserProcess", JSON.stringify(job.data));
        done();
        yield ProcessAction_1.PROCESS_ACTION.DisconnectUserProcessAction(job.data);
    }
    catch (error) {
        (0, logger_1.Logger)('DisconnectUserProcess Error : ', error);
    }
    ;
});
exports.DisconnectUserProcess = DisconnectUserProcess;

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
exports.AntiClockWiseTurnChange = exports.ClockWiseTurnChange = void 0;
const logger_1 = require("../../Logger/logger");
const ClockWiseTurnChange = (TableDetails) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, logger_1.Logger)("ClockWiseTurnChange", JSON.stringify({ TableDetails }));
        let NextTurn = TableDetails.currentTurn + 1;
        for (let i = 0; i < TableDetails.playersArray.length; i++) {
            if ((TableDetails.playersArray.length - 1) < NextTurn) {
                NextTurn = 0;
            }
            ;
            if (TableDetails.playersArray[NextTurn].isLeave === true) {
                NextTurn += 1;
            }
            else {
                break;
            }
            ;
        }
        ;
        return NextTurn;
    }
    catch (error) {
        (0, logger_1.Logger)('ClockWiseTurnChange Error : ', error);
    }
    ;
});
exports.ClockWiseTurnChange = ClockWiseTurnChange;
const AntiClockWiseTurnChange = (TableDetails) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, logger_1.Logger)("AntiClockWiseTurnChange", JSON.stringify({ TableDetails }));
        let NextTurn = TableDetails.currentTurn - 1;
        for (let i = TableDetails.playersArray.length; i > 0; i--) {
            if ((TableDetails.playersArray.length - 1) < NextTurn) {
                NextTurn = 0;
            }
            ;
            if (NextTurn < 0) {
                NextTurn = TableDetails.playersArray.length - 1;
            }
            ;
            if (TableDetails.playersArray[NextTurn].isLeave === true) {
                NextTurn -= 1;
            }
            else {
                break;
            }
            ;
        }
        ;
        return NextTurn;
    }
    catch (error) {
        (0, logger_1.Logger)('AntiClockWiseTurnChange Error : ', error);
    }
    ;
});
exports.AntiClockWiseTurnChange = AntiClockWiseTurnChange;

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
exports.IsThrowPossible = void 0;
const Constants_1 = require("../../Constants");
const logger_1 = require("../../Logger/logger");
const IsThrowPossible = (UserInTableDetails, TableDetails) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, logger_1.Logger)("IsThrowPossible", JSON.stringify({ UserInTableDetails }));
        let isThrowPossible = false;
        for (let i = 0; i < UserInTableDetails.cardArray.length; i++) {
            const OneCard = UserInTableDetails.cardArray[i];
            const OneCardColor = OneCard.split("-")[0];
            const OneCardType = OneCard.split("-")[1];
            if (OneCardType === Constants_1.CONSTANTS.UNO_CARDS.CARDS_TYPE.PLUS_FOUR && OneCardColor === Constants_1.CONSTANTS.UNO_CARDS.CARDS_TYPE.WILD_CARD) {
                isThrowPossible = true;
            }
            ;
            if (OneCardType === Constants_1.CONSTANTS.UNO_CARDS.CARDS_TYPE.COLOR_CHANGE && TableDetails.numberOfCardToPick === 0) {
                isThrowPossible = true;
            }
            ;
            // if (OneCardType === CONSTANTS.UNO_CARDS.CARDS_TYPE.COLOR_CHANGE && OneCardColor === CONSTANTS.UNO_CARDS.CARDS_TYPE.WILD_CARD && TableDetails.numberOfCardToPick === 0) { isThrowPossible = true };
            if (TableDetails.numberOfCardToPick === 0) {
                if (OneCardType === TableDetails.activeCardType || OneCardColor === TableDetails.activeCardColor) {
                    isThrowPossible = true;
                }
                ;
            }
            else {
                if (OneCardType === TableDetails.activeCardType) {
                    isThrowPossible = true;
                }
                ;
            }
            ;
            if (isThrowPossible) {
                break;
            }
            ;
        }
        ;
        console.log({ isThrowPossible });
        return isThrowPossible;
    }
    catch (error) {
        (0, logger_1.Logger)('IsThrowPossible Error : ', error);
    }
    ;
});
exports.IsThrowPossible = IsThrowPossible;

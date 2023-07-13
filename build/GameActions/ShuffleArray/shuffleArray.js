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
exports.ShuffleArray = void 0;
const __1 = require("..");
const ShuffleArray = (NormalArray) => __awaiter(void 0, void 0, void 0, function* () {
    const ForLimit = NormalArray.length;
    const Shuffel = [];
    for (let i = 0; i < ForLimit; i++) {
        const RendomNumber = yield __1.GAME_ACTIONS.RandomNumber(0, (NormalArray.length - 1));
        Shuffel.push(NormalArray[RendomNumber]);
        NormalArray.splice(RendomNumber, 1);
    }
    ;
    return Shuffel;
});
exports.ShuffleArray = ShuffleArray;

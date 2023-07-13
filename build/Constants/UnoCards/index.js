"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UNO_CARDS = void 0;
const allUnoCards_1 = __importDefault(require("./allUnoCards"));
const simpleUnoCards_1 = __importDefault(require("./simpleUnoCards"));
const specialUnoCards_1 = __importDefault(require("./specialUnoCards"));
const cardsType_1 = __importDefault(require("./cardsType"));
const UNO_CARDS = Object.freeze({
    ALL_UNO_CARDS: allUnoCards_1.default,
    SIMPLE_UNO_CARDS: simpleUnoCards_1.default,
    SPECIAL_UNO_CARDS: specialUnoCards_1.default,
    CARDS_TYPE: cardsType_1.default,
});
exports.UNO_CARDS = UNO_CARDS;

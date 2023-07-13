"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventEmitter = void 0;
const events_1 = __importDefault(require("events"));
const EventEmitter = new events_1.default();
exports.EventEmitter = EventEmitter;

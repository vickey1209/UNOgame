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
exports.AllKeys = exports.LRange = exports.RPush = exports.DeleteData = exports.GetData = exports.SetData = void 0;
const logger_1 = require("../Logger/logger");
const redis_1 = require("./../Connection/redis");
const SetData = (key, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, logger_1.Logger)('SetData', JSON.stringify({ key, data }));
        let Data = yield redis_1.redisClient.set(key, JSON.stringify(data));
        return Data;
    }
    catch (error) {
        (0, logger_1.Logger)('SetData Error', error);
    }
});
exports.SetData = SetData;
const GetData = (key) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, logger_1.Logger)('GetData', JSON.stringify({ key }));
        let Data = yield redis_1.redisClient.get(key);
        if (Data)
            return Data = JSON.parse(Data);
        return '';
    }
    catch (error) {
        (0, logger_1.Logger)('GetData Error', error);
    }
});
exports.GetData = GetData;
const DeleteData = (key) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, logger_1.Logger)('DeleteData', JSON.stringify({ key }));
        yield redis_1.redisClient.del(key);
    }
    catch (error) {
        (0, logger_1.Logger)('DeleteData Error', error);
    }
});
exports.DeleteData = DeleteData;
const RPush = (key, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, logger_1.Logger)('RPush', JSON.stringify({ key, data }));
        yield redis_1.redisClient.rPush(key, JSON.stringify(data));
    }
    catch (error) {
        (0, logger_1.Logger)('RPush Error', error);
    }
});
exports.RPush = RPush;
const LRange = (key, start, end) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, logger_1.Logger)('LRange', JSON.stringify({ key, start, end }));
        return yield redis_1.redisClient.lRange(key, start, end);
    }
    catch (error) {
        (0, logger_1.Logger)('LRange Error', error);
    }
});
exports.LRange = LRange;
const AllKeys = (key) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, logger_1.Logger)('AllKeys', JSON.stringify({ key }));
        let Data = yield redis_1.redisClient.keys(key);
        Data = Data.length ? Data : '';
        return Data;
    }
    catch (error) {
        (0, logger_1.Logger)('AllKeys Error', error);
    }
});
exports.AllKeys = AllKeys;

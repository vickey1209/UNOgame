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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveLock = exports.ApplyLock = exports.RedLockConnction = void 0;
const redlock_1 = __importDefault(require("redlock"));
const ioredis_1 = __importDefault(require("ioredis"));
const Config_1 = require("../Config");
const logger_1 = require("../Logger/logger");
let redLock;
const RedLockConnction = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const CONFIG = (0, Config_1.Config)();
        const redisDetails = {
            host: CONFIG.Redis.REDIS_HOST,
            port: CONFIG.Redis.REDIS_PORT,
            password: CONFIG.Redis.REDIS_PASSWORD,
            db: CONFIG.Redis.REDIS_DATABASE_NUMBER
        };
        const redisClient = new ioredis_1.default(redisDetails);
        redLock = new redlock_1.default([redisClient], {
            driftFactor: 0.01,
            retryCount: -1,
            retryDelay: 25,
            retryJitter: 20,
            // automaticExtensionThreshold: 500
        });
        redLock.on('error', (error) => {
            const CurrentDate = new Date();
            console.log(`RedLock > ${CurrentDate} > ${CurrentDate.getMilliseconds()}`, error);
        });
        console.log('RedLock Connected !');
    }
    catch (error) {
        console.log('RedLockConnction Error : ', error);
    }
    ;
});
exports.RedLockConnction = RedLockConnction;
const ApplyLock = (Path, LockId) => __awaiter(void 0, void 0, void 0, function* () {
    return;
    try {
        (0, logger_1.Logger)("ApplyLock", JSON.stringify({ Path, LockId }));
        const Lock = yield redLock.acquire([LockId], 2 * 1000);
        return Lock;
    }
    catch (error) {
        (0, logger_1.Logger)('ApplyLock Error : ', error);
    }
    ;
});
exports.ApplyLock = ApplyLock;
const RemoveLock = (Path, Lock) => __awaiter(void 0, void 0, void 0, function* () {
    return;
    try {
        (0, logger_1.Logger)("RemoveLock", JSON.stringify({ Path }));
        yield Lock.release();
    }
    catch (error) {
        (0, logger_1.Logger)('RemoveLock Error : ', error);
    }
    ;
});
exports.RemoveLock = RemoveLock;

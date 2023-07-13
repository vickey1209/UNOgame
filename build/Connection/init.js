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
exports.Initialize = void 0;
require("dotenv/config");
const http_1 = require("./http");
const https_1 = require("./https");
const redis_1 = require("./redis");
const redlock_1 = require("./redlock");
const socket_1 = require("./socket");
const emitterOn_1 = require("./emitterOn");
const Config_1 = require("../Config");
const Initialize = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ENVIRONMENT } = process.env;
        const CONFIG = (0, Config_1.Config)();
        console.log(new Date());
        console.log('CONFIG >', CONFIG);
        if (ENVIRONMENT === 'live') {
            yield Promise.all([
                (0, https_1.HttpsConnection)(),
                (0, redis_1.RedisConnection)(),
                (0, socket_1.SocketConnection)(),
                (0, redlock_1.RedLockConnction)(),
                (0, emitterOn_1.EmitterON)(),
            ]);
        }
        else {
            yield Promise.all([
                (0, http_1.HttpConnection)(),
                (0, redis_1.RedisConnection)(),
                (0, socket_1.SocketConnection)(),
                (0, redlock_1.RedLockConnction)(),
                (0, emitterOn_1.EmitterON)(),
            ]);
        }
    }
    catch (error) {
        console.log('Initialize Error : ', error);
    }
});
exports.Initialize = Initialize;

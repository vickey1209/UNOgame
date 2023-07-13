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
exports.io = exports.SocketConnection = void 0;
require("dotenv/config");
const socket_io_1 = require("socket.io");
const http_1 = require("./http");
const https_1 = require("./https");
const redis_adapter_1 = require("@socket.io/redis-adapter");
const redis_1 = require("./redis");
const logger_1 = require("../Logger/logger");
const eventCases_1 = require("../EventCases/eventCases");
let io;
exports.io = io;
const SocketConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ENVIRONMENT } = process.env;
        const server = ENVIRONMENT === 'live' ? https_1.httpsServer : http_1.httpServer;
        exports.io = io = new socket_io_1.Server(server);
        io.adapter((0, redis_adapter_1.createAdapter)(redis_1.pubClient, redis_1.subClient));
        console.log(`Socket IO Done !`);
        io.on('connection', (socket) => __awaiter(void 0, void 0, void 0, function* () {
            (0, logger_1.Logger)("SocketConnection", JSON.stringify(socket.id));
            (0, eventCases_1.EventCases)(socket);
            socket.on('disconnect', (reason) => __awaiter(void 0, void 0, void 0, function* () {
                yield socket.disconnect();
                (0, logger_1.Logger)("Disconnect", JSON.stringify(socket.id));
                (0, logger_1.Logger)("Disconnect Reason.", JSON.stringify(reason));
                // await DisconnectHandler(socket);
            }));
        }));
    }
    catch (error) {
        console.log('SocketConnection Error : ', error);
    }
});
exports.SocketConnection = SocketConnection;

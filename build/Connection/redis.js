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
exports.subClient = exports.pubClient = exports.redisClient = exports.RedisConnection = void 0;
const redis_1 = require("redis");
const Config_1 = require("../Config");
const ioredis_1 = __importDefault(require("ioredis"));
let redisClient, pubClient, subClient;
exports.redisClient = redisClient;
exports.pubClient = pubClient;
exports.subClient = subClient;
const RedisConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const CONFIG = (0, Config_1.Config)();
        const RedisOptions = {
            socket: {
                host: CONFIG.Redis.REDIS_HOST,
                port: CONFIG.Redis.REDIS_PORT
            },
            password: CONFIG.Redis.REDIS_PASSWORD,
            database: CONFIG.Redis.REDIS_DATABASE_NUMBER
        };
        const PubSubRedisOptions = {
            host: CONFIG.PubSubRedis.PUBSUB_REDIS_HOST,
            port: CONFIG.PubSubRedis.PUBSUB_REDIS_PORT,
            password: CONFIG.PubSubRedis.PUBSUB_REDIS_PASSWORD,
            db: CONFIG.PubSubRedis.PUBSUB_REDIS_DATABASE_NUMBER
        };
        exports.pubClient = pubClient = new ioredis_1.default(PubSubRedisOptions);
        exports.subClient = subClient = new ioredis_1.default(PubSubRedisOptions);
        exports.redisClient = redisClient = (0, redis_1.createClient)(RedisOptions);
        redisClient.connect();
        redisClient.on('connect', () => {
            console.log('Redis Connected !');
            redisClient.flushDb();
        });
        redisClient.on('error', (error) => {
            console.log(`Redis Error : ${error}`);
        });
    }
    catch (error) {
        console.log('RedisConnection Error : ', error);
    }
    ;
});
exports.RedisConnection = RedisConnection;

import { createClient, RedisClientOptions } from 'redis';
import { Config } from '../Config';
import IORedis from 'ioredis';

let redisClient: any, pubClient: any, subClient: any;

const RedisConnection = async () => {

    try {

        const CONFIG = Config();

        const RedisOptions: RedisClientOptions = {

            socket: {
                host: CONFIG.Redis.REDIS_HOST,
                port: CONFIG.Redis.REDIS_PORT
            },
            password: CONFIG.Redis.REDIS_PASSWORD,
            database: CONFIG.Redis.REDIS_DATABASE_NUMBER
        };

        const PubSubRedisOptions: any = {

            host: CONFIG.PubSubRedis.PUBSUB_REDIS_HOST,
            port: CONFIG.PubSubRedis.PUBSUB_REDIS_PORT,
            password: CONFIG.PubSubRedis.PUBSUB_REDIS_PASSWORD,
            db: CONFIG.PubSubRedis.PUBSUB_REDIS_DATABASE_NUMBER

        };

        pubClient = new IORedis(PubSubRedisOptions);
        subClient = new IORedis(PubSubRedisOptions);

        redisClient = createClient(RedisOptions);

        redisClient.connect();

        redisClient.on('connect', () => {

            // redisClient.flushDb()

            console.log('Redis Connected !');
            
        });

        redisClient.on('error', (error: any) => { console.log(`Redis Error : ${error}`); });

    } catch (error) {
        console.log('RedisConnection Error : ', error);
    };
};

export { RedisConnection, redisClient, pubClient, subClient };
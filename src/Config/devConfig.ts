import 'dotenv/config';
import { ConfigInterface } from '../Interface/Config/ConfigInterface';

const DevConfig = (): ConfigInterface => {

    const { ENVIRONMENT, SERVER_PORT } = process.env;

    const Redis = {

        // ! Redis
        REDIS_HOST: '127.0.0.1',
        REDIS_PORT: 6379,
        REDIS_PASSWORD: '',
        REDIS_DATABASE_NUMBER: 2

    };

    const PubSubRedis = {

        // ! Redis
        PUBSUB_REDIS_HOST: '127.0.0.1',
        PUBSUB_REDIS_PORT: 6379,
        PUBSUB_REDIS_PASSWORD: '',
        PUBSUB_REDIS_DATABASE_NUMBER: 2

    };

    const ServerPort = SERVER_PORT ? Number(SERVER_PORT) : 8000;

    const Environment = ENVIRONMENT ? ENVIRONMENT : 'dev';

    const GamePlay = {

        LOG: true,

        GAME_START_TIMER: 2,
        USER_TURN_TIMER: 15,

        MIN_SPECIAL_CARD: 0,
        MAX_SPECIAL_CARD: 3,

    }


    return { Redis, PubSubRedis, ServerPort, GamePlay, Environment };

};

export { DevConfig };
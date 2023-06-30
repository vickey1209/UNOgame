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

        PLUS_ON_PLUS: true,

        GAME_START_TIMER: 4,
        USER_TURN_TIMER: 60,
        ROUND_TIMER: 5,
        NEXT_ROUND_TIMER: 5,

        DISTRIBUTE_CARDS_LIMIT: 10,
        MIN_SPECIAL_CARD: 0,
        MAX_SPECIAL_CARD: 3,

        TOTAL_ROUND_NUMBER: 3,

        ZERO_POINT: 10,
        SKIP_POINT: 20,
        REVERS_POINT: 20,
        PUSE_TWO_POINT: 20,
        PUSE_FOUR_POINT: 50,
        COLOR_CHANGE_POINT: 35,

    };

    return { Redis, PubSubRedis, ServerPort, GamePlay, Environment };

};

export { DevConfig };
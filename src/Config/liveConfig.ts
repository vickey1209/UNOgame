import 'dotenv/config';
import { ConfigInterface } from '../Interface/Config/ConfigInterface';

const LiveConfig = (): ConfigInterface => {

    const {

        ENVIRONMENT,

        REDIS_HOST,
        REDIS_PORT,
        REDIS_PASSWORD,
        REDIS_DATABASE_NUMBER,

        PUBSUB_REDIS_HOST,
        PUBSUB_REDIS_PORT,
        PUBSUB_REDIS_PASSWORD,
        PUBSUB_REDIS_DATABASE_NUMBER,

        SERVER_PORT,
        SERVER_CERT_PATH,
        SERVER_KEY_PATH,

    } = process.env;


    const Redis = {

        // ! Redis
        REDIS_HOST: REDIS_HOST ? REDIS_HOST : '127.0.0.1',
        REDIS_PORT: REDIS_PORT ? Number(REDIS_PORT) : 6379,
        REDIS_PASSWORD: REDIS_PASSWORD ? REDIS_PASSWORD : '',
        REDIS_DATABASE_NUMBER: REDIS_DATABASE_NUMBER ? Number(REDIS_DATABASE_NUMBER) : 2

    };

    const PubSubRedis = {

        // ! Redis
        PUBSUB_REDIS_HOST: PUBSUB_REDIS_HOST ? PUBSUB_REDIS_HOST : '127.0.0.1',
        PUBSUB_REDIS_PORT: PUBSUB_REDIS_PORT ? Number(PUBSUB_REDIS_PORT) : 6379,
        PUBSUB_REDIS_PASSWORD: PUBSUB_REDIS_PASSWORD ? PUBSUB_REDIS_PASSWORD : '',
        PUBSUB_REDIS_DATABASE_NUMBER: PUBSUB_REDIS_DATABASE_NUMBER ? Number(PUBSUB_REDIS_DATABASE_NUMBER) : 2

    };

    const ServerPort = SERVER_PORT ? Number(SERVER_PORT) : 8000;
    const CertPath = SERVER_CERT_PATH ? SERVER_CERT_PATH : '';
    const KeyPath = SERVER_KEY_PATH ? SERVER_KEY_PATH : '';

    const Environment = ENVIRONMENT ? ENVIRONMENT : 'dev';

    const GamePlay = {

        LOG: true,

        PLUS_ON_PLUS: false,

        GAME_START_TIMER: 5,
        USER_TURN_TIMER: 30,

        DISTRIBUTE_CARDS_LIMIT: 7,
        MIN_SPECIAL_CARD: 0,
        MAX_SPECIAL_CARD: 3,

    }

    return { Redis, PubSubRedis, ServerPort, CertPath, KeyPath, GamePlay, Environment };

};

export { LiveConfig };
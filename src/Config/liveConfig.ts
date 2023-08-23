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

        PLUS_ON_PLUS: true,

        GAME_START_TIMER: 4,
        USER_TURN_TIMER: 15,
        ROUND_TIMER: 300,
        NEXT_ROUND_TIMER: 10,
        RETURN_TO_TABLE_TIMER: 30,
        UNO_CLICK_TIMER: 2,
        CLEAR_TABLE_DATA_TIMER: 30,

        DISTRIBUTE_CARDS_LIMIT: 12,
        MIN_SPECIAL_CARD: 0,
        MAX_SPECIAL_CARD: 3,
        TURN_TIMEOUT_COUNT: 3,

        TOTAL_ROUND_NUMBER: 2,
        UNO_PENALTY_NUMBER: 2,
        PLUS_TWO_PENALTY_NUMBER: 2,
        PLUS_FOUR_PENALTY_NUMBER: 4,

        ZERO_POINT: 10,
        SKIP_POINT: 20,
        REVERS_POINT: 20,
        PLUS_TWO_POINT: 20,
        PLUS_FOUR_POINT: 50,
        COLOR_CHANGE_POINT: 35,

        DELAY_FOR_SINGLE_PICK: 0.55,
        DELAY_FOR_PLUS_FOUR: 2.2,
        DELAY_FOR_PLUS_TWO: 1,
        DELAY_FOR_COLOR_CHANGE: 2,
        DELAY_FOR_REVERS: 1,
        DELAY_FOR_UNO: 2,
        DELAY_FOR_CARD_DISTRIBUTION: 8.5,
        // DELAY_FOR_CARD_DISTRIBUTION: 6.5,
        DELAY_FOR_TIMES_UP: 2,
        DELAY_FOR_SKIP: 0.5,

    };

    return { Redis, PubSubRedis, ServerPort, CertPath, KeyPath, GamePlay, Environment };

};

export { LiveConfig };
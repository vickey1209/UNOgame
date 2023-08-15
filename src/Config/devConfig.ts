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

        LOG: false,

        PLUS_ON_PLUS: true,

        GAME_START_TIMER: 1,
        USER_TURN_TIMER: 50,
        ROUND_TIMER: 3,
        NEXT_ROUND_TIMER: 1,
        RETURN_TO_TABLE_TIMER: 30,
        UNO_CLICK_TIMER: 2,
        TIMES_UP_DELAY_TIMER: 2,
        CLEAR_TABLE_DATA_TIMER: 30,

        DISTRIBUTE_CARDS_LIMIT: 3,
        MIN_SPECIAL_CARD: 1,
        MAX_SPECIAL_CARD: 3,
        TURN_TIMEOUT_COUNT: 2,

        TOTAL_ROUND_NUMBER: 3,
        UNO_PENALTY_NUMBER: 2,
        PLUS_TWO_PENALTY_NUMBER: 2,
        PLUS_FOUR_PENALTY_NUMBER: 4,

        ZERO_POINT: 10,
        SKIP_POINT: 20,
        REVERS_POINT: 20,
        PLUS_TWO_POINT: 20,
        PLUS_FOUR_POINT: 50,
        COLOR_CHANGE_POINT: 35,

        DELAY_FOR_SINGLE_PICK: 0.5,
        DELAY_FOR_PLUS_FOUR: 2.2,
        DELAY_FOR_PLUS_TWO: 1,
        DELAY_FOR_COLOR_CHANGE: 2,
        DELAY_FOR_REVERS: 1,
        DELAY_FOR_UNO: 20,
        DELAY_FOR_CARD_DISTRIBUTION: 1,
        DELAY_FOR_TIMES_UP: 2,
        DELAY_FOR_SKIP: 0.5,

    };

    return { Redis, PubSubRedis, ServerPort, GamePlay, Environment };

};

export { DevConfig };
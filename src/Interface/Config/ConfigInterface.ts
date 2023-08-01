export interface ConfigInterface {

    Redis: RedisInterface,
    PubSubRedis: PubSubRedisInterface,
    ServerPort: number,
    CertPath?: string, // ! Live Use Only
    KeyPath?: string, // ! Live Use Only
    GamePlay: GamePlayInterface,
    Environment: string
}

export interface RedisInterface {

    REDIS_HOST: string,
    REDIS_PORT: number,
    REDIS_PASSWORD: string,
    REDIS_DATABASE_NUMBER: number,

}

export interface PubSubRedisInterface {

    PUBSUB_REDIS_HOST: string,
    PUBSUB_REDIS_PORT: number,
    PUBSUB_REDIS_PASSWORD: string,
    PUBSUB_REDIS_DATABASE_NUMBER: number,

}

export interface GamePlayInterface {

    LOG: boolean,

    PLUS_ON_PLUS: boolean,

    GAME_START_TIMER: number,
    USER_TURN_TIMER: number,
    ROUND_TIMER: number,
    NEXT_ROUND_TIMER: number,
    RETURN_TO_TABLE_TIMER: number,
    UNO_CLICK_TIMER: number,
    // TIMES_UP_DELAY_TIMER: number,
    GAME_END_TIMER: number,

    DISTRIBUTE_CARDS_LIMIT: number,
    MIN_SPECIAL_CARD: number,
    MAX_SPECIAL_CARD: number,
    TURN_TIMEOUT_COUNT: number,

    TOTAL_ROUND_NUMBER: number,
    UNO_PENALTY_NUMBER: number,

    ZERO_POINT: number,
    SKIP_POINT: number,
    REVERS_POINT: number,
    PLUS_TWO_POINT: number,
    PLUS_FOUR_POINT: number,
    COLOR_CHANGE_POINT: number,

    DELAY_FOR_SINGLE_PICK: number,
    DELAY_FOR_PLUS_FOUR: number,
    DELAY_FOR_PLUS_TWO: number,
    DELAY_FOR_COLOR_CHANGE: number,
    DELAY_FOR_REVERS: number,
    DELAY_FOR_UNO: number,
    DELAY_FOR_CARD_DISTRIBUTION: number,
    DELAY_FOR_TIMES_UP: number,

}
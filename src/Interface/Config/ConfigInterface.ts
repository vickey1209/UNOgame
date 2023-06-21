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

    DISTRIBUTE_CARDS_LIMIT: number,
    MIN_SPECIAL_CARD: number,
    MAX_SPECIAL_CARD: number,

    TOTAL_ROUND_NUMBER: number,

    ZERO_POINT: number,
    SKIP_POINT: number,
    REVERS_POINT: number,
    PUSE_TWO_POINT: number,
    PUSE_FOUR_POINT: number,
    COLOR_CHANGE_POINT: number,
}
import Bull from 'bull';
import { Config } from '../../Config';

const CONFIG = Config();

const BullRedisOptions = {

    redis: {
        host: CONFIG.Redis.REDIS_HOST,
        port: CONFIG.Redis.REDIS_PORT,
        password: CONFIG.Redis.REDIS_PASSWORD,
        db: CONFIG.Redis.REDIS_DATABASE_NUMBER
    },
    prefix: 'Bull'
};

const CollectBootQueue = new Bull('CollectBoot', BullRedisOptions);
const UserTurnQueue = new Bull('UserTurn', BullRedisOptions);
const RoundQueue = new Bull('Round', BullRedisOptions);
const NextRoundQueue = new Bull('NextRound', BullRedisOptions);
const TurnInfoQueue = new Bull('TurnInfo', BullRedisOptions);
const DisconnectUserQueue = new Bull('DisconnectUser', BullRedisOptions);
const UnoClickQueue = new Bull('UnoClick', BullRedisOptions);
const TimesUpQueue = new Bull('TimesUp', BullRedisOptions);
const BotCardThrowQueue = new Bull('BotCardThrow', BullRedisOptions);
const PickCardDelayQueue = new Bull('PickCardDelay', BullRedisOptions);
const RoundScoreDelayQueue = new Bull('RoundScoreDelay', BullRedisOptions);
const BotSignupQueue = new Bull('BotSignup', BullRedisOptions);
const BotTurnQueue = new Bull('BotTurn', BullRedisOptions);

export {

    CollectBootQueue,
    UserTurnQueue,
    RoundQueue,
    NextRoundQueue,
    TurnInfoQueue,
    DisconnectUserQueue,
    UnoClickQueue,
    TimesUpQueue,
    BotCardThrowQueue,
    PickCardDelayQueue,
    RoundScoreDelayQueue,
    BotSignupQueue,
    BotTurnQueue,

};
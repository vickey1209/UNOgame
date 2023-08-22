import Bull from 'bull';
import { Config } from '../../Config';
import { CONSTANTS } from '../../Constants';

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

const CollectBootQueue = new Bull(CONSTANTS.BULL_NAMES.COLLECT_BOOT, BullRedisOptions);
const UserTurnQueue = new Bull(CONSTANTS.BULL_NAMES.USER_TURN, BullRedisOptions);
const RoundQueue = new Bull(CONSTANTS.BULL_NAMES.ROUND, BullRedisOptions);
const NextRoundQueue = new Bull(CONSTANTS.BULL_NAMES.NEXT_ROUND, BullRedisOptions);
const TurnInfoQueue = new Bull(CONSTANTS.BULL_NAMES.TURN_INFO, BullRedisOptions);
const DisconnectUserQueue = new Bull(CONSTANTS.BULL_NAMES.DISCONNECT_USER, BullRedisOptions);
const UnoClickQueue = new Bull(CONSTANTS.BULL_NAMES.UNO_CLICK, BullRedisOptions);
const BotCardThrowQueue = new Bull(CONSTANTS.BULL_NAMES.BOT_CARD_THROW, BullRedisOptions);
const PickCardDelayQueue = new Bull(CONSTANTS.BULL_NAMES.PICK_CARD_DELAY, BullRedisOptions);
const RoundScoreDelayQueue = new Bull(CONSTANTS.BULL_NAMES.ROUND_SCORE_DELAY, BullRedisOptions);
const BotSignupQueue = new Bull(CONSTANTS.BULL_NAMES.BOT_SIGNUP, BullRedisOptions);
const BotTurnQueue = new Bull(CONSTANTS.BULL_NAMES.BOT_TURN, BullRedisOptions);
const GameEndQueue = new Bull(CONSTANTS.BULL_NAMES.GAME_END, BullRedisOptions);
const WinnerDeclareQueue = new Bull(CONSTANTS.BULL_NAMES.WINNER_DECLARE, BullRedisOptions);

// const CollectBootQueue = new Bull('CollectBoot', BullRedisOptions);
// const UserTurnQueue = new Bull('UserTurn', BullRedisOptions);
// const RoundQueue = new Bull('Round', BullRedisOptions);
// const NextRoundQueue = new Bull('NextRound', BullRedisOptions);
// const TurnInfoQueue = new Bull('TurnInfo', BullRedisOptions);
// const DisconnectUserQueue = new Bull('DisconnectUser', BullRedisOptions);
// const UnoClickQueue = new Bull('UnoClick', BullRedisOptions);
// const BotCardThrowQueue = new Bull('BotCardThrow', BullRedisOptions);
// const PickCardDelayQueue = new Bull('PickCardDelay', BullRedisOptions);
// const RoundScoreDelayQueue = new Bull('RoundScoreDelay', BullRedisOptions);
// const BotSignupQueue = new Bull('BotSignup', BullRedisOptions);
// const BotTurnQueue = new Bull('BotTurn', BullRedisOptions);
// const GameEndQueue = new Bull('GameEnd', BullRedisOptions);
// const WinnerDeclareQueue = new Bull('WinnerDeclare', BullRedisOptions);

export {

    CollectBootQueue,
    UserTurnQueue,
    RoundQueue,
    NextRoundQueue,
    TurnInfoQueue,
    DisconnectUserQueue,
    UnoClickQueue,
    BotCardThrowQueue,
    PickCardDelayQueue,
    RoundScoreDelayQueue,
    BotSignupQueue,
    BotTurnQueue,
    GameEndQueue,
    WinnerDeclareQueue,

};
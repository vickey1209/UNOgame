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
}

const CollectBootQueue = new Bull('CollectBoot', BullRedisOptions);
const UserTurnQueue = new Bull('UserTurn', BullRedisOptions);
const RoundQueue = new Bull('Round', BullRedisOptions);
const NextRoundQueue = new Bull('NextRound', BullRedisOptions);


export {

    CollectBootQueue,
    UserTurnQueue,
    RoundQueue,
    NextRoundQueue,

};
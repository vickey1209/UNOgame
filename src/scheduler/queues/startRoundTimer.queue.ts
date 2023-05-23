const Bull = require('bull');
import Logger from "../../logger";
import { startRoundTimerProcess } from '../processes/startRoundTimer.process';
import { RedisCred } from '../../interfaces/redis';

import { getConfig } from "../../connection/config";
const { REDIS_HOST, REDIS_PORT, REDIS_AUTH, REDIS_DB } = getConfig();

const SchedulerRedisConfig: RedisCred = {
  host: String(REDIS_HOST),
  port: Number(REDIS_PORT),
  db: Number(REDIS_DB),
  password : String(REDIS_AUTH),
};

const startRoundTimerQueue = new Bull(`startRoundTimer_3Plus`, {
  redis: SchedulerRedisConfig
});

const startRoundTimer = async (data: any) => {
  try {

    Logger.info(`---- startRoundTimer ::=>> ${JSON.stringify(data)}`);
    const options = {
      delay: data.timer, // in ms
      jobId: data.jobId,
      removeOnComplete: true
    };
    await startRoundTimerQueue.add(data, options);
    return startRoundTimerQueue;
  } catch (error) {
    Logger.error(error);
  }
};

startRoundTimerQueue.process(startRoundTimerProcess);

export = startRoundTimer;

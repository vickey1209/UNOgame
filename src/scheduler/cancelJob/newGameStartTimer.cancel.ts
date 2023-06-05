const Bull = require('bull');
import Logger from "../../logger";
import { RedisCred } from '../../interfaces/redis';
import { getConfig } from "../../config";
import url from "url"
const { REDIS_HOST, REDIS_PORT, REDIS_AUTH, REDIS_DB, NODE_ENV, REDIS_CONNECTION_URL } = getConfig();

const SchedulerRedisConfig: RedisCred = {
  host: String(REDIS_HOST),
  port: Number(REDIS_PORT),
  db: Number(REDIS_DB),
  password : String(REDIS_AUTH),
};

let newGameStartTimerQueue : any;
if (NODE_ENV === "PRODUCTION") {
  const { port, hostname, auth } = url.parse(REDIS_CONNECTION_URL);
  newGameStartTimerQueue = new Bull('newGameStartTimer_3Plus', { redis : { host : hostname, port:port, db : Number(REDIS_DB) } });
}else{
  newGameStartTimerQueue = new Bull(`newGameStartTimer_3Plus`, {
    redis: SchedulerRedisConfig,
  });
}

const cancelNewGameStartTimer = async (jobId: any, tableId: string) => {
  try {
    Logger.info(tableId,`---- cancelNewGameStartTimer ::=>> ${jobId}`);
    const job = await newGameStartTimerQueue.getJob(jobId);
    // Logger.info("<<====job=====>>", job);
    
    if (job) {
      await job.remove();
      Logger.info(tableId,"job : cancelNewGameStartTimer :: success");
    }
  } catch (e) {
    Logger.error(tableId,'cancelNewGameStartTimer', e);
  }
};

export = cancelNewGameStartTimer;
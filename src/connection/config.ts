require('dotenv').config();
import Logger from '../logger';


const processEnv = process.env;
let configData: any = null;

function getEnvJSON() {
  // Logger.info('env :::: ', env);

  const PORT = 'PORT';
  const PROTOCOL = 'PROTOCOL'
  const REDIS_PORT = 'REDIS_PORT';
  const REDIS_HOST = 'REDIS_HOST';
  const REDIS_DB = 'REDIS_DB';
  const REDIS_AUTH = 'REDIS_AUTH';


  const pubSubRedisHost = `PUBSUB_REDIS_HOST`;
  const pubSubRedisPort = `PUBSUB_REDIS_PORT`;
  const pubSubRedisPassword = `PUBSUB_REDIS_AUTH`;
  const pubSubRedisDb = `PUBSUB_REDIS_DB`

  const DB_PROTO = 'DB_PROTO';
  const DB_HOST = 'DB_HOST';
  const DB_PORT = 'DB_PORT';
  const DB_USERNAME = 'DB_USERNAME';
  const DB_PASSWORD = 'DB_PASSWORD';
  const DB_NAME = 'DB_NAME';

  const HTTPS_KEY = 'HTTPS_KEY';
  const HTTPS_CERT = 'HTTPS_CERT';

  const GAME_START_TIMER = 'GAME_START_TIMER';
  const LOCK_IN_TIMER = 'LOCK_IN_TIMER';
  const USER_TURN_TIMER = 'USER_TURN_TIMER';
  const SECONDARY_TIMER = 'SECONDARY_TIMER';
  const DECLARE_TIMER = 'DECLARE_TIMER';
  const BOOT_COLLECT_TIMER = 'BOOT_COLLECT_TIMER';
  const TOSS_CARD_TIMER = 'TOSS_CARD_TIMER';
  const CARD_DEALING_TIMER = 'CARD_DEALING_TIMER';
  const REJOIN_TIMER = 'REJOIN_TIMER';
  const MORE_THEN_DISTANCE_TO_JOIN = 'MORE_THEN_DISTANCE_TO_JOIN';
  const ROBOT_SEATNG_IN_TABLE_TIMER = 'ROBOT_SEATNG_IN_TABLE_TIMER';
  const NEW_GAME_START_TIMER = `NEW_GAME_START_TIMER`;
  const WAIT_FOR_OTHER_PLAYER_TIMER = `WAIT_FOR_OTHER_PLAYER_TIMER`


  return Object.freeze({
    PROTOCOL: processEnv[PROTOCOL],
    HTTP_SERVER_PORT: processEnv[PORT],
    REDIS_HOST: processEnv[REDIS_HOST],
    REDIS_AUTH: processEnv[REDIS_AUTH],
    REDIS_PORT: processEnv[REDIS_PORT],
    REDIS_DB: processEnv[REDIS_DB],

    PUBSUB_REDIS_HOST: processEnv[pubSubRedisHost],
    PUBSUB_REDIS_PORT: processEnv[pubSubRedisPort],
    PUBSUB_REDIS_AUTH: processEnv[pubSubRedisPassword],
    PUBSUB_REDIS_DB: processEnv[pubSubRedisDb],

    DB_PROTO: processEnv[DB_PROTO],
    DB_HOST: processEnv[DB_HOST],
    DB_PORT: processEnv[DB_PORT],
    DB_USERNAME: processEnv[DB_USERNAME],
    DB_PASSWORD: processEnv[DB_PASSWORD],
    DB_NAME: processEnv[DB_NAME],

    HTTPS_KEY: processEnv[HTTPS_KEY],
    HTTPS_CERT: processEnv[HTTPS_CERT],


    GAME_START_TIMER: 10000,
    LOCK_IN_TIMER: 5000,
    USER_TURN_TIMER: 30000,
    SECONDARY_TIMER: 15000,
    DECLARE_TIMER: 30000,
    BOOT_COLLECT_TIMER: 3000,
    TOSS_CARD_TIMER: 3000,
    CARD_DEALING_TIMER: 4500,
    REJOIN_TIMER: 60000,
    MORE_THEN_DISTANCE_TO_JOIN: 250,
    ROBOT_SEATNG_IN_TABLE_TIMER: 5000,
    NEW_GAME_START_TIMER: 10000,
    WAIT_FOR_OTHER_PLAYER_TIMER: 15000,
    IS_CLOCKWISE_TURN: false,
    MAXIMUM_TABLE_CREATE_LIMIT : 3

  });
}

function getConfig() {
  // const { NODE_ENV } = process.env;

  // if (NODE_ENV === 'LOCAL') {
  configData = getEnvJSON();
  Logger.info('start local server');
  // } else {
  //   Logger.info('start dev server');
  // }

  return configData;
}

const exportObject = { getConfig };
export = exportObject;

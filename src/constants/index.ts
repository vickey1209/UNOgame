import EVENTS from './event';
import REDIS from './redis';
import SOCKET from './socket';
import TABLE_STATE from './tableState';
import NUMERICAL from './numerical';
import PLAYER_STATE from './playerState';
import SHUFFLE_CARDS from "./shuffleCards";
import MESSAGES from "./messages";
import CARDS_STATUS from "./cardsStatus";
import ERROR_TYPE from "./error";
import MONGO from "./mongo";
import GTI from "./gti";
import EVENT_EMITTER from "./eventEmitter";
import SIGN_UP_TYPES from "./signUpTypes";
import RUMMY_TYPE from "./rummyTypes";

const exportObject = Object.freeze({
  REDIS,
  EVENTS,
  SOCKET,
  TABLE_STATE,
  NUMERICAL,
  PLAYER_STATE,
  SHUFFLE_CARDS,
  EMPTY:'',
  MESSAGES,
  CARDS_STATUS,
  ERROR_TYPE,
  GTI,
  MONGO,
  EVENT_EMITTER,
  SIGN_UP_TYPES,
  RUMMY_TYPE,
});

export = exportObject;

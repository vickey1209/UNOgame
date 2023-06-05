import { verifyUserProfile } from './verifyUserProfile';
import { getUserOwnProfile } from './getUserOwnProfile';
import { wallateDebit } from './walletDebit'
import { multiPlayerWinnScore } from './multiPlayerWinnScore'
import { checkBalance } from "./checkBalance";
import { getOneRobot } from "./getOneRobot";
import { rediusCheck } from "./rediusCheck";
import { firstTimeIntrection } from "./firstTimeIntrection";
import { markCompletedGameStatus } from "./markCompletedGameStatus";
import { checkUserBlockStatus } from "./checkUserBlockStatus";
import { checkMaintanence } from "./checkMaintanence";
import { getLobbyList } from "./getLobbyList";
import { addGameRunningStatus } from "./addGameRunningStatus";



let exportedObj = {
  verifyUserProfile,
  getUserOwnProfile,
  wallateDebit,
  multiPlayerWinnScore,
  checkBalance,
  getOneRobot,
  rediusCheck,
  firstTimeIntrection,
  markCompletedGameStatus,
  checkUserBlockStatus,
  checkMaintanence,
  getLobbyList,
  addGameRunningStatus
};

export = exportedObj;

import Logger from "../logger";
import { leaveTableFormator } from "../InputDataFormator";
import { leaveTableInput } from "../interfaces/inputOutputDataFormator";
import { leaveTable } from '../services/exitTable';
import { errorRes } from '../interfaces/signup';
import { playerGamePlayCache, tableConfigCache, tableGamePlayCache } from "../cache";
import { EVENTS, MESSAGES, NUMERICAL, PLAYER_STATE, TABLE_STATE } from "../constants";
import CommonEventEmitter from '../commonEventEmitter';
import Errors from "../errors";
import Lock from "../lock";
import {shuffleCards} from "../common";
import Scheduler from '../scheduler';
import { getPreviousPlayer,getNextPlayer } from "../services/turn/helper";
import { getPlayingUserInRound } from "../services/common/getPlayingUser";
import { nextTurnPlayerInterface, seatsInterface } from "../interfaces/signup";
import pickFromExtraCardHandler from "../requestHandlers/pickFromExtraCardHandler";


async function givePanelty(data:any) {

  Logger.info(data.tableId," givePanelty :: givePanelty :: ", data);
  const [tableConfig, tableGamePlay] = await Promise.all([
    tableConfigCache.getTableConfig(data.tableId),
    tableGamePlayCache.getTableGamePlay(data.tableId),
  ]);

  if (!tableGamePlay) throw new Errors.UnknownError('Unable to get table game play');
  if (!tableConfig) throw new Errors.UnknownError('Unable to get player game play');

  const activePlayersData: seatsInterface[] = await getPlayingUserInRound(tableGamePlay);

  // change turn user
  let nextPlayer: seatsInterface = {} as seatsInterface;
  if (tableGamePlay.cardTurnCircle === "0-1") {
    nextPlayer = getNextPlayer(activePlayersData, tableGamePlay.currentTurnUserId, data.tableId);
  } else {
    Logger.info(data.tableId," changeTurn :: priviuosPlayer :: ", nextPlayer);
    nextPlayer = await getPreviousPlayer(activePlayersData, tableGamePlay.currentTurnUserId,data.tableId);
    Logger.info(data.tableId,"changeTurn :: nextPlayer :: ", nextPlayer);

  }


  if(data.status === "D4C-"){
    tableGamePlay.currentTurnSeatIndex = nextPlayer.si;
    tableGamePlay.currentTurnUserId = nextPlayer.userId;
    tableGamePlayCache.insertTableGamePlay(tableGamePlay,data.tableId);
    for (let index = 0; index < 4; index++) {
      pickFromExtraCardHandler({id:"auto",userId:nextPlayer.userId,tableId:data.tableId},{isPanelty:true})
    }
  }else if(data.status === "D2C-"){
    tableGamePlay.currentTurnSeatIndex = nextPlayer.si;
    tableGamePlay.currentTurnUserId = nextPlayer.userId;
    tableGamePlayCache.insertTableGamePlay(tableGamePlay,data.tableId);
    for (let index = 0; index < 2; index++) {
      pickFromExtraCardHandler({id:"auto",userId:nextPlayer.userId,tableId:data.tableId},{isPanelty:true})
    }
  }else if(data.status === "-S-"){
    for (let index = 0; index < 2; index++) {
      tableGamePlay.currentTurnSeatIndex = nextPlayer.si;
      tableGamePlay.currentTurnUserId = nextPlayer.userId;
      tableGamePlayCache.insertTableGamePlay(tableGamePlay,data.tableId);
      // Scheduler.cancelJob.cancelPlayerTurnTimer(`${data.tableId}:${nextPlayer.userId}:${tableConfig.currentRound}`,data.tableId);
      // Scheduler.cancelJob.cancelSeconderyTimer(`${data.tableId}:${nextPlayer.userId}:${tableConfig.currentRound}`,data.tableId);
      Scheduler.addJob.nextTurnDelay({
          timer: NUMERICAL.ONE * NUMERICAL.ZERO,
          jobId: `nextTurn:${data.tableId}:${NUMERICAL.ONE}`,
          tableId:data.tableId,
      });
    }
  }else if(data.status === "-RE-"){
    tableGamePlay.cardTurnCircle = tableGamePlay.cardTurnCircle === "0-1" ? "1-0" : "0-1";
    tableGamePlay.currentTurnUserId = nextPlayer.userId;
    tableGamePlayCache.insertTableGamePlay(tableGamePlay,data.tableId);
    // Scheduler.cancelJob.cancelPlayerTurnTimer(`${data.tableId}:${nextPlayer.userId}:${tableConfig.currentRound}`,data.tableId);
    // Scheduler.cancelJob.cancelSeconderyTimer(`${data.tableId}:${nextPlayer.userId}:${tableConfig.currentRound}`,data.tableId);
    Scheduler.addJob.nextTurnDelay({
        timer: NUMERICAL.ONE * NUMERICAL.ZERO,
        jobId: `nextTurn:${data.tableId}:${NUMERICAL.ONE}`,
        tableId:data.tableId,
    });
  }
  // return response;
}

export = givePanelty;
import Logger from "../../logger";
import CommonEventEmitter from '../../commonEventEmitter';
import {
  tableConfigCache,
  playerGamePlayCache,
  tableGamePlayCache
} from '../../cache';
import { successRes } from '../../interfaces/signup';

import {
  onTurnExpireCallInterface,
} from '../../interfaces/userTurn';
import { EMPTY, EVENTS, NUMERICAL } from '../../constants';
// import { selectUserCardToThrow } from '../cardThrow';
import manageAndUpdateData from '../../utils/manageCardData';
import { manageAndUpdateDataInterface } from '../../interfaces/manageAndUpdateData';
import { discardCardResponse } from '../../interfaces/inputOutputDataFormator';
import { formatDiscardCardData } from '../../formatResponseData';
import Scheduler from '../../scheduler';
import leaveTableHandler from '../../requestHandlers/leaveTableHandler';
// import updateTurnHistory from "../turnHistory/updateTurnHistory";
import Lock from "../../lock";
import global = require("../../global");
import { getUserProfile } from "../../cache/userProfile";

async function onTurnExpire(
  data: onTurnExpireCallInterface
): Promise<successRes | boolean> {
  const { tableId, userId } = data;
  const lock = await Lock.getLock().acquire([`${tableId}`], 2000);
  try {
    const tableConfig = await tableConfigCache.getTableConfig(tableId);
    if (!tableConfig) throw Error('Unable to get Table Config Data');

    const { currentRound } = tableConfig;
    Logger.info(tableId,`Starting onTurnExpire for tableId : ${tableId} ,userId : ${userId} and round : ${currentRound}`);

    const [playerGamePlay, tableGamePlay, userData] = await Promise.all([
      playerGamePlayCache.getPlayerGamePlay(userId.toString(), tableId),
      tableGamePlayCache.getTableGamePlay(tableId),
      getUserProfile(userId.toString())
    ])
    if (!tableGamePlay) throw Error('Unable to get Table Game Data');
    if (!playerGamePlay) throw Error('Unable to get Player Game Data');
    if (!userData) throw Error('Unable to get user Game Data');


    const { currentTurnUserId } = tableGamePlay;
    if (currentTurnUserId !== userId) throw Error('Invalid turn in onTurnExpire!');
    Logger.info(tableId," -- onTurnExpire Call : ==>>");

    // const currentCards: string[] = [];
    // playerGamePlay.card.map((ele:any) => {
    //   ele.map((e: string) => { currentCards.push(e) })
    // })
    // Logger.info(tableId," turn expire : currentCards :: ", currentCards, "currentCards.length :: ", currentCards.length);
    // tableGamePlay.isSeconderyTimer = false;

    // if (currentCards.length == NUMERICAL.FOURTEEN) {

      // let throwCardOnTimeOut: string = await selectUserCardToThrow(playerGamePlay, tableGamePlay);
      // Logger.info(tableId," throwCardOnTimeOut :: ", throwCardOnTimeOut);

      // const result = playerGamePlay.card.filter((ele:any) => ele.length > NUMERICAL.ZERO);
      // playerGamePlay.card = result;

      // Logger.info(tableId," playerGamePlay currentCards length ==>>", playerGamePlay.currentCards);
      // Logger.info("==playerGamePlay currentCards length ==>>",  playerGamePlay.currentCards[0].length);
      // const { cards, totalScorePoint, playerGamePlayUpdated }: manageAndUpdateDataInterface =
      //   await manageAndUpdateData(playerGamePlay.currentCards, playerGamePlay);

      // await updateTurnHistory(
      //   tableId,
      //   currentRound,
      //   throwCardOnTimeOut,
      //   playerGamePlay,
      //   true
      // );

      // playerGamePlay.card = playerGamePlayUpdated.currentCards;
      // playerGamePlay.groupingCards = playerGamePlayUpdated.groupingCards;
      // playerGamePlay.cardPoints = totalScorePoint;
      // playerGamePlay.pickFromDeck = EMPTY;
      // playerGamePlay.tCount++;
      // tableGamePlay.opendDeck.unshift(throwCardOnTimeOut);
      tableGamePlay.updatedAt = new Date().toString();
      // tableGamePlay.discardedCardsObj = [{
      //   userId: userId,
      //   card: throwCardOnTimeOut,
      //   seatIndex: playerGamePlay.seatIndex
      // }]

      await Promise.all([
        playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId),
        tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId)
      ])
      let totalScorePoint = 1;
      // const formatedDiscardCardData: discardCardResponse =
        // await formatDiscardCardData(
        //   playerGamePlay.userId,
        //   playerGamePlay.seatIndex,
        //   tableId,
        //   cards,
        //   totalScorePoint,
        //   tableGamePlay.opendDeck
        // );
      //   await formatDiscardCardData(
      //     playerGamePlay.userId,
      //     playerGamePlay.seatIndex,
      //     tableId,
      //     playerGamePlay.card,
      //     totalScorePoint,
      //     tableGamePlay.opendDeck
      //   );

      // Logger.info(tableId,"Auto Discard : formatedDiscardCardData ::: ", formatedDiscardCardData);

      // CommonEventEmitter.emit(EVENTS.DISCARD_CARD_SOCKET_EVENT, {
      //   tableId: tableId,
      //   data: formatedDiscardCardData
      // });

      // Scheduler.cancelJob.cancelPlayerTurnTimer(`${tableId}:${playerGamePlay?.userId}:${tableConfig.currentRound}`,tableId);
      // Scheduler.cancelJob.cancelSeconderyTimer(`${tableId}:${playerGamePlay?.userId}:${tableConfig.currentRound}`,tableId);
      // Scheduler.addJob.nextTurnDelay({
      //   timer: NUMERICAL.ONE * NUMERICAL.ZERO,
      //   jobId: `nextTurn:${tableId}:${currentRound}`,
      //   tableId
      // });
      
    // } else {
    //   Logger.info(tableId," playerGamePlay.turnTimeOut :::", playerGamePlay.turnTimeOut);
    //   playerGamePlay.tCount++;
      playerGamePlay.timeOutCounter++;

      await playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId);

      if (playerGamePlay.timeOutCounter > NUMERICAL.TWO) {
        leaveTableHandler({id : userData?.socketId , tableId : tableId, userId : userId}, { userId, tableId, currentRound: NUMERICAL.ONE });
        return { success: true, error: null, tableId };
      }
    // }

    Scheduler.cancelJob.cancelPlayerTurnTimer(`${tableId}:${playerGamePlay?.userId}:${tableConfig.currentRound}`,tableId);
    Scheduler.cancelJob.cancelSeconderyTimer(`${tableId}:${playerGamePlay?.userId}:${tableConfig.currentRound}`,tableId);
    Scheduler.addJob.nextTurnDelay({
      timer: NUMERICAL.ONE * NUMERICAL.ZERO,
      jobId: `nextTurn:${tableId}:${currentRound}`,
      tableId
    });

    Logger.info(tableId,`Ending onTurnExpire for tableId : ${tableId} ,userId : ${userId} and round : ${currentRound}`);
    return { success: true, error: null, tableId };
  } catch (error) {
    Logger.error(tableId,
      error,
      `table ${tableId} user ${userId} function onTurnExpire`
    );
    Logger.info(tableId,"onTurnExpire() Error :: ==>", error);
    throw new Error(`onTurnExpire() Error :: ==> ${error}`);
  } finally {
    try {
      if (lock) await Lock.getLock().release(lock);
    } catch (error) {
      Logger.error(tableId,error, ' leaveTable ');
    }
  }
}

export = onTurnExpire;

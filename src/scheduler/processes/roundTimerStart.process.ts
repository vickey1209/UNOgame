import CommonEventEmitter from '../../commonEventEmitter';
import Logger from "../../logger"
import Scheduler from "../../scheduler";
import { EVENTS, MESSAGES, NUMERICAL, TABLE_STATE } from '../../constants';
import { getConfig } from "../../config";
import { playerGamePlayCache, tableGamePlayCache, userProfileCache } from '../../cache';
import { ROUND_TIMER_START_TIMER_EXPIED } from '../../constants/eventEmitter';
// import { shuffleCardData } from '../../services/shuffleCards';
// import getCards from '../../utils/getCards';
const { LOCK_IN_TIMER } = getConfig();


export async function roundTimerStartProcess(job: any){
  
  let tableId = job.data.tableId;
   try {
        
    Logger.info(tableId,"roundTimerStartProcess : tableId", tableId);
    
    const tableGamePlay = await tableGamePlayCache.getTableGamePlay(tableId);
    if (!tableGamePlay) { throw Error('Unable to get data'); }
    tableGamePlay.tableStatus = TABLE_STATE.LOCK_IN_PERIOD;
    tableGamePlay.updatedAt = new Date().toString();
    // await tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId);

    CommonEventEmitter.emit(EVENTS.LOCK_IN_PERIOD_SOCKET_EVENT, {
      tableId,
      data: {
        tableId,
        currentRound: NUMERICAL.ONE,
        msg : MESSAGES.ERROR.LOCK_IN_PEROID_MSG
      }
    });
    Logger.info(tableId," <<== LOCK_IN_PERIOD_SOCKET_EVENT ==>> LOCK_IN_TIMER : ", LOCK_IN_TIMER);

    
    // card distribution
    const totalActivePlayer = tableGamePlay.seats.length;
    // const userCards: shuffleCardData = await getCards(tableId, NUMERICAL.ONE, totalActivePlayer);
    // Logger.info(tableId,"  userCards  ==>> ", userCards);
    // tableGamePlay.closedDeck = userCards.closedDeck;
    // tableGamePlay.opendDeck = userCards.opendDeck;
    // tableGamePlay.trumpCard = userCards.trumpCard;
    Logger.info(tableId,"tableGamePlay  card distribution  ::>>", tableGamePlay);
    await tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId);

    for (let i = 0; i < tableGamePlay.seats.length; i++) {

      const playerGamePlay = await playerGamePlayCache.getPlayerGamePlay( tableGamePlay.seats[i].userId.toString(),  tableId)
      if (!playerGamePlay) throw Error('Unable to get data card dealing');

      // playerGamePlay.currentCards = [userCards.cardAndPoint[i].card];
      // playerGamePlay.cardPoints = userCards.cardAndPoint[i].points;
      // playerGamePlay.groupingCards.dwd.push(userCards.cardAndPoint[i].card);

      await playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId);
      Logger.info(tableId,playerGamePlay.userStatus, ' playerGamePlay.userStatus');

    }
    // card distribution

    const jobId = `lockTimerStart:${tableId}`;
    const lockTime = Number(LOCK_IN_TIMER);
    Logger.info('playerGamePlay.userStatus 1111 : ');

    const lockJob = {
      data: {
        timer: lockTime,
        jobId,
        tableId,
        currentRound: NUMERICAL.ONE
      }
    }
    Logger.info('playerGamePlay.userStatus 222 : ');
    CommonEventEmitter.emit(ROUND_TIMER_START_TIMER_EXPIED, lockJob.data);

    return job.data;

  } catch (e) {
    Logger.error(tableId,"roundTimerStartProcess ERROR : " , e);
    return undefined;
  }
};

// export = roundTimerStartProcess;

import Logger from "../../logger";
import Scheduler from '../../scheduler';
import { cardDealing } from '../cardDealing';
import { RoundStartInterface } from '../../interfaces/gameStart';
import { NUMERICAL, PLAYER_STATE, TABLE_STATE } from "../../constants";
import { tableGamePlayCache } from "../../cache";
import { startUserTurn } from "../turn";
import { getAllPlayingUser } from "../common/getAllPlayingUser";

async function cardDealingTimer(
  cardDealData: RoundStartInterface
): Promise<boolean> {
  let { tableId, currentRound } = cardDealData;
  try {

    /** set here start Rummy game turn */
    Logger.info(tableId,`Starting user Turn start for tableId : ${tableId}`);

    const tableGamePlay = await tableGamePlayCache.getTableGamePlay(tableId);
    if (!tableGamePlay) {
      throw Error('Unable to get data at tableGamePlay');
    }

    Logger.info(tableId," tableGamePlay ::: >>", tableGamePlay);
    // Logger.info(tableId," tableGamePlay.dealerPlayer ::: ", tableGamePlay.dealerPlayer);
    // Logger.info(tableId," tableGamePlay.tossWinPlayer ::: ", tableGamePlay.tossWinPlayer);


    if (tableGamePlay.tableStatus === TABLE_STATE.START_DEALING_CARD) {

      let turnSeat = 0;
      let turnUserId = "";
      for (let i = 0; i < tableGamePlay.seats.length; i++) {
        const element = tableGamePlay.seats[i];
        // if (tableGamePlay.tossWinPlayer == element.si && element.userState == PLAYER_STATE.PLAYING) {
        //   turnSeat = i;
        //   break;
        // }
        // else {

          if (element.userState == PLAYER_STATE.PLAYING) {
            turnSeat = element.si;
            turnUserId = element.userId;
            break;
          }

          // for (let j = i + 1; j <= tableGamePlay.seats.length; j++) {
          //   Logger.info(tableId,'IN===> :>> ');
          //   const ele = tableGamePlay.seats[j];
          //   if (ele.userState == PLAYER_STATE.PLAYING) {
          //     turnSeat = j;
          //     turnUserId = ele.userId;
          //     break;
          //   }

          //   if (j === tableGamePlay.seats.length) {

          //     for (let j = 0; j < tableGamePlay.seats.length; j++) {
          //       Logger.info(tableId,'IN==12====> :>> ');
          //       const ele = tableGamePlay.seats[j];
          //       if (ele.userState == PLAYER_STATE.PLAYING) {
          //         turnSeat = j;
          //         turnUserId = ele.userId;
          //         break;
          //       }
          //     }
          //   }

          // }
        // }
      }

      Logger.info(tableId,'turnSeat :>> ', turnSeat);
      // (tableGamePlay.dealerPlayer < tableGamePlay.seats.length - 1) ? turnSeat = tableGamePlay.dealerPlayer + 1 : turnSeat    

      const userData = tableGamePlay.seats[turnSeat];

      tableGamePlay.tableStatus = TABLE_STATE.ROUND_STARTED;
      tableGamePlay.currentTurnSeatIndex = turnSeat;
      tableGamePlay.currentTurnUserId = turnUserId;
      tableGamePlay.updatedAt = new Date().toString();
      // tableGamePlay.isSeconderyTimer = false;
      
      Logger.info(tableId," userData ::: ", userData);
      if (!userData) { throw Error('Unable to get data at userData'); }

      startUserTurn(
        tableId,
        userData?.userId,
        userData?.si,
        tableGamePlay
      );
    }

    return false;
  } catch (e) {
    Logger.error(tableId,'cardDealingTimer error', e);
    throw new Error('cardDealingTimer error');
  }
}


export = cardDealingTimer;

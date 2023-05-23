import Logger from "../../logger";
import {
  tableGamePlayCache,
  tableConfigCache,
  userProfileCache,
  playerGamePlayCache
} from '../../cache';
import { EVENTS, MESSAGES, MONGO, NUMERICAL, PLAYER_STATE, TABLE_STATE } from '../../constants';
import CommonEventEmitter from '../../commonEventEmitter';

import { addGameRunningStatus, getUserOwnProfile, wallateDebit } from "../../clientsideapi";
import { formatBootCollectData } from "../../formatResponseData";


async function firstRoundBootCollect(
  tableId: string,
  currentRound: number
): Promise<boolean> {
  try {
    Logger.info(tableId,`Starting firstRoundBootCollect for tableId : ${tableId}`);
    const [tableConfig, tableGamePlay] = await Promise.all([
      tableConfigCache.getTableConfig(tableId),
      tableGamePlayCache.getTableGamePlay(tableId)
    ]);
    if (!tableGamePlay || !tableConfig) throw Error('Unable to get data');

    let collectBootValueSIArray = <Array<number>>[];
    tableGamePlay.seats.map((ele) => {
      if (ele.userState == PLAYER_STATE.PLAYING) {
        collectBootValueSIArray.push(ele.si);
      }
    })
    Logger.info(tableId," collectBootValueSIArray :: ", collectBootValueSIArray);


    tableGamePlay.tableStatus = TABLE_STATE.COLLECTING_BOOT_VALUE;
    // tableGamePlay.potValue = tableConfig.entryFee * tableConfig.activePlayer * NUMERICAL.EIGHTY;

    await tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId);
    
    for (let v = 0; v < tableGamePlay.seats.length; v++) {

      const userProfile = await userProfileCache.getUserProfile(tableGamePlay.seats[v].userId);
      if (!userProfile) throw Error('Unable to get data');

      if (tableGamePlay.seats[v].userState === PLAYER_STATE.PLAYING) {

        const apiData = {
          tableId,
          tournamentId: userProfile.lobbyId
        }

        const debitAmountDetail = await wallateDebit(apiData, userProfile.authToken, userProfile.socketId);

        const userOwnProfile = await getUserOwnProfile(userProfile.authToken, userProfile.socketId, userProfile.userId);
        const updatedBalance: number = userOwnProfile.bonus + userOwnProfile.winCash + userOwnProfile.cash || 0;
        userProfile.balance = updatedBalance;
        await userProfileCache.setUserProfile(tableGamePlay.seats[v].userId, userProfile);

        const data = await formatBootCollectData(tableConfig, tableGamePlay, collectBootValueSIArray, updatedBalance, tableId);
        CommonEventEmitter.emit(EVENTS.COLLECT_BOOT_VALUE_SOCKET_EVENT, {
          socket: userProfile.socketId,
          data,
          tableId
        });
      }
      
    }

    Logger.info(tableId,`Ending firstRoundBootCollect for tableId : ${tableId}`);
    return true;
  } catch (error: any) {
    Logger.error(tableId,
      error,
      ` table ${tableId} round ${currentRound} funciton firstRoundBootCollect`
    );
    throw new Error(`INTERNAL_ERROR_firstRoundBootCollect() ${error}`);
  }
}

export = firstRoundBootCollect;

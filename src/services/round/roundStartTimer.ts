import Logger from "../../logger"
import { tableConfigCache, tableGamePlayCache } from '../../cache';
import Scheduler from '../../scheduler';
import { EVENTS, TABLE_STATE, NUMERICAL } from '../../constants';
import CommonEventEmitter from '../../commonEventEmitter';
import { countDownInterface } from '../../interfaces/round';
import { countDownResponseFormator } from '../../validateResponse';
import { getConfig } from "../../config";
// import { addLobbyTracking } from "../PlayingTracking/helper";
const { GAME_START_TIMER, LOCK_IN_TIMER } = getConfig();


async function roundStartTimer(
  tableId: string,
  currentRound: number
): Promise<boolean> {
  try {
    Logger.info(tableId,`Starting roundStartTimer for tableId : ${tableId} and round : ${currentRound}`);
    const [tableConfig, tableGamePlay] = await Promise.all([
      tableConfigCache.getTableConfig(tableId),
      tableGamePlayCache.getTableGamePlay(tableId)
    ]);
    if (!tableGamePlay || !tableConfig) {
      throw Error('Unable to get data');
    }

    if (tableGamePlay.currentPlayerInTable >= NUMERICAL.TWO) {

      // Add tracked lobby in db
      // await addLobbyTracking(tableId);

      tableGamePlay.tableStatus = TABLE_STATE.ROUND_TIMER_STARTED;
      tableGamePlay.updatedAt = new Date().toString();
      await tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId);

      let countDown: number = Number(GAME_START_TIMER);
      const countDownData: countDownInterface = {
        time: countDown / NUMERICAL.THOUSAND,
        tableId
      };

      const validatedCountDownData: countDownInterface =
        await countDownResponseFormator(countDownData);

      Logger.info(tableId," CountDownData :: ", validatedCountDownData);

      CommonEventEmitter.emit(EVENTS.GAME_COUNT_DOWN, {
        tableId,
        data: validatedCountDownData
      });

      Logger.info(tableId,`Starting roundStartTimer for tableId : ${tableId} and round : ${currentRound}`);

      const gameStartTimer = Number(Number(GAME_START_TIMER) - Number(LOCK_IN_TIMER));
      Logger.info(tableId,'gameStartTimer :>> ', gameStartTimer);
      const jobId = `${tableConfig.gameType}:roundTimerStart:${tableId}`;

      Scheduler.addJob.roundTimerStart({
        timer: gameStartTimer,
        jobId,
        tableId,
        currentRound: NUMERICAL.ONE
      });

    }
    Logger.info(tableId,`Ending roundStartTimer for tableId : ${tableId} and round : ${currentRound}`);
    return false;

  } catch (error: any) {
    Logger.error(tableId,error, ` table ${tableId} round ${currentRound} function roundStartTimer`);
    throw new Error(`roundTimerStart() ${error}`);
  }
}

export = roundStartTimer;

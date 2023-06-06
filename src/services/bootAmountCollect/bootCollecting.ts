import Logger from "../../logger";
import { tableGamePlayCache,tableConfigCache } from '../../cache';
import Scheduler from '../../scheduler';
import firstRoundBootCollect from './firstRoundBootCollect';
import { getConfig } from "../../config";
const { BOOT_COLLECT_TIMER } = getConfig();

async function bootCollecting(
  tableId: string,
  currentRound: number,
  collectAmountFlag: boolean
): Promise<boolean> {
  try {
    Logger.info(tableId,`Starting bootCollecting for tableId : ${tableId} collectAmountFlag : ${collectAmountFlag}`);   

    const tableGamePlay = await tableGamePlayCache.getTableGamePlay(tableId);
    const tableConfig = await tableConfigCache.getTableConfig(tableId);
    if (!tableConfig) {
      Logger.error(tableId,'error');
      throw Error('Unable to get data');
    }
    if (!tableGamePlay) {
      Logger.error(tableId,'error');
      throw Error('Unable to get data');
    }
    if (collectAmountFlag) {
      await firstRoundBootCollect(tableId, currentRound);
    }

    Logger.info(tableId,`Starting gameStart timer for tableId : ${tableId}`);
    Scheduler.addJob.bootCollectingStartTimer({
      timer: Number(BOOT_COLLECT_TIMER),
      jobId: `${tableConfig.gameType}:gameStart:${tableId}`,
      tableId,
      currentRound,
      // tableGamePlay
    });

    Logger.info(tableId,`Ending bootCollecting for tableId : ${tableId}`);
    return false;
  } catch (error: any) {
    Logger.error(tableId,
      error,
      `  table ${tableId} round ${currentRound} function bootCollecting`
    );
    throw new Error(`INTERNAL_ERROR_bootCollecting() ${error}`);
  }
}


export = bootCollecting;
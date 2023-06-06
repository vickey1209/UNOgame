import { boolean, date } from "joi";
import { startUserTurn } from ".";
import { tableConfigCache } from "../../cache";
import { getPlayerGamePlay } from "../../cache/playerGamePlay";
import { getTableGamePlay, insertTableGamePlay } from "../../cache/tableGamePlay";
import Logger from "../../logger"
import { defaulPlayerGamePlayInterface } from "../../interfaces/playerGamePlay";
import { nextTurnPlayerInterface, seatsInterface } from "../../interfaces/signup";
import getNextPlayer  from "./helper/getNextPlayer";
import { getPlayingUserInRound } from "../common/getPlayingUser";
import CommonEventEmitter from '../../commonEventEmitter';
import { START_USER_TURN } from "../../constants/eventEmitter";
import { getPreviousPlayer } from "./helper";
import { getConfig } from "../../config";
import { defaultTableGamePlayInterface } from "../../interfaces/tableGamePlay";

const changeTurn = async (
  tableId: string,
): Promise<boolean> => {
  const { IS_CLOCKWISE_TURN } = getConfig()
  try {
    console.log('tableTurn ',tableId);
    
    const tableConfig = await tableConfigCache.getTableConfig(tableId);

    if (!tableConfig) { throw new Error('Unable to get table config'); }
    const { currentRound } = tableConfig;
    Logger.info(tableId,`Starting changeTurn for tableId : ${tableId} and round : ${currentRound}`);

    const tableGamePlay = await getTableGamePlay(tableId);
    const tableGamePlayInfo: defaultTableGamePlayInterface = JSON.parse(JSON.stringify(tableGamePlay));
    if (!tableGamePlay) { throw new Error('Unable to get table game play'); }

    const activePlayersData: seatsInterface[] = await getPlayingUserInRound(tableGamePlay);

    // change turn user
    let nextPlayer: seatsInterface = {} as seatsInterface;
    if (IS_CLOCKWISE_TURN) {
      nextPlayer = getNextPlayer(activePlayersData, tableGamePlay.currentTurnUserId, tableId);
    } else {
      Logger.info(tableId," changeTurn :: priviuosPlayer :: ", nextPlayer);
      nextPlayer = await getPreviousPlayer(activePlayersData, tableGamePlay.currentTurnUserId,tableId);
      Logger.info(tableId,"changeTurn :: nextPlayer :: ", nextPlayer);

    }
    Logger.info(tableId,"changeTurn :: nextPlayer :: ", nextPlayer);
    
    tableGamePlayInfo.currentTurnUserId = nextPlayer.userId;
    tableGamePlayInfo.currentTurnSeatIndex = nextPlayer.si;
    tableGamePlayInfo.updatedAt = new Date().toString();
    await insertTableGamePlay(tableGamePlayInfo, tableId);
    Logger.info(tableId," changeTurn :: nextPlayer :: tableGamePlay.currentTurn ::> ", tableGamePlayInfo.currentTurnUserId);
    Logger.info(tableId," changeTurn :: nextPlayer :: tableGamePlay.currentTurnSeatIndex ::> ", tableGamePlayInfo.currentTurnSeatIndex);

    CommonEventEmitter.emit(START_USER_TURN, {
      tableId,
      userId: nextPlayer.userId,
      seatIndex: nextPlayer.si,
      currentTurnSeatIndex: tableGamePlayInfo.currentTurnSeatIndex,
      tableGamePlay : tableGamePlayInfo
    });

    Logger.info(tableId,`Ending changeTurn for tableId : ${tableId} and round : ${currentRound}`);
    return true;
  } catch (error: any) {
    Logger.error(tableId,error, ` table ${tableId} function changeTurn`);
    throw new Error(`INTERNAL_ERROR_changeTurn() =====>> Error=${error}`);
  }
};

export = changeTurn;



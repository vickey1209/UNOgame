import Logger from "../../logger";
import {
  tableGamePlayCache,
  playerGamePlayCache,
  tableConfigCache,
  userProfileCache
} from '../../cache';
import CommonEventEmitter from '../../commonEventEmitter';
import { formateProvidedCardsIF, userCardsInterface } from '../../interfaces/round';
import { formateProvidedCards } from '../../formatResponseData';
import {
  EVENTS,
  NUMERICAL,
  TABLE_STATE,
  PLAYER_STATE

} from '../../constants';
import { manageAndUpdateDataInterface } from "../../interfaces/manageAndUpdateData";
import manageAndUpdateData from "../../utils/manageCardData";
import Lock from "../../lock";
import Scheduler from '../../scheduler';
import { getConfig } from "../../config";
const { CARD_DEALING_TIMER } = getConfig();

async function cardDealing(data:{  tableId: string,
  currentRound: number}
): Promise<boolean> {
  let tableId = data.tableId;
  let currentRound = data.currentRound;
  const lock = await Lock.getLock().acquire([`${tableId}`], 2000);
  try {
    Logger.info(tableId,
      `Starting cardDealing for tableId : ${tableId} and round : ${currentRound}`
    );
    const [tableConfig, tableGamePlay] = await Promise.all([
      tableConfigCache.getTableConfig(tableId),
      tableGamePlayCache.getTableGamePlay(tableId)
    ]);
    if (!tableGamePlay || !tableConfig) throw Error('Unable to get data');
    Logger.info(tableId,"cardDealing :: tableGamePlay  ==>>", tableGamePlay);
    tableGamePlay.tableStatus = TABLE_STATE.START_DEALING_CARD;

    for (let i = 0; i < tableGamePlay.seats.length; i++) {
      const [playerGamePlay, userProfile] = await Promise.all([
        await playerGamePlayCache.getPlayerGamePlay(
          tableGamePlay.seats[i].userId.toString(),
          tableId
        ),
        userProfileCache.getUserProfile(tableGamePlay.seats[i].userId)
      ]);

      if (!playerGamePlay || !userProfile)
        throw Error('Unable to get data card dealing');

      // await playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId);
      Logger.info(tableId,' playerGamePlay.userStatus ::: ', playerGamePlay.userStatus);
      Logger.info(tableId,"userProfile :: ", userProfile)

      if (playerGamePlay.userStatus === PLAYER_STATE.PLAYING) {

        // const { cards, totalScorePoint, playerGamePlayUpdated }: manageAndUpdateDataInterface =
        //   await manageAndUpdateData(playerGamePlay.card, playerGamePlay)

        const formatedProvidedCardData: formateProvidedCardsIF =
          await formateProvidedCards(
            tableId,
            playerGamePlay.userId,
            tableGamePlay.movedCard,
            tableGamePlay.extraCard,
            tableGamePlay.turnCard,
            playerGamePlay.card,
          );

        CommonEventEmitter.emit(EVENTS.PROVIDED_CARDS_EVENT, {
          socket: userProfile.socketId,
          data: formatedProvidedCardData,
          tableId
        });

        // playerGamePlay.card = playerGamePlayUpdated.card;
        // playerGamePlay.groupingCards = playerGamePlayUpdated.groupingCards;
        playerGamePlay.points =0;// totalScorePoint;
      }
      await playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId);
    }
    await Promise.all([
      tableConfigCache.setTableConfig(tableId, tableConfig),
      tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId)
    ]);

    Logger.info(tableId,`Ending cardDealing for tableId : ${tableId} and round : ${currentRound}`);


    Scheduler.addJob.cardDealing({
      timer: Number(CARD_DEALING_TIMER),
      jobId: `${tableConfig.gameType}:cardDealing:${tableId}`,
      tableId,
      currentRound,
      // tableGamePlay
    });

    return true;
  } catch (error: any) {
    Logger.error(tableId,
      error,
      ` table ${tableId} round ${currentRound} function cardDealing `
    );
    Logger.info(tableId,"==== INTERNAL_ERROR_cardDealing() ==== Error:", error);
    throw new Error(`INTERNAL_ERROR_cardDealing() ${error} `);
  }
  finally {
    try {
      if (lock) await Lock.getLock().release(lock);
    } catch (error) {
      Logger.error(tableId,error, ' cardDealing ');
    }
  }
}

export = cardDealing;

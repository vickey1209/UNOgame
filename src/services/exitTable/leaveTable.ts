import Logger from "../../logger"
import { deleteKey } from '../../cache/redisCommon';
import { playerGamePlayCache, tableConfigCache, tableGamePlayCache, userProfileCache } from "../../cache";
import { EMPTY, EVENTS, EVENT_EMITTER, MESSAGES, NUMERICAL, PLAYER_STATE, REDIS, TABLE_STATE } from "../../constants";
import CommonEventEmitter from '../../commonEventEmitter';
import Scheduler from "../../scheduler";
import { defaulPlayerGamePlayInterface } from "../../interfaces/playerGamePlay";
import { UserProfileOutput } from "../../interfaces/userProfile";
import { leaveTableResponse } from "../../interfaces/inputOutputDataFormator";
import { formatLeaveTableData } from "../../formatResponseData";
import winnerAndScoreBoardManage from "../winner/helper/winnerAndScoreBoardManage";
import Lock from '../../lock';
import winnerhandler from "../winner";
import { seatsInterface } from "../../interfaces/signup";
import { tableQueue } from "../../interfaces/tableConfig";
import { setUserProfile } from "../../cache/userProfile";
import { removeQueue, setQueue } from "../common/queue";
// import countPlayingPlayers from "../../utils/countPlayingPlayers";
import { deletePlayerGamePlay } from "../../cache/playerGamePlay";
import { leaveClientInRoom } from "../../socket";
import { markCompletedGameStatus } from "../../clientsideapi";
import { decrCounterLobbyWise } from "../../cache/onlinePlayer";

const leaveTable = async (
  userId: string,
  tableId: string,
  isLeaveEventSend: boolean,
  socketId: string,
): Promise<boolean | undefined> => {
  try {
    Logger.info(tableId,`Starting leaveTable for tableId : ${tableId} and userId : ${userId}`);
    Logger.info(tableId," leaveTable : userId :: ", userId);
    Logger.info(tableId," leaveTable : tableId :: ", tableId);

    const tableConfig = await tableConfigCache.getTableConfig(tableId);
    if (!tableConfig) throw new Error('Unable to get table config');
    const [tableGamePlay, playerGamePlay, userProfile] = await Promise.all([
      tableGamePlayCache.getTableGamePlay(tableId),
      playerGamePlayCache.getPlayerGamePlay(userId, tableId),
      userProfileCache.getUserProfile(userId)
    ]);

    if (!tableGamePlay) throw new Error('Unable to get table game play');
    if (!playerGamePlay) throw new Error('Unable to get player game play');
    if (!userProfile) throw new Error('Unable to get user profile');

    Logger.info(tableId," tableGamePlay.tableStatus ::", tableGamePlay.tableStatus);
    Logger.info(tableId," playerGamePlay :: ", playerGamePlay);
    Logger.info(tableId," userProfile :: ", userProfile);

    let flag = false;
    if (tableGamePlay.tableStatus === TABLE_STATE.WAITING_FOR_PLAYERS ||
      tableGamePlay.tableStatus === TABLE_STATE.ROUND_TIMER_STARTED ||
      tableGamePlay.tableStatus === TABLE_STATE.WAIT_FOR_OTHER_PLAYERS
    ) {
      const key = `${userProfile.lobbyId}`;
      tableGamePlay.currentPlayerInTable -= NUMERICAL.ONE;

      Logger.info(tableId,"------>> leaveTable :: before :: seats ::", tableGamePlay.seats)
      const seats: seatsInterface[] = tableGamePlay.seats.filter(
        (seat: seatsInterface) => seat.userId !== playerGamePlay.userId
      );
      tableGamePlay.seats = seats;

      Logger.info(tableId,"------>> leaveTable :: after :: seats ::", tableGamePlay.seats)
      Logger.info(tableId," tableGamePlay.currentPlayerInTable ==::", tableGamePlay.currentPlayerInTable);
      Logger.info(tableId," tableGamePlay.tableStatus :: ", tableGamePlay.tableStatus);
      await emitLeaveTableEvent(tableId, playerGamePlay, userProfile, PLAYER_STATE.LEAVE, tableGamePlay.currentPlayerInTable, tableGamePlay.tableStatus, isLeaveEventSend, socketId);

      if (tableGamePlay.currentPlayerInTable === NUMERICAL.ZERO) {
        await removeQueue(tableId);
        await Promise.all([
          await tableGamePlayCache.deleteTableGamePlay(tableId),
          await tableConfigCache.deleteTableConfig(tableId),
          await playerGamePlayCache.deletePlayerGamePlay(userId, tableId),
        ])
      }
      else { //more then two player

        if (tableGamePlay.currentPlayerInTable === NUMERICAL.ONE) {

          Scheduler.cancelJob.cancelWaitingForPlayerTimer(`waitingForPlayerTimer:${tableId}`,tableId);
          Scheduler.cancelJob.cancelRoundTimerStart(`${tableConfig.gameType}:roundTimerStart:${tableId}`, tableId);

          Logger.info(tableId,"------------>> POPUP :: 2 <<---------------------")
          tableGamePlay.tableStatus = TABLE_STATE.WAITING_FOR_PLAYERS;
          await setQueue(tableId)
          let nonProdMsg = "Waiting for players";
          CommonEventEmitter.emit(EVENTS.SHOW_POPUP_ROOM_SOCKET_EVENT, {
            tableId,
            data: {
              isPopup: true,
              popupType: MESSAGES.ALERT_MESSAGE.TYPE.TOAST_POPUP,
              title: nonProdMsg,
              message: MESSAGES.ERROR.WAITING_FOR_ANTHOR_PLAYERS,
              showTimer: true,
              tableId,
            }
          });
        }
        if (
          (tableGamePlay.currentPlayerInTable === NUMERICAL.ONE && tableConfig.noOfPlayer === NUMERICAL.TWO) ||
          (tableGamePlay.currentPlayerInTable === NUMERICAL.THREE && tableConfig.noOfPlayer === NUMERICAL.FOUR) ||
          (tableGamePlay.currentPlayerInTable === NUMERICAL.FIVE && tableConfig.noOfPlayer === NUMERICAL.SIX)
        ) {
          await setQueue(tableId)
        }

        await Promise.all([
          await playerGamePlayCache.deletePlayerGamePlay(userId, tableId),
          await tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId)
        ])

      }
    }
    else if (tableGamePlay.tableStatus === TABLE_STATE.LOCK_IN_PERIOD) {

      CommonEventEmitter.emit(EVENTS.LOCK_IN_PERIOD_SOCKET_EVENT, {
        socket : socketId,
        data: {
          tableId,
          currentRound: NUMERICAL.ONE,
          msg : MESSAGES.ERROR.LOCK_IN_PEROID_MSG
        }
      });
      Logger.info(tableId," leaveTable :: LOCK_IN_PERIOD_SOCKET_EVENT ==>> LOCK_IN_TIMER : ");
      return flag;
    }
    else if (tableGamePlay.tableStatus !== TABLE_STATE.WINNER_DECLARED && tableGamePlay.tableStatus !== TABLE_STATE.SCORE_BOARD) {
      Logger.info(tableId," playerGamePlay.userStatus ::: ", playerGamePlay.userStatus);
      Logger.info(" tableGamePlay.currentPlayerInTable :::", tableGamePlay.currentPlayerInTable);

      if (tableGamePlay.currentPlayerInTable < NUMERICAL.TWO) {
        const { winnerUserId, winnerSI, allUserPGP, userArray } = await winnerAndScoreBoardManage(userId, tableId, tableGamePlay, tableConfig, PLAYER_STATE.LEAVE, tableGamePlay.currentPlayerInTable);
        Logger.info(tableId," tableGamePlay.currentPlayerInTable : UPDATED ", tableGamePlay.currentPlayerInTable);
        tableGamePlay.tableStatus = TABLE_STATE.WINNER_DECLARED;
        await Promise.all([
          tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId),
          // playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId)
          // await playerGamePlayCache.deletePlayerGamePlay(userId, tableId)
        ]);

        for await (const player of tableGamePlay.seats) {
          await Scheduler.cancelJob.cancelPlayerTurnTimer(`${tableId}:${player.userId}:${tableConfig.currentRound}`,tableId);
          await Scheduler.cancelJob.cancelSeconderyTimer(`${tableId}:${player.userId}:${tableConfig.currentRound}`,tableId);
          await Scheduler.cancelJob.cancelDeclarePlayerTurnTimer(`declare:${tableId}:${player.userId}:${tableConfig.currentRound}`,tableId);
        }

        //user leave
        await emitLeaveTableEvent(
          tableId,
          playerGamePlay,
          userProfile,
          PLAYER_STATE.LEAVE,
          tableGamePlay.currentPlayerInTable,
          tableGamePlay.tableStatus,
          isLeaveEventSend,
          socketId
        );

        await winnerhandler(winnerUserId, winnerSI, tableId, userId, userArray, allUserPGP, tableGamePlay, true);
      } else {
        // more then two players
        Logger.info(tableId," <<== more then TWO players ==>> ");
        Logger.info(tableId,"leaveTable :: before :: tableGamePlay.seats :: >> ", tableGamePlay.seats)
        Logger.info(tableId," tableGamePlay.currentPlayerInTable :: UPDATED", tableGamePlay.currentPlayerInTable);

        if (playerGamePlay.userStatus === PLAYER_STATE.WATCHING_LEAVE) {

          tableGamePlay.seats.filter((seat, index) => {
            if (seat.userId === userId) {
              tableGamePlay.seats.splice(index, NUMERICAL.ONE);
            }
          });
          await deletePlayerGamePlay(userId, tableId)
          await setQueue(tableId);
          await emitLeaveTableEvent(
            tableId,
            playerGamePlay,
            userProfile,
            PLAYER_STATE.WATCHING_LEAVE,
            tableGamePlay.currentPlayerInTable,
            tableGamePlay.tableStatus,
            isLeaveEventSend,
            socketId
          );
        } else {
          await emitLeaveTableEvent(
            tableId,
            playerGamePlay,
            userProfile,
            PLAYER_STATE.LEAVE,
            tableGamePlay.currentPlayerInTable,
            tableGamePlay.tableStatus,
            isLeaveEventSend,
            socketId
          );

        }

        Logger.info(tableId,"leaveTable :: after ::  tableGamePlay.seats :: >> ", tableGamePlay.seats);
        await Promise.all([
          tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId),
          Scheduler.cancelJob.cancelDeclarePlayerTurnTimer(`declare:${tableId}:${playerGamePlay.userId}:${tableConfig.currentRound}`,tableId)
          // playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId)
        ])

        if (tableGamePlay.tableStatus == TABLE_STATE.ROUND_STARTED && userId == tableGamePlay.currentTurnUserId) {
          Scheduler.cancelJob.cancelPlayerTurnTimer(`${tableId}:${playerGamePlay?.userId}:${tableConfig.currentRound}`,tableId);
          Scheduler.cancelJob.cancelSeconderyTimer(`${tableId}:${playerGamePlay?.userId}:${tableConfig.currentRound}`,tableId);
          Scheduler.addJob.nextTurnDelay({
            timer: NUMERICAL.ONE * NUMERICAL.ZERO,
            jobId: `nextTurn:${tableId}:${NUMERICAL.ONE}`,
            tableId,
          });
        }

      }

    }
    // if winner or scoreboard declared
    else if (tableGamePlay.tableStatus === TABLE_STATE.SCORE_BOARD || tableGamePlay.tableStatus === TABLE_STATE.WINNER_DECLARED) {
      Logger.info(tableId,` leaveTable :: tableStatus :: ${tableGamePlay.tableStatus}`)
      const key = `${userProfile.lobbyId}`;

      // seat user state change
      const updateSeats: seatsInterface[] = []
      let userCount = 0;
      tableGamePlay.seats.filter((seat) => {
        if (seat.userId === userId) {
          seat.userState = PLAYER_STATE.QUIT
          updateSeats.push(seat)
        } else {
          updateSeats.push(seat)
        }
      })

      for await (const player of updateSeats) {
        if (player.userState !== PLAYER_STATE.QUIT && player.userState !== PLAYER_STATE.DISCONNECTED) {
          Logger.info(tableId,
            `leaveTable :: currentPlayerInTable :: userID : ${player.userState} :: status ${player.userState}`
          )
          userCount += 1;
        }
      }

      for await (const player of tableGamePlay.seats) {
        Scheduler.cancelJob.cancelPlayerTurnTimer(`${tableId}:${player.userId}:${tableConfig.currentRound}`,tableId);
        Scheduler.cancelJob.cancelSeconderyTimer(`${tableId}:${player.userId}:${tableConfig.currentRound}`,tableId);
      }

      playerGamePlay.userStatus = PLAYER_STATE.QUIT;
      tableGamePlay.currentPlayerInTable -= NUMERICAL.ONE;

      Logger.info(tableId,"- leaveTable :: userCount", userCount)
      if (tableGamePlay.tableStatus === TABLE_STATE.WINNER_DECLARED) {

        if (userCount === NUMERICAL.ZERO) {
          Logger.info(tableId,` leaveTable :: currentPlayerInTable :: ${tableGamePlay.currentPlayerInTable}`)
          await Scheduler.cancelJob.cancelShowScoreBoardTimer(`scoreBoard:${tableId}:${NUMERICAL.ONE}`, tableId);
          await Scheduler.cancelJob.cancelScoreBoardTimer(`StartScoreBoardTimer:${tableId}`, tableId);

          await removeQueue(tableId)
          for await (const player of updateSeats) {
            await playerGamePlayCache.deletePlayerGamePlay(player.userId, tableId)
          }
          await tableGamePlayCache.deleteTableGamePlay(tableId);
          await tableConfigCache.deleteTableConfig(tableId);



        } else {

          tableGamePlay.seats = updateSeats;
          await Promise.all([
            await tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId),
            // await playerGamePlayCache.deletePlayerGamePlay(userId, tableId),
          ]);
        }

      } else if (tableGamePlay.tableStatus === TABLE_STATE.SCORE_BOARD) {

        if (userCount === NUMERICAL.ZERO) {
          Logger.info(tableId,`----->> leaveTable :: currentPlayerInTable :: ${tableGamePlay.currentPlayerInTable}`)
          await Scheduler.cancelJob.cancelScoreBoardTimer(`StartScoreBoardTimer:${tableId}`, tableId);
          await Scheduler.cancelJob.cancelShowScoreBoardTimer(`scoreBoard:${tableId}:${NUMERICAL.ONE}`, tableId);

          for await (const player of updateSeats) {
            await playerGamePlayCache.deletePlayerGamePlay(player.userId, tableId)
          }
          await removeQueue(tableId);
          await tableGamePlayCache.deleteTableGamePlay(tableId);
          await tableConfigCache.deleteTableConfig(tableId);
        } else {

          tableGamePlay.seats = updateSeats;
          await Promise.all([
            await tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId),
            // await playerGamePlayCache.deletePlayerGamePlay(userId, tableId),
          ]);
        }

        await emitLeaveTableEvent(
          tableId,
          playerGamePlay,
          userProfile,
          PLAYER_STATE.LEAVE,
          tableGamePlay.currentPlayerInTable,
          tableGamePlay.tableStatus,
          isLeaveEventSend,
          socketId,
        );
        
      }
      await emitLeaveTableEvent(
        tableId,
        playerGamePlay,
        userProfile,
        PLAYER_STATE.LEAVE,
        tableGamePlay.currentPlayerInTable,
        tableGamePlay.tableStatus,
        isLeaveEventSend,
        socketId
      );

    }
    else {
      Logger.info(tableId,"leaveTable :: else call.. :: tableGamePlay.currentPlayerInTable ::>", tableGamePlay.currentPlayerInTable);
      if (tableGamePlay.currentPlayerInTable === NUMERICAL.ZERO) {
        for await (const player of tableGamePlay.seats) {
          await Scheduler.cancelJob.cancelPlayerTurnTimer(`${tableId}:${player.userId}:${tableConfig.currentRound}`,tableId);
          await Scheduler.cancelJob.cancelSeconderyTimer(`${tableId}:${player.userId}:${tableConfig.currentRound}`,tableId);
        }
        await removeQueue(tableId)
        await Promise.all([
          await tableGamePlayCache.deleteTableGamePlay(tableId),
          await tableConfigCache.deleteTableConfig(tableId),
          // await playerGamePlayCache.deletePlayerGamePlay(userId, tableId),
        ])
      }
      await emitLeaveTableEvent(
        tableId,
        playerGamePlay,
        userProfile,
        PLAYER_STATE.LEAVE,
        tableGamePlay.currentPlayerInTable,
        tableGamePlay.tableStatus,
        isLeaveEventSend,
        socketId
      );

    }

    userProfile.tableId = EMPTY;
    // userProfile.lobbyId = EMPTY;
    userProfile.tableIds = userProfile.tableIds.filter((el) => tableId != el);
    userProfile.tableId = userProfile.tableIds.length === 0 ? EMPTY : userProfile.tableIds[NUMERICAL.ZERO];
    userProfile.oldTableId.push(tableId);
    Logger.info(tableId,"++++>> leaveTable :: >> userProfile.tableId", userProfile.tableId, "userProfile.tableIds :: >> ", userProfile.tableIds);
    Logger.info(tableId,"++++>> leaveTable :: userProfile.oldTableId ::=>>", userProfile.oldTableId);
    await userProfileCache.setUserProfile(userId, userProfile);

    if (socketId) { await leaveClientInRoom(socketId, tableId); }

    //markCompletedGameStatus leave table status
    // const completedGameStatus = await markCompletedGameStatus({
    //   tableId,
    //   gameId: userProfile.gameId,
    //   tournamentId: userProfile.lobbyId
    // },
    //   userProfile.authToken,
    //   socketId
    // )

    //lobby wise user decrement count
    await decrCounterLobbyWise(REDIS.ONLINE_PLAYER_LOBBY , userProfile.lobbyId);

    Logger.info(tableId,`Ending leaveTable for tableId : ${tableId} and userId : ${userId}`);
    return flag;
  }
  catch (error: any) {
    Logger.error(tableId,`INTERNAL_ERROR_leaveTable Error :: ${error}`)
    throw new Error(`INTERNAL_ERROR_leaveTable Error :: ${error}`);
  }

};

export = leaveTable;

async function emitLeaveTableEvent(
  tableId: string,
  playerGamePlay: defaulPlayerGamePlayInterface,
  userProfile: UserProfileOutput,
  message: string,
  updatedUserCount: number,
  tableStatus: string,
  isLeaveEventSend: boolean,
  socketId: string
) {
  try {
    Logger.info(tableId,"isLeaveEventSend  :: >> ", isLeaveEventSend);
    if (!isLeaveEventSend) {
      await leaveClientInRoom(socketId, tableId);
    }
    const formatRemoveUserResponse: leaveTableResponse =
      await formatLeaveTableData(
        tableId,
        playerGamePlay,
        message,
        updatedUserCount,
        tableStatus
      );

    Logger.info(tableId," formatRemoveUserResponse :: ", formatRemoveUserResponse);

    CommonEventEmitter.emit(EVENTS.LEAVE_TABLE_SOCKET_EVENT, {
      tableId: tableId,
      data: formatRemoveUserResponse,
      socketId: userProfile.socketId
    });

    return true;

  } catch (error) {
    Logger.error(tableId,`emitLeaveTableEvent Error :: ${error}`)
    Logger.info(tableId,"<<======= emitLeaveTableEvent() Error ======>>", error);
  }

}

import { tableConfigCache, tableGamePlayCache, userProfileCache } from "../../cache";
import { EVENTS, MESSAGES, NUMERICAL, REDIS } from "../../constants";
import { tableQueue } from "../../interfaces/tableConfig";
import Logger from "../../logger";
import roundStartTimer from "../round/roundStartTimer";
import { findTotalPlayersCount } from "../userPlayTable";
import { checkBalanceBeforeNewRoundStart, reSetPlayerGamePlay, reSetTableConfig, reSetTableGameTable, sendJoinTableEvent, setDataInSocket } from "./helper";
import Scheduler = require("../../scheduler");
import CommonEventEmitter from "../../commonEventEmitter"
import { deletePlayerGamePlay,getPlayerGamePlay } from "../../cache/playerGamePlay";
import { removeQueue, setQueue } from "../common/queue";
import { UserProfileOutput } from "../../interfaces/userProfile";
import { defaultTableGamePlayInterface } from "../../interfaces/tableGamePlay";
import { incrCounterLobbyWise } from "../../cache/onlinePlayer";


async function nextRound(data: any) {
    const tableId = data.tableId;
    try {
        Logger.info("------------------------------------------------------------------------------------>>>>>>>>>>>>>  nextRound :: data :: >> ", data);

        //check Balance before new round starts
        const tableGamePlayData = await tableGamePlayCache.getTableGamePlay(data.tableId) as defaultTableGamePlayInterface;
        for await (const ele of tableGamePlayData.seats) {
            await checkBalanceBeforeNewRoundStart(ele.userId, data.tableId);
        }

        // remove queue &&  set tableConfig
        await removeQueue(data.tableId);
        const tableConfig = await reSetTableConfig(data.tableId);
        // set tableGamePlay
        const tableGamePlay = await reSetTableGameTable(data.tableId, tableConfig._id)

        Logger.info(tableId, "nextRound :: seat :: >> ", tableGamePlay.seats)
        // set PGP
        const userIDS: string[] = [];
        for await (const seat of tableGamePlay.seats) {
            // Logger.info("-------->> nextRound :: seat ::", seat)
            // const pgp = await getPlayerGamePlay(seat.userId,tableConfig._id);
            userIDS.push(seat.userId)
            await reSetPlayerGamePlay(
                seat.userId,
                tableConfig._id,
                seat.si,
                seat.name,
                seat.pp,
                seat.isBot,
            )
            const deleteUser = await deletePlayerGamePlay(seat.userId, data.tableId);
        }

        Logger.info(tableId, " nextRound :: new table Id ::", tableConfig._id)
        Logger.info(tableId, " nextRound :: old table Id ::", data.tableId)

        const isSetSocketData = await setDataInSocket(
            data.tableId,
            tableConfig._id,
            userIDS
        )

        Logger.info(tableId, " nextRound :: isSetSocketData ::>>", isSetSocketData)
        // set JOIN TABLE EVENT

        if (isSetSocketData) {

            CommonEventEmitter.emit(EVENTS.NEW_GAME_START_SOCKET_EVENT, {
                tableId: tableConfig._id,
                data: {
                    oldTableId: data.tableId,
                    newTableId: tableConfig._id,
                    isNewGameStart: true,
                    tableId: data.tableId,
                    gameType: tableConfig.gameType
                }
            })

            // await sendJoinTableEvent(
            //     tableConfig._id,
            //     tableGamePlay,
            //     tableConfig,
            //     false
            // )

            // table player counts
            // const totalPlayersCount = await findTotalPlayersCount(tableGamePlay);
            let totalPlayersCount: number = tableGamePlay.seats.length;
            Logger.info(tableId, " nextRound :: totalPlayersCount :: >>", totalPlayersCount)
            Logger.info(tableId, "nextRound :: tableConfig.maximumSeat :: >>", tableConfig.noOfPlayer)
            if (totalPlayersCount != NUMERICAL.ZERO) {

                // add queue
                if (totalPlayersCount < tableConfig.noOfPlayer) {
                    // set Queue 
                    await setQueue(tableConfig._id);
                }


                // await Scheduler.addJob.startRoundTimer({
                //     timer: Number(NUMERICAL.FOUR),
                //     jobId: `StartRoundTimer:${tableConfig._id}`,
                //     tableId: tableConfig._id,
                //     tableGamePlay,
                //     tableConfig,
                // })
                // for lobby wise online users 
                for (let i = 0; i < tableGamePlay.seats.length; i++) {
                    const element = tableGamePlay.seats[i];
                    let countLobbyWise = await incrCounterLobbyWise(REDIS.ONLINE_PLAYER_LOBBY, tableConfig.lobbyId);
                    Logger.info('countLobbyWise :: count :: ', countLobbyWise);
                }

                // if players are one than one
                if (totalPlayersCount > NUMERICAL.ONE) {
                    await roundStartTimer(tableConfig._id, tableConfig.currentRound);
                } else {
                    Logger.info("Waiting for players  :: Pop-Up sending")

                    let nonProdMsg = "Waiting for players";
                    CommonEventEmitter.emit(EVENTS.SHOW_POPUP_ROOM_SOCKET_EVENT, {
                        tableId: tableConfig._id,
                        data: {
                            isPopup: true,
                            popupType: MESSAGES.ALERT_MESSAGE.TYPE.TOAST_POPUP,
                            title: nonProdMsg,
                            message: MESSAGES.ERROR.WAITING_FOR_ANTHOR_PLAYERS,
                            showTimer: true,
                            tableId : tableConfig._id
                        }
                    });
                }
            }
        }
    } catch (error) {
        Logger.error("--- nextRound :: ERROR :: ", error)
    }
}

export = nextRound;
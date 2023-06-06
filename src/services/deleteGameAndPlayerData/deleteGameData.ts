import { playerGamePlayCache, tableConfigCache, tableGamePlayCache, turnHistoryCache, userProfileCache } from "../../cache";
import { deleteKey } from "../../cache/redisCommon";
import { EMPTY, NUMERICAL, PLAYER_STATE } from "../../constants";
import { defaultTableGamePlayInterface } from "../../interfaces/tableGamePlay";
import Scheduler from "../../scheduler";
import Logger from "../../logger";
import { tableQueue } from "../../interfaces/tableConfig";



async function deleteGameData(
    tableGamePlay: defaultTableGamePlayInterface,
    tableId: string,
    userId?: string,
    newTableId?: string
) {

    try {
        Logger.info(tableId,'DELETE GAME DATA Call : tableGamePlay :>> ', tableGamePlay);
        for await (const seats of tableGamePlay.seats) {
            const player = seats;

            Scheduler.cancelJob.cancelDeclarePlayerTurnTimer(`declare:${tableId}:${player.userId}:${NUMERICAL.ONE}`,tableId);
            Scheduler.cancelJob.cancelPlayerTurnTimer(`${tableId}:${player.userId}:${NUMERICAL.ONE}`,tableId);
            Scheduler.cancelJob.cancelSeconderyTimer(`${tableId}:${player.userId}:${NUMERICAL.ONE}`,tableId);
            Scheduler.cancelJob.cancelRejoinTimer(`rejoinTimer:${tableId}:${player.userId}:${NUMERICAL.ONE}`,tableId);

            let userProfile = await userProfileCache.getUserProfile(player.userId);
            if (!userProfile) throw new Error('Unable to get user profile');

            Logger.info(tableId,"userProfile :;:>>", userProfile)
            userProfile.oldTableId = userProfile.oldTableId.filter(x => x !== tableId);
            Logger.info(tableId,'userProfile.oldTableId :>> ', userProfile.oldTableId);
            await userProfileCache.setUserProfile(player.userId, userProfile);
            // await playerGamePlayCache.deletePlayerGamePlay(player.userId, tableId);

            // const userPGP = await playerGamePlayCache.getPlayerGamePlay(player.userId, tableId);
            // if (!userPGP) throw new Error('Unable to get player game data');
            // userPGP.userStatus == PLAYER_STATE.PLAYING;
            // playerGamePlayCache.insertPlayerGamePlay(userPGP, tableId);

        }

        const tableConfig = await tableConfigCache.getTableConfig(tableId);
        if (!tableConfig) throw new Error('Unable to get table data');

        const key = `${tableConfig.lobbyId}`;
        let getTableQueueArr: tableQueue = await tableConfigCache.getTableFromQueue(key);
        if (getTableQueueArr) {
            Logger.info(tableId,'getTableQueueArr Before :>> ', getTableQueueArr);
            getTableQueueArr.tableId = getTableQueueArr.tableId.filter(x => x != tableId);
        }
        Logger.info(tableId,'getTableQueueArr After:>> ', getTableQueueArr);
        await tableConfigCache.setTableFromQueue(key, getTableQueueArr);
        // await tableConfigCache.popTableFromQueue(key);

        await Promise.all([
            //     await tableGamePlayCache.deleteTableGamePlay(tableId),
            //     await tableConfigCache.deleteTableConfig(tableId),
            await turnHistoryCache.deleteTurnHistory(tableId)
        ])

    } catch (error) {
        Logger.error(tableId,`deleteGameData Error :: ${error}`)
        Logger.info(tableId,"<<======= deleteGameData() Error ======>>", error);
    }


}

export = deleteGameData;
import Logger from "../../../logger";
import { getPlayerGamePlay, insertPlayerGamePlay } from "../../../cache/playerGamePlay"
import { defaulPlayerGamePlayInterface } from "../../../interfaces/playerGamePlay";
import { EMPTY, NUMERICAL, PLAYER_STATE } from "../../../constants";
const { ObjectID } = require("mongodb")

function reSetPlayerGamePlayData(
    userId: string,
    seatIndex: number,
    username: string,
    profilePic: string,
    userStatus: string,
    isBot:boolean,
): defaulPlayerGamePlayInterface {
    const currentTimestamp = new Date();
    return {
        _id: ObjectID().toString(),
        "userName" : username,
        "profilePic" : profilePic,
        "seatIndex" : seatIndex,
        "isBot" : isBot,
        "userId" : userId,
        "timeOutCounter" : 0,
        "ScriptUser" : false,
        "points" : 0,
        "userStatus" : userStatus,
        isUnoClick: false,
        card: [],
        createdAt: currentTimestamp.toString(),
        updatedAt: currentTimestamp.toString(),
    };
}

async function reSetPlayerGamePlay(
    userId: string,
    tableId: string,
    seatIndex: number,
    username: string,
    profilePic: string,
    isBot:any 
) {
    try {
        const reSetPlayerGamePlay = await reSetPlayerGamePlayData(
            userId,
            seatIndex,
            username,
            profilePic,
            PLAYER_STATE.PLAYING,
            isBot
            )
            await insertPlayerGamePlay(reSetPlayerGamePlay, tableId)
            Logger.info(tableId,` reSetPlayerGamePlay :: reSetPlayerGamePlay :: >>`,reSetPlayerGamePlay)

    } catch (error) {
        Logger.info(tableId,error)
        Logger.error(tableId,"--- reSetPlayerGamePlay :: ERROR :: " + error)
    }
}

export = reSetPlayerGamePlay;
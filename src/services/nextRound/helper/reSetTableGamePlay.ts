import { deletePlayerGamePlay, getPlayerGamePlay } from "../../../cache/playerGamePlay";
import { deleteTableConfig } from "../../../cache/tableConfig";
import { getTableGamePlay, insertTableGamePlay, deleteTableGamePlay } from "../../../cache/tableGamePlay";
import { getUserProfile, setUserProfile } from "../../../cache/userProfile";
import { EMPTY, NUMERICAL, PLAYER_STATE, TABLE_STATE } from "../../../constants";
import { defaulPlayerGamePlayInterface } from "../../../interfaces/playerGamePlay";
import { seatsInterface } from "../../../interfaces/signup";
import { defaultTableGamePlayInterface } from "../../../interfaces/tableGamePlay";
import { UserProfileOutput } from "../../../interfaces/userProfile";
import Logger from "../../../logger";
import Scheduler = require("../../../scheduler");
import deleteGameData = require("../../deleteGameAndPlayerData/deleteGameData");

function reSetTableGamePlayData(
    id: string,
    data: defaultTableGamePlayInterface,
    remainUsers: seatsInterface[]
): defaultTableGamePlayInterface {
    const currentTimestamp = new Date();
    const resObj = {
        _id: data._id,      /*String(GetRandomInt(1000000000, 9999999999)),*/
        seats: remainUsers,
        movedCard:[], //Moved Card 
        extraCard:[], // extra Card 
        turnCard:[], // turn Card   
        cardColor:"", // Use for check card color 
        cardNumber:"", // Card Number 
        cardTurnCircle:'0-1', // card_turn_circle 
        cardDrawCounter:0, // card_draw_counter 
        currentPlayerInTable: remainUsers.length,
        tableStatus: (remainUsers.length > NUMERICAL.ONE) ? TABLE_STATE.ROUND_TIMER_STARTED : TABLE_STATE.WAITING_FOR_PLAYERS,
        DCSend:false, // Check for DD(Dice Distribute event sended or not)
        currentTurnUserId:"",
        currentTurnSeatIndex: NUMERICAL.MINUS_ONE,
        paneltyID:"", 
        oldPaneltyID:"", 
        paneltyTurn:-1, 
        createdAt: currentTimestamp.toString(),
        updatedAt: currentTimestamp.toString(),
    };
    return resObj
}

async function reSetTableGameTable(tableId: string, newTableId: string) {
    try {
        Logger.info(tableId,"reSetTableGameTable  :: tableId ::>", tableId, "newTableId ::>", newTableId);
        const tableGamePlay = await getTableGamePlay(tableId) as defaultTableGamePlayInterface;
        Logger.info(tableId," reSetTableGameTable :: tableGamePlay ::>>", tableGamePlay);
        const seats = tableGamePlay.seats
        Logger.info(tableId,"reSetTableGameTable :: seats :: >>", seats);
        const remainUsers: seatsInterface[] = [];

        for await (const seat of seats) {
            // const userProfile = await getUserProfile(seat.userId) as UserProfileOutput;
            const playerGamePlay = await getPlayerGamePlay(seat.userId, tableId) as defaulPlayerGamePlayInterface;
            const userProfile = await getUserProfile(seat.userId) as UserProfileOutput ;
            Logger.info(tableId,"reSetTableGameTable :: playerGamePlay :: >>", playerGamePlay);
            Logger.info(tableId,"reSetTableGameTable :: userProfile :: >> ", userProfile);

            let inde = userProfile.tableIds.findIndex((tblId : any) => tblId === tableId);

            if ((playerGamePlay && playerGamePlay.userStatus === PLAYER_STATE.DISCONNECTED )||
                seat.userState === PLAYER_STATE.DISCONNECTED ||
                seat.userState === PLAYER_STATE.QUIT ||
                (userProfile.tableId !== EMPTY && inde !== -1)
            ) {
                await Scheduler.cancelJob.cancelRejoinTimer(`rejoinTimer:${tableId}:${seat.userId}:${NUMERICAL.ONE}`,tableId);
                await deletePlayerGamePlay(seat.userId, tableId);
            } else if (
                seat.userState !== PLAYER_STATE.DISCONNECTED &&
                seat.userState !== PLAYER_STATE.QUIT 
            ) {

                const obj = {
                    userId: seat.userId,
                    si: seat.si,
                    name: seat.name,
                    pp: seat.pp,
                    userState: PLAYER_STATE.PLAYING,
                }
                remainUsers.push(obj);

                userProfile.tableId = newTableId;
                userProfile.tableIds.push(newTableId);
            }
            userProfile.tableIds = userProfile.tableIds.filter((el) => tableId != el);
            Logger.info(tableId,"reSetTableGameTable :: >> userProfile.tableId", userProfile.tableId, "userProfile.tableIds :: >> ",  userProfile.tableIds);
            await setUserProfile(seat.userId, userProfile);
        }
        Logger.info(tableId," reSetTableGameTable :: remainUsers ::>>", remainUsers)

        const setTableGamePlayData = await reSetTableGamePlayData(newTableId, tableGamePlay, remainUsers);
        Logger.info(tableId," reSetTableGameTable :: setTableGamePlayData ::>>", setTableGamePlayData);

        if(setTableGamePlayData.seats.length === NUMERICAL.ZERO){
            await Promise.all([
                deleteTableConfig(newTableId),
                deleteTableGamePlay(newTableId),
            ])
        }
        else{
            await insertTableGamePlay(setTableGamePlayData, newTableId);
        }
      
       await deleteGameData(tableGamePlay, tableId);
       await Promise.all([
            deleteTableConfig(tableId),
            deleteTableGamePlay(tableId),
        ])

     return setTableGamePlayData;

    } catch (error) {
        Logger.error(tableId,"--- reSetTableGameTable :: ERROR ::", error);
        throw error;
    }
}

export = reSetTableGameTable;
import axios from "axios";
import Errors from "../errors";
import CommonEventEmitter from "../commonEventEmitter";
import { getLobbyListIf } from '../interfaces/cmgApiIf'
import { getConfig } from "../config";
import { EVENTS, MESSAGES, NUMERICAL } from "../constants";
const { LOBBY_LIST_DETAIL, APP_KEY, APP_DATA, GAME_DETAILS } = getConfig();
import Logger from "../logger";

async function getLobbyList(data: getLobbyListIf, token: string, socketId: string, userId: string) {
    Logger.info(userId,"getLobbyList ", data, token);
    try {

        const url = LOBBY_LIST_DETAIL; 
        Logger.info(userId,"getLobbyList url :: ", url);
        Logger.info(userId,"APP_KEY : ", APP_KEY, "APP_DATA : ", APP_DATA);

        // let gameDetails = await axios.post(GAME_DETAILS, data, { headers: { 'Authorization': `${token}`, 'x-mgpapp-key': APP_KEY, 'x-mgpapp-data': APP_DATA } })
        // // Logger.info("resData : getGameDetails gameDetails :: ", gameDetails.data);

        // let getGameDetails = gameDetails.data.data;
        // Logger.info(userId,"resData : getGameDetails :: ", getGameDetails);

        // if (!gameDetails || !gameDetails.data.success || !getGameDetails) {
        //     throw new Errors.InvalidInput('Unable to fetch game data');
        // }
        // if (gameDetails.data.message === MESSAGES.ERROR.SERVER_UNDER_THE_MAINTENANCE) {
        //     Logger.info(userId,`Server under the maintenance.`)
        //     throw new Errors.UnknownError('Unable to fetch game data');
        // }


        let lobbyList = await axios.post(LOBBY_LIST_DETAIL, data, { headers: { 'Authorization': `${token}`, 'x-mgpapp-key': APP_KEY, 'x-mgpapp-data': APP_DATA } })
        // Logger.info("resData : getLobbyListDetail LobbyList :: ", LobbyList.data);

        let getLobbyListDetail = lobbyList.data.data;
        Logger.info(userId,"resData : getLobbyListDetail :: ", getLobbyListDetail);

        if (!lobbyList || !lobbyList.data.success || !getLobbyListDetail) {
            throw new Errors.InvalidInput('Unable to fetch getLobbyList data');
        }
        if (lobbyList.data.message === MESSAGES.ERROR.SERVER_UNDER_THE_MAINTENANCE) {
            Logger.info(userId,`Server under the maintenance.`)
            throw new Errors.UnknownError('Unable to fetch getLobbyList data');
        }
        
        return getLobbyListDetail;

    } catch (error: any) {
        Logger.error(userId,'CATCH_ERROR :  getLobbyList :>> ', data, token, "-", error);
        Logger.error(userId,"error.response.data ", error.response.data);

        if (error instanceof Errors.UnknownError) {
            let nonProdMsg = "Server under the maintenance!";
            CommonEventEmitter.emit(EVENTS.SHOW_POPUP_CLIENT_SOCKET_EVENT, {
                socket: socketId,
                data: {
                    isPopup: true,
                    popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
                    title: nonProdMsg,
                    message: MESSAGES.ERROR.SERVER_UNDER_THE_MAINTENANCE,
                    buttonCounts: NUMERICAL.ONE,
                    button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
                    button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
                    button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
                    tableId: data.tableId,
                },
            });
        }
        else if (error.response && error.response.data && !error.response.data.success) {
            let nonProdMsg = "Fetch data failed!";
            CommonEventEmitter.emit(EVENTS.SHOW_POPUP_CLIENT_SOCKET_EVENT, {
                socket: socketId,
                data: {
                    isPopup: true,
                    popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
                    title: nonProdMsg,
                    message: error.response.data.message ? error.response.data.message : MESSAGES.ERROR.COMMON_ERROR,
                    buttonCounts: NUMERICAL.ONE,
                    button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
                    button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
                    button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
                    tableId: data.tableId,
                },
            });
        }
        else {
            let nonProdMsg = "Fetch data failed!";
            CommonEventEmitter.emit(EVENTS.SHOW_POPUP_CLIENT_SOCKET_EVENT, {
                socket: socketId,
                data: {
                    isPopup: true,
                    popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
                    title: nonProdMsg,
                    message: MESSAGES.ERROR.COMMON_ERROR,
                    buttonCounts: NUMERICAL.ONE,
                    button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
                    button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
                    button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
                    tableId: data.tableId,
                },
            });
        }
        return true;
    }
}

const exportedObj = {
    getLobbyList,
};

export = exportedObj;
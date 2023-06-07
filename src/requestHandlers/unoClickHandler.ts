import Logger from "../logger";
import { leaveTableFormator } from "../InputDataFormator";
import { leaveTableInput } from "../interfaces/inputOutputDataFormator";
import { leaveTable } from '../services/exitTable';
import { errorRes } from '../interfaces/signup';
import { playerGamePlayCache, tableConfigCache, tableGamePlayCache } from "../cache";
import { EVENTS, MESSAGES, NUMERICAL, PLAYER_STATE, TABLE_STATE } from "../constants";
import CommonEventEmitter from '../commonEventEmitter';
import Errors from "../errors";
import Lock from "../lock";

async function unoClickHandler(socket: any, data: any): Promise<boolean | errorRes | undefined | string> {
  const socketId = socket.id;
  const userId = /*String(leaveTableData.userId) ||*/ socket.userId;
  const tableId= /*string = String(leaveTableData.tableId) ||*/ socket.tableId;
  Logger.info(tableId," reqData :leaveTableHandler socket ==>>", userId , tableId);
  let lock = await Lock.getLock().acquire([tableId], 2000); 
  try {
    Logger.info(tableId,"leaveTableHandler : starting ...")
    // const formatedLeaveTableHandlerData = await leaveTableFormator(leaveTableData);
    // Logger.info(tableId," reqData : formatedLeaveTableHandlerData ==>>", formatedLeaveTableHandlerData);

    const [tableConfig, tableGamePlay, playerGamePlay] = await Promise.all([
      tableConfigCache.getTableConfig(tableId),
      tableGamePlayCache.getTableGamePlay(tableId),
      playerGamePlayCache.getPlayerGamePlay(userId, tableId),
    ]);

    if (!tableGamePlay) throw new Errors.UnknownError('Unable to get table game play');
    if (!playerGamePlay) throw new Errors.UnknownError('Unable to get player game play');
    if (!tableConfig) throw new Errors.UnknownError('Unable to get player game play');

    Logger.info(tableId,"leaveTableHandler :: playerGamePlay.userStatus ::>", playerGamePlay.userStatus);
    Logger.info(tableId,"leaveTableHandler :: tableGamePlay.tableStatus ::>", tableGamePlay.tableStatus);
    
    if(playerGamePlay.card.length !== 2){
      throw {message:"Invalid action!"};
    }

    playerGamePlay.isUnoClick = true;
    playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId);

    CommonEventEmitter.emit(EVENTS.UNO_CLICK, {
      socketId : socketId,
      tableId: tableId,
      data: { seatIndex : playerGamePlay.seatIndex }
    });

    return true;
  }
  catch (error: any) {
    Logger.error(tableId,`leaveTableHandler Error :: ${error}`)

    let msg = MESSAGES.ERROR.COMMON_ERROR;
    let nonProdMsg = "";
    let errorCode = 500;

    if (error instanceof Errors.InvalidInput) {
      nonProdMsg = "Invalid Input";
      CommonEventEmitter.emit(EVENTS.SHOW_POPUP_CLIENT_SOCKET_EVENT, {
        socket: socketId,
        data: {
          isPopup: true,
          popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
          title: nonProdMsg,
          message: msg,
          tableId,
          buttonCounts: NUMERICAL.ONE,
          button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
          button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
          button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
        },
      });
    } else if (error instanceof Errors.UnknownError) {
      nonProdMsg = "FAILED";

      CommonEventEmitter.emit(EVENTS.SHOW_POPUP_CLIENT_SOCKET_EVENT, {
        socket: socketId,
        data: {
          isPopup: true,
          popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
          title: nonProdMsg,
          message: msg,
          tableId,
          buttonCounts: NUMERICAL.ONE,
          button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
          button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
          button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
        },
      });
    } else {
      CommonEventEmitter.emit(EVENTS.UNO_CLICK, {
        socket: socketId,
        data: {
          success: false,
          error: {
            errorCode,
            errorMessage: error && error.message && typeof error.message === "string"
              ? error.message
              : nonProdMsg,
          },
        }
      });
    }

  } 
  finally {
    try {
      if (lock) await Lock.getLock().release(lock);
    } catch (error) {
      Logger.error(tableId,error, '<<= leaveTable >> ');
    }
  }
}

export = unoClickHandler;
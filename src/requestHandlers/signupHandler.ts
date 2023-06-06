import Logger from "../logger";
import { SignupInput } from "../interfaces/signup";
import { createOrFindUser } from "../services/userPlayTable";
import { findTableForUser } from "../services/userPlayTable";
import { playerGamePlayCache, tableConfigCache, tableGamePlayCache, userProfileCache } from "../cache/index";
import { formateUpdatedGameTableData, formatSignUpData } from "../formatResponseData";
import { NewGTIResponse, RejoinResponse } from '../interfaces/tableConfig';
import { emitSignUpEvent } from '../services/emitEvents'
import { reconnection } from "../services/signUp";
import { EMPTY, EVENTS, MESSAGES, NUMERICAL, TABLE_STATE, SIGN_UP_TYPES } from "../constants";
import Scheduler from "../scheduler";
import Lock from "../lock"
import { signupFormator } from "../InputDataFormator";
import CommonEventEmitter from '../commonEventEmitter';
import Errors from "../errors";
import { ackEvent } from "../utils";
import { UserProfileOutput } from "../interfaces/userProfile";
import formatingSignUpResData from "../services/signUp/helper/formatingSignUpResData";
import { getConfig } from "../connection/config";
import iamBackHandler from "../requestHandlers/iamBackHandler";
import { checkBalance, checkMaintanence, firstTimeIntrection, verifyUserProfile } from "../clientsideapi";
const { MAXIMUM_TABLE_CREATE_LIMIT } = getConfig();


async function signUpHandler(socket: any, signUpData: SignupInput, isRejoinOrNewGame: boolean, ack?: any): Promise<NewGTIResponse | boolean | undefined> {

  const lock = await Lock.getLock().acquire([signUpData.lobbyId], 2000);
  const socketId = socket.id;
  try {
    const userId = signUpData.userId;
    Logger.info(userId,"socket.authToken :: >>", socket.authToken); 
    socket.userId = userId;
    let signUpType = signUpData.signUpType ? signUpData.signUpType : SIGN_UP_TYPES.ADD_TABLE;
    delete signUpData.signUpType;
    // format check
    const formatedSignupData = await signupFormator(signUpData);
    Logger.info(userId," reqData : formatedSignupData :: ", formatedSignupData);

    // let isValidUserData = await verifyUserProfile(socket.authToken, signUpData.gameId, socketId, userId);
    // Logger.info(userId,"isValidUserData :: >> ", isValidUserData);

    // let checkMaintanenceData = await checkMaintanence(socket.authToken, socketId, userId);
    // Logger.info(userId,"checkMaintanenceData :::", checkMaintanenceData);
    // if (checkMaintanenceData && checkMaintanenceData.isMaintenance) {
    //   throw new Errors.maintanenceError('Server under the maintenance!');
    // }

    if (signUpData.isFTUE) {
      let FTUE = await firstTimeIntrection(signUpData.gameId, socket.authToken, socketId, userId);
      signUpData.isFTUE = false;
    }

    Logger.info(userId,'isRejoinOrNewGame ==:>> ', isRejoinOrNewGame, "signUpData.tableId ===>>");
    // if user kill app then, user other lobby signUp 
    // if (isRejoinOrNewGame) {
    //   const isUserJoinOtherLobby = await checkOldTableExist(socket, signUpData);
    //   if (isUserJoinOtherLobby) {
    //     return false;
    //   }
    // }

    const userSignUp = await createOrFindUser({
      socketId: socketId.toString(),
      userId: signUpData?.userId,
      lobbyId: signUpData.lobbyId,
      gameId: signUpData.gameId,
      username: signUpData.userName,
      profilePic: signUpData.profilePic,
      entryFee: Number(Number(signUpData.entryFee) / NUMERICAL.EIGHTY),
      noOfPlayer: signUpData.noOfPlayer,
      gameType: signUpData.rummyType,
      isUseBot: signUpData.isUseBot,
      isFTUE: signUpData.isFTUE,
      authToken: socket.authToken || signUpData.accessToken,
      isAnyRunningGame: false, //(isValidUserData && isValidUserData.isValidUser) ? isValidUserData.isAnyRunningGame : false,
      latitude : signUpData.latitude,
      longitude : signUpData.longitude,
    });

    if (!userSignUp) throw new Errors.UnknownError('USER_SIGNUP_FAILED');
    const userProfile = userSignUp.userProfile;
    Logger.info(userId,"userProfile :::", userProfile);
    // await emitSignUpEvent(userProfile, socketId);


    //user seat in maximum number of tables
    Logger.info(userId,"  MAXIMUM_TABLE_CREATE_LIMIT  ::>> ", MAXIMUM_TABLE_CREATE_LIMIT, "userProfile.tableIds.length :>>", userProfile.tableIds.length);
    if(userProfile.tableIds.length >= MAXIMUM_TABLE_CREATE_LIMIT){
      Logger.info(userId,"userTableIds ::: tableIds ::>>", userProfile.tableIds);
      let nonProdMsg = "FAILED!";
      CommonEventEmitter.emit(EVENTS.SHOW_POPUP_CLIENT_SOCKET_EVENT, {
        socket: socketId,
        data: {
          isPopup: true,
          popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
          title: nonProdMsg,
          message: MESSAGES.ERROR.MAXIMUM_TABLE_ERROR_MSG,
          tableId : userProfile.tableId,
          buttonCounts: NUMERICAL.ONE,
          button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
          button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
          button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
        },
      });
      return false;
    }

    // RECONNECTION CASE HANDLE
    let freshSignup = true;
    let tableId = '';
    if (userProfile.tableId != '' /*&& (signUpType === SIGN_UP_TYPES.RECONNECTION || signUpType === SIGN_UP_TYPES.REJOIN || signUpData.fromNewGame)*/) {
      tableId = userProfile.tableId;
    }
    Logger.info("tableId :: ", tableId);

    if (tableId && tableId !== '') {
      freshSignup = false;
      try {
        Logger.info(userId,"freshSignup ::", freshSignup);
        socket.tableId = tableId;
        const tableGamePlay = await tableGamePlayCache.getTableGamePlay(tableId);
        Logger.info(userId,"tableGamePlay :: ==>>>", tableGamePlay);
        // if (tableGamePlay && (tableGamePlay.tableState == TABLE_STATE.WINNER_DECLARED || tableGamePlay.tableState == TABLE_STATE.SCORE_BOARD)) {
        //   await leaveTableHandler(socket, { userId: userProfile.userId, tableId: userProfile.tableId, currentRound: NUMERICAL.ONE });
        //   Logger.info("tableGamePlay Get and tableState ::>> ", tableGamePlay.tableState);
        //   freshSignup = true;
        // }
        // else {
        Scheduler.cancelJob.cancelRejoinTimer(`rejoinTimer:${tableId}:${userId}:${NUMERICAL.ONE}`, tableId);
        const reconnectResponse = await reconnection(tableId, userId, userProfile, socket, ack);
        if (typeof reconnectResponse === "boolean") {
          freshSignup = true;
        } else {
          return reconnectResponse;
        }
        // }
      } catch (error) {
        Logger.info(userId,"error ==>>>>, freshSignup", freshSignup);
        freshSignup = true;
      }
    }else{

      //check user balance
      let checkBalanceDetail: any = {};
      checkBalanceDetail = {userBalance:{isInsufficiantBalance:false}};//await checkBalance({ tournamentId: userProfile.lobbyId }, userProfile.authToken, userProfile.socketId, userId);
      Logger.info(userId,"checkBalanceDetail  :: >> ", checkBalanceDetail);
      if (checkBalanceDetail && checkBalanceDetail.userBalance.isInsufficiantBalance) {
        console.log(userId,"isInsufficiantBalance :: >>", checkBalanceDetail.userBalance.isInsufficiantBalance);
        let nonProdMsg = "Insufficient Balance !";
        CommonEventEmitter.emit(EVENTS.SHOW_POPUP_CLIENT_SOCKET_EVENT, {
          socket,
          data: {
            isPopup: true,
            popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
            title: nonProdMsg,
            tableId : EMPTY,
            message: MESSAGES.ERROR.INSUFFICIENT_BALANCE,
            buttonCounts: NUMERICAL.ONE,
            button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
            button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
            button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
          },
        });
        return false;
      }
      else if (checkBalanceDetail && !checkBalanceDetail.userBalance.isInsufficiantBalance) {
        freshSignup = true;
      }
      else {
        throw new Error('Unable to check Balance data');
      }
    }

    if (freshSignup && /*signUpType === SIGN_UP_TYPES.ADD_TABLE ||*/ tableId === "") {

      const findTableInput = {
        ...userSignUp.signUpData,
        ...{
          entryFee: Number(Number(signUpData.entryFee) / NUMERICAL.EIGHTY),
          noOfPlayer: signUpData.noOfPlayer,
          minPlayer: signUpData.minPlayer,
          moneyMode : signUpData.moneyMode,
          latitude : userProfile.latitude,
          longitude : userProfile.longitude,
          authToken : userProfile.authToken,
          isUseBot : signUpData.isUseBot
        }
      };
      // Logger.info("findTableInput :::", findTableInput);

      const { tableConfig, tableGamePlay, playerGamePlay } =
        await findTableForUser(findTableInput, userProfile);

      userProfile.tableId = tableConfig._id;
      userProfile.tableIds.push(tableConfig._id);
      Logger.info(userId,"userProfile.tableIds ::>>", userProfile.tableIds);
      socket.tableId = userProfile.tableId;
      await userProfileCache.setUserProfile(userId, userProfile);

      const { gameTableInfoData, currentGameTableInfoData } = await formatingSignUpResData(userId);
      const formatedSignupResponse = await formatSignUpData(userProfile);

      // const formatedGTIResponse = await formateUpdatedGameTableData(
      //   tableConfig,
      //   tableGamePlay,
      //   playerGamePlay,
      // );

      // freshSignup acknowledged
      ackEvent.ackMid(
        EVENTS.SIGN_UP_SOCKET_EVENT,
        {
          signupResponse: formatedSignupResponse,
          gameTableInfoData: gameTableInfoData,
          reconnect: false
        },
        socket.userId,
        tableId,
        ack
      );

      for (let index = 0; index < userProfile.tableIds.length; index++) {
        if( userProfile.tableIds[index] !== tableConfig._id){
          //i am back handler 
          await iamBackHandler(socket, { userId, tableId:userProfile.tableIds[index] });
        }
      }

      return currentGameTableInfoData[NUMERICAL.ZERO];

    } else {
      throw new Errors.UnknownError('NOT_FRESH_SIGNUP');
    }

  }
  catch (error: any) {
    Logger.error("<<======= signUpHandler() Error ======>>", error);
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
          tableId :EMPTY,
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
          tableId : EMPTY,
          buttonCounts: NUMERICAL.ONE,
          button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
          button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
          button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
        },
      });
    } else {
      ackEvent.ackMid(
        EVENTS.SIGN_UP_SOCKET_EVENT,
        {
          success: false,
          error: {
            errorCode,
            errorMessage: error && error.message && typeof error.message === "string"
              ? error.message
              : nonProdMsg,
          }
        },
        socket.userId,
        "",
        ack
      );
      
    }

  }
  finally {
    try {
      if (lock) await Lock.getLock().release(lock);
      // Logger.info("lock release",lock);

    } catch (error) {
      Logger.error(error, ' signUpHandler ');
    }
  }

}

export = signUpHandler
const { ObjectID } = require("mongodb")
import {
  NUMERICAL,
  TABLE_STATE,
  PLAYER_STATE,
  EMPTY
} from '../constants';
import {
  UserProfileDataInput,
  UserProfileOutput
} from '../interfaces/userProfile';
import { CreateTableI } from "../interfaces/signup";
import { defaultTableConfig } from '../interfaces/tableConfig';
import {
  defaultTableGamePlayInterface
} from '../interfaces/tableGamePlay';
import { defaulPlayerGamePlayInterface } from '../interfaces/playerGamePlay';
import { GetRandomInt } from "../common";
const { ObjectId } = require("mongodb");
import { getConfig } from "../config";
const { GAME_START_TIMER, USER_TURN_TIMER, SECONDARY_TIMER, DECLARE_TIMER  } = getConfig();

function defaultUserProfile(userData: UserProfileDataInput): UserProfileOutput {
  const currentTimestamp = new Date().toString();
  return {
    id: userData.userId
      ? userData.userId.toString()
      : ObjectId().toString(),
    username: (!userData.username)
      ? `Guest${GetRandomInt(1, 99999999)}`
      : userData.username,
    userId: userData.userId
      ? userData.userId.toString()
      : ObjectId().toString(), // (userData.ID) ? userData.ID : userId,
    profilePic: userData.profilePic, // profile picture,
    // isRejoin: false, // rejoinId
    tableId: EMPTY,
    tableIds: [],
    socketId: userData.socketId,
    noOfPlayer : userData.noOfPlayer,
    isBot : userData.isBot || false,
    isFTUE : userData.isFTUE || false,
    gameId: userData.gameId,
    lobbyId: userData.lobbyId,
    entryFee : Number(userData.entryFee),
    createdAt: currentTimestamp,
    updatedAt: currentTimestamp,
    authToken : userData.authToken,
    isAnyRunningGame : userData.isAnyRunningGame,
    longitude : userData.longitude,
    latitude : userData.latitude,
    balance : userData.balance,
    oldTableId : [],
    gameType : userData.gameType
  };
}

function defaulTableData(signUpData: CreateTableI): defaultTableConfig {
  const currentTimestamp = new Date();
  return {
    _id: ObjectID().toString(),     /*String(GetRandomInt(1000000000, 9999999999)),*/
    gameType: signUpData.gameType,
    currentRound: NUMERICAL.ONE,
    lobbyId: signUpData.lobbyId,
    gameId : signUpData.gameId,
    minPlayer: NUMERICAL.TWO,
    noOfPlayer: signUpData.noOfPlayer,
    gameStartTimer: Number(GAME_START_TIMER),
    userTurnTimer: Number(USER_TURN_TIMER),
    entryFee: signUpData.entryFee,
    moneyMode : signUpData.moneyMode,
    scriptUser : false,
    totalTurnTime : NUMERICAL.TWO,
    rejoinTime :  NUMERICAL.TWO,
    isBot : true,
    robotType : "high", //high, low, medium
    createdAt: currentTimestamp.toString(),
    updatedAt: currentTimestamp.toString(),
  };
}

function defaultTableGamePlayData(
 gameType : string
): defaultTableGamePlayInterface {
  const currentTimestamp = new Date();
  return {
    _id: ObjectID().toString(),      /*String(GetRandomInt(1000000000, 9999999999)),*/
    seats:[],// player info 
    movedCard:[], //Moved Card 
    extraCard:[], // extra Card 
    turnCard:[], // turn Card   
    cardColor:"", // Use for check card color 
    cardNumber:"", // Card Number 
    cardTurnCircle:'0-1', // card_turn_circle 
    cardDrawCounter:0, // card_draw_counter 
    // currentTurn:0,  //current turn  
    currentPlayerInTable:NUMERICAL.ZERO, //playing user count 
    tableStatus: TABLE_STATE.WAITING_FOR_PLAYERS, 
    DCSend:false, // Check for DD(Dice Distribute event sended or not) 
    currentTurnUserId:"",
    currentTurnSeatIndex : -1,
    paneltyID:"", 
    oldPaneltyID:"", 
    paneltyTurn:-1, 
    createdAt: currentTimestamp.toString(),
    updatedAt: currentTimestamp.toString(),
  };
}

function defaulPlayerGamePlayData(
  userId: string,
  seatIndex: number,
  userName: string,
  profilePic: string,
  userStatus : string,
  isBot:boolean,
): defaulPlayerGamePlayInterface {
  const currentTimestamp = new Date();
  return {
    _id: ObjectID().toString(),
    "userName" : userName,
    "profilePic" : profilePic,
    "seatIndex" : seatIndex,
    "isBot" : isBot,
    "userId" : userId,
    "timeOutCounter" : 0,
    "ScriptUser" : false,
    "points" : 0,
    "userStatus" : userStatus,
    "isUnoClick" : false,
    card: [],
    createdAt: currentTimestamp.toString(),
    updatedAt: currentTimestamp.toString(),

  };
}

const exportedObject = {
  defaultUserProfile,
  defaulTableData,
  defaultTableGamePlayData,
  defaulPlayerGamePlayData
};

export = exportedObject;

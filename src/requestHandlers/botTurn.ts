import Logger from "../logger";
import { leaveTableFormator } from "../InputDataFormator";
import { leaveTableInput } from "../interfaces/inputOutputDataFormator";
import { leaveTable } from '../services/exitTable';
import { errorRes } from '../interfaces/signup';
import { playerGamePlayCache, tableConfigCache, tableGamePlayCache, userProfileCache } from "../cache";
import { EVENTS, MESSAGES, NUMERICAL,EMPTY, PLAYER_STATE, TABLE_STATE,EVENT_EMITTER } from "../constants";
import CommonEventEmitter from '../commonEventEmitter';
import Errors from "../errors";
import Lock from "../lock";
import {shuffleCards,GetRandomInt} from "../common";
import throwCardHandler from "./throwCardHandler";
import pickFromExtraCardHandler from "./pickFromExtraCardHandler";
const { ObjectID } = require("mongodb")
import { defaultUserProfile } from "../defaultGenerator";
import { joinTable } from "../services/playTable/joinTable";
import signUpHandler from "./signupHandler";
const _ = require("underscore");

async function botTurn(socket: any, data: any): Promise<boolean | errorRes | undefined | string> {
  const socketId = socket.id;
  const userId = /*String(leaveTableData.userId) ||*/ socket.userId;
  const tableId= /*string = String(leaveTableData.tableId) ||*/ socket.tableId;
  Logger.info(tableId," reqData :leaveTableHandler socket ==>>", userId , tableId);

  // let lock = await Lock.getLock().acquire([tableId], 2000); 
  try {
    Logger.info(tableId,"botTurn : starting ...")

    const [tableConfig, tableGamePlay, playerGamePlay] = await Promise.all([
      tableConfigCache.getTableConfig(tableId),
      tableGamePlayCache.getTableGamePlay(tableId),
      playerGamePlayCache.getPlayerGamePlay(userId, tableId),
    ]);

    if (!tableGamePlay) throw new Errors.UnknownError('Unable to get table game play');
    if (!playerGamePlay) throw new Errors.UnknownError('Unable to get player game play');
    if (!tableConfig) throw new Errors.UnknownError('Unable to get player game play');


    // if(data.type=='NORMAL'){
      let detailsOfActiveCard:any = await findActiveCard(playerGamePlay,tableGamePlay,tableConfig);
      console.log("RobotTurn---->2>",detailsOfActiveCard);
      if(detailsOfActiveCard.flag==true && detailsOfActiveCard.card){
        let cardColor = ["R","Y","G","B"];
        let cardColorIndex = await GetRandomInt(0,3);
        CommonEventEmitter.emit(EVENT_EMITTER.ROBOT_THROW_CARD_CALL,socket,{card:detailsOfActiveCard.card,cardColor:cardColor[cardColorIndex]});
        // await throwCardHandler(socket,{card:detailsOfActiveCard.card}); //turn user start
      }else{
        CommonEventEmitter.emit(EVENT_EMITTER.ROBOT_PICK_CARD_CALL,socket,{isPanelty:false});

        // await pickFromExtraCardHandler(socket);
      }
  // }
  // else if(type=='EC'){
  //     console.log("RobotTurn---->3>",table.extra_card.length);
  //     if(table.extra_card.length>0){
  //         playingTableClass.PFEC({si:table.tos,card : table.extra_card[0]/*_.sample(table.extra_card)*/,ir : true},client);    
  //     }else{
  //         playingTableClass.UserBlockProcess(table);
  //     }
  // }
    
    
    return true;
  }
  catch (error: any) {
    Logger.error(tableId,`botTurn Error :: ${error}`)

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
      CommonEventEmitter.emit(EVENTS.THROW_CARD, {
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
      // if (lock) await Lock.getLock().release(lock);
    } catch (error) {
      Logger.error(tableId,error, '<<= leaveTable >> ');
    }
  }
}

async function findActiveCard(pgp:any, tgp:any, tableConfig:any){
  let user_card = pgp.card;
  let last_moved_card = tgp.movedCard[tgp.movedCard.length-1];

  let skip_card= /*(user_card)?user_card*/(last_moved_card)?last_moved_card.slice(1, 4):"";
  let reverse_card= /*(user_card)?user_card*/(last_moved_card)?last_moved_card.slice(1, 5):"";
  let Draw_card= /*(user_card)?user_card*/(last_moved_card)?last_moved_card.slice(1, 6):"";

  last_moved_card= (last_moved_card)?last_moved_card.slice(0, 2):"";
  
  
  
  
  

  let a = user_card;
  let term = last_moved_card; // search term (regex pattern)
  if(last_moved_card=="WC" || last_moved_card=="D4"){
      term=last_moved_card+"-"
  }
  // Search for card color
  let search = new RegExp(term , 'i'); // prepare a regex object
  let card = a.filter((item:string) => search.test(item));
  

  // Search for wild card
  let term_wc = "WC-"; // search term (regex pattern)
  let search_wc = new RegExp(term_wc , 'i'); // prepare a regex object
  let card_wild = a.filter((item:string) => search_wc.test(item));
  

  // Search for draw 4 card
  let term_w4c = "D4C-"; // search term (regex pattern)
  let search_w4c = new RegExp(term_w4c , 'i'); // prepare a regex object
  let card_w4c = a.filter((item:string) => search_w4c.test(item));
  

  // Search base on card number
  let term_c_no = "-"+tgp.cardNumber+"-"; // search term (regex pattern)
  let search_c_no = new RegExp(term_c_no , 'i'); // prepare a regex object
  let card_no = a.filter((item:string) => search_c_no.test(item));
  

  // Search for reverse card 
  let term_c_reverse = (reverse_card=="-RE-")?reverse_card:"---"; // search term (regex pattern)
  let search_c_reverse = new RegExp(term_c_reverse , 'i'); // prepare a regex object
  let card_reverse = a.filter((item:string) => search_c_reverse.test(item));
  

  //Search for skip card 
  let term_c_skip = (skip_card=="-S-")?skip_card:"---"; // search term (regex pattern)
  let search_c_skip = new RegExp(term_c_skip , 'i'); // prepare a regex object
  let card_skip = a.filter((item:string) => search_c_skip.test(item));
  

  //Search for draw card 
  let term_c_draw = (Draw_card=="-D2C-")?Draw_card:"---"; // search term (regex pattern)
  let search_c_draw = new RegExp(term_c_draw , 'i'); // prepare a regex object
  let card_draw = a.filter((item:string) => search_c_draw.test(item));
  

  let flag = false; 
  
  if(card.length > 0){
      flag=true;
  }else if(card_wild.length > 0){
      flag=true;
  }else if(card_w4c.length > 0){
      flag=true;
  }else if(card_no.length > 0){
      flag=true;
  }else if(card_reverse.length > 0 && reverse_card!= "C-2"){
      flag=true;
  }else if(card_skip.length > 0 && skip_card!= "C-2"){
      flag=true;
  }else if(card_draw.length > 0 && Draw_card!= "C-2"){
      flag=true;
  }
  let active_card=card.concat(card_wild);
  active_card=active_card.concat(card_w4c);
  active_card=active_card.concat(card_no);
  active_card=active_card.concat(card_reverse);
  active_card=active_card.concat(card_skip);
  active_card=active_card.concat(card_draw);
  
  
  let uniqueArray=[];
  for(let i=0; i < active_card.length; i++){
      if(uniqueArray.indexOf(active_card[i]) === -1) {
          uniqueArray.push(active_card[i]);
      }
  }
  let return_data={flag:flag,si:tgp.currentTurnSeatIndex,card:"",C_C:"",forcefully_throw_card: false,UNO_button:false}
  let color_array=["R","G","Y","B"];
  let color_index= _.random(0,color_array.length-1)
  if(flag==true){
      let card_bot_w4c=[];
      let card_bot_w2c=[];
      let card_bot_skip=[];
      let card_bot_reverse=[];
      let set_midium_robot_move= _.random(0,5)
      tableConfig.robotType="high";
      let card_bot_wild = [];
      if(tableConfig.robotType=="low"){
          return_data.card=uniqueArray[0];
      }else if(tableConfig.robotType=="high"){
          // Search for draw 4 card
          let term_bot_w4c = "D4C-"; // search term (regex pattern)
          let search_bot_w4c = new RegExp(term_bot_w4c , 'i'); // prepare a regex object
          card_bot_w4c = uniqueArray.filter(item => search_bot_w4c.test(item));

          // Search for draw 2 card
          let term_bot_w2c = "-D2C-"; // search term (regex pattern)
          let search_bot_w2c = new RegExp(term_bot_w2c , 'i'); // prepare a regex object
          card_bot_w2c = uniqueArray.filter(item => search_bot_w2c.test(item));

          // Search for skip card
          let term_bot_skip = "-D2C-"; // search term (regex pattern)
          let search_bot_skip = new RegExp(term_bot_skip , 'i'); // prepare a regex object
          card_bot_skip = uniqueArray.filter(item => search_bot_skip.test(item));

          // Search for reverse card
          let term_bot_reverse = "-D2C-"; // search term (regex pattern)
          let search_bot_reverse = new RegExp(term_bot_reverse , 'i'); // prepare a regex object
          card_bot_reverse = uniqueArray.filter(item => search_bot_reverse.test(item));

          // Search for wild card
          let term_bot_wc = "WC-"; // search term (regex pattern)
          let search_bot_wc = new RegExp(term_bot_wc , 'i'); // prepare a regex object
          let card_bot_wild = uniqueArray.filter(item => search_bot_wc.test(item));
      }else if(tableConfig.robotType=="medium" && set_midium_robot_move==0){
          // Search for draw 4 card
          let term_bot_w4c = "D4C-"; // search term (regex pattern)
          let search_bot_w4c = new RegExp(term_bot_w4c , 'i'); // prepare a regex object
          card_bot_w4c = uniqueArray.filter(item => search_bot_w4c.test(item));

          // Search for draw 2 card
          let term_bot_w2c = "-D2C-"; // search term (regex pattern)
          let search_bot_w2c = new RegExp(term_bot_w2c , 'i'); // prepare a regex object
          card_bot_w2c = uniqueArray.filter(item => search_bot_w2c.test(item));

          // Search for skip card
          let term_bot_skip = "-D2C-"; // search term (regex pattern)
          let search_bot_skip = new RegExp(term_bot_skip , 'i'); // prepare a regex object
          card_bot_skip = uniqueArray.filter(item => search_bot_skip.test(item));

          // Search for reverse card
          let term_bot_reverse = "-D2C-"; // search term (regex pattern)
          let search_bot_reverse = new RegExp(term_bot_reverse , 'i'); // prepare a regex object
          card_bot_reverse = uniqueArray.filter(item => search_bot_reverse.test(item));

          // Search for wild card
          let term_bot_wc = "WC-"; // search term (regex pattern)
          let search_bot_wc = new RegExp(term_bot_wc , 'i'); // prepare a regex object
           card_bot_wild = uniqueArray.filter(item => search_bot_wc.test(item));
      }

      if(card_bot_w4c.length > 0){
          return_data.card=card_bot_w4c[0];
          return_data.C_C=color_array[color_index];
      }else if(card_bot_w2c.length > 0){
          return_data.card=card_bot_w2c[0];
      }else if(card_bot_skip.length > 0){
          return_data.card=card_bot_skip[0];
      }else if(card_bot_reverse.length > 0){
          return_data.card=card_bot_reverse[0];
      }else if(card_bot_wild.length > 0){
          return_data.card=card_bot_wild[0];
          return_data.C_C=color_array[color_index];
      }else{
          let chk__card=uniqueArray[0].slice(0, 3);
          if(chk__card=="D4C"){
              return_data.C_C=color_array[color_index];  
          }else if(chk__card=="WC-"){
              return_data.C_C=color_array[color_index];  
          }
          return_data.card=uniqueArray[0];
      }

      //Set UNO button clicking flag for robot
      if(user_card.length==2){
          return_data.UNO_button=true;
      }
  }
  return return_data; 
}

async function Robotcall(data:any) {

  let signupReq = {
    "signUpType": "ADD_TABLE",
    "accessToken": "bot",
    "userId": ObjectID().toString(),
    "userName": "VVCHBKSSX",
    "profilePic": "https://cdn.rummyxl.com/user_avatar/12%20(1).png",
    "entryFee": "1",
    "minPlayer": 2,
    "noOfPlayer": 2,
    "winningAmount": "9",
    "gameId": "64116d3fa3297545b8ab713d",
    "lobbyId": "644f3f611fa788614a3349a7",
    "isFTUE": false,
    "isBot": true,
    "moneyMode": "RealMoney",
    "rummyType": "Points",
    "fromNewGame": false,
    "latitude":"111",
    "longitude":"333",
    "totalRound":2,
  }
  Logger.info("Robotcall Before Join Table : signupReq :: ===>>", signupReq);
  let isRejoinOrNewGame = true;
  let response:any = await signUpHandler({id:"bot",userId:signupReq.userId,tableId:data.tableId}, signupReq, isRejoinOrNewGame, null);
  Logger.info("Robotcall Before Join Table : response :: ===>>", response);

  if (response && response && 'tableId' in response && !response['reconnect'])
      await joinTable(response, {id:"bot",userId:signupReq.userId,tableId:data.tableId}, false);
  if (response && response['reconnect']) await joinTable(response, {id:"bot",userId:signupReq.userId,tableId:data.tableId}, true);

}
export = {botTurn,Robotcall,findActiveCard};
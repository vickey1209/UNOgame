import Logger from "../logger";
import { leaveTableFormator } from "../InputDataFormator";
import { leaveTableInput } from "../interfaces/inputOutputDataFormator";
import { leaveTable } from '../services/exitTable';
import { errorRes } from '../interfaces/signup';
import { playerGamePlayCache, tableConfigCache, tableGamePlayCache } from "../cache";
import { EVENTS, MESSAGES, NUMERICAL, PLAYER_STATE, TABLE_STATE, EVENT_EMITTER } from "../constants";
import CommonEventEmitter from '../commonEventEmitter';
import Errors from "../errors";
import Lock from "../lock";
import {shuffleCards} from "../common";
import Scheduler from '../scheduler';
import { getPreviousPlayer,getNextPlayer } from "../services/turn/helper";
import { getPlayingUserInRound } from "../services/common/getPlayingUser";
import { nextTurnPlayerInterface, seatsInterface } from "../interfaces/signup";
import pickFromExtraCardHandler from "./pickFromExtraCardHandler";

async function throwCardHandler(socket: any, data: any): Promise<boolean | errorRes | undefined | string> {
  const socketId = socket.id;
  const userId = /*String(leaveTableData.userId) ||*/ socket.userId;
  const tableId= /*string = String(leaveTableData.tableId) ||*/ socket.tableId;
  Logger.info(tableId," reqData :throwCardHandler socket ==>>",data, userId , tableId);

  let lock = await Lock.getLock().acquire([tableId], 2000); 
  try {
    Logger.info(tableId,"throwCardHandler : starting ...")

    const [tableConfig, tableGamePlay, playerGamePlay] = await Promise.all([
      tableConfigCache.getTableConfig(tableId),
      tableGamePlayCache.getTableGamePlay(tableId),
      playerGamePlayCache.getPlayerGamePlay(userId, tableId),
    ]);

    if (!tableGamePlay) throw new Errors.UnknownError('Unable to get table game play');
    if (!playerGamePlay) throw new Errors.UnknownError('Unable to get player game play');
    if (!tableConfig) throw new Errors.UnknownError('Unable to get player game play');

    if(tableGamePlay.currentTurnUserId !== userId){
      throw {message : 'Invalid turn!'};
    }

    let cardIndex = playerGamePlay.card.findIndex((card :string) => card === data.card);
    if(cardIndex === -1){
      throw {message : 'Invalid card!'};
    }

    let newCardColor = data.card[0]; // Get Throwed card color
    let newCardNumber = data.card[data.card.length-3];
    

   

    if(data.card[1]!="-" && data.cardColor){ // If user throwed any action card like wild card,Draw4Card and Color was selected then set color.  
      newCardColor=data.cardColor;
    }else if(tableGamePlay.cardColor!== "" && tableGamePlay.cardColor !== newCardColor && tableGamePlay.cardNumber !== newCardNumber){
      throw {message : 'Invalid card!'};
    }
    
    tableGamePlay.cardColor=newCardColor;
    tableGamePlay.cardNumber=newCardNumber;

    playerGamePlay.card.splice(cardIndex, 1);
    playerGamePlay.timeOutCounter = 0;
    tableGamePlay.movedCard.push(data.card);

    await Promise.all([
      tableGamePlayCache.insertTableGamePlay(tableGamePlay,tableId),
      playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId),
    ]);

    CommonEventEmitter.emit(EVENTS.THROW_CARD, {
      socketId : socketId,
      tableId: tableId,
      data: { seatIndex : playerGamePlay.seatIndex ,card : data.card }
    });

    let checkPaneltyRes = await checkPanelty({lastThrowCard : data.card})





    


    Scheduler.cancelJob.cancelPlayerTurnTimer(`${tableId}:${playerGamePlay?.userId}:${tableConfig.currentRound}`,tableId);
    Scheduler.cancelJob.cancelSeconderyTimer(`${tableId}:${playerGamePlay?.userId}:${tableConfig.currentRound}`,tableId);
    if(checkPaneltyRes.flag){
      // if(checkPaneltyRes.status === ""){
      // setTimeout(() => {
        // givePanelty({status:checkPaneltyRes.status,tableId:tableId})
        CommonEventEmitter.emit(EVENT_EMITTER.GIVE_PANELTY_TO_PLAYER,{status:checkPaneltyRes.status,tableId:tableId});

      // }, 2000);
      // }
    }else{
      Scheduler.addJob.nextTurnDelay({
          timer: NUMERICAL.ONE * NUMERICAL.ZERO,
          jobId: `nextTurn:${tableId}:${NUMERICAL.ONE}`,
          tableId,
      });
    }

    // let isBlocked = await UserBlockCheck(playerGamePlay, tableGamePlay);
    
    // if(isBlocked){

    //   // if(uptable.OldPaneltyID && uptable.Panelty_Turn != -1){ // checked for any panelty was pending or not
    //   //   schedule.cancelJob(uptable.OldPaneltyID);
    //   //   let req_data={
    //   //       si:uptable.tos,
    //   //       next_si:uptable.Panelty_Turn,
    //   //       tbid:uptable._id.toString(),
    //   //       remove_id:true
    //   //   }
        
    //   //   give_panelty_1(req_data);
    //   // }else if(uptable.PaneltyID && uptable.Panelty_Turn != -1){ // checked for any panelty was pending or not
    //   //     schedule.cancelJob(uptable.PaneltyID);
    //   //     let req_data={
    //   //         si:uptable.tos,
    //   //         next_si:uptable.Panelty_Turn,
    //   //         tbid:uptable._id.toString(),
    //   //         remove_id:true
    //   //     }
          
    //   //     give_panelty_1(req_data);
    //   // }else{
          
    //   //     let nxt = playingTableClass.Next_Turn(table.tos,table); // Get next user turn seat index
    //   //     nxt=nxt.turn_si;
    //   //     // Update next turn index in table
    //   //     db.collection('playing_table').findAndModify({_id : table._id},{},{$set:{tos:nxt}}, {new : true}, function (err, uptable_1) {
    //   //         if(uptable_1!=null && typeof uptable_1.value != "undefined" && uptable_1.value != null) {
    //   //             let uptable_1 = uptable_1.value;
    //   //             playingTableClass.WinnerCheckAndNextTimer(uptable_1,client);
    //   //         }
    //   //     })    
    //   // }

    // }else{
    //   // Next turn bot then calling bot function
    //   if(playerGamePlay.isBot){
    //     // console.log("PFEC >> user robot");
    //     // setTimeout(function() {
    //     //     robotClass.RobotTurn(uptable,'NORMAL',false);
    //     // },cnfig.ROBOT_TIME_EXTRA_DICE*1000);   
    //   } 
    // }
    

    

    return true;
  }
  catch (error: any) {
    Logger.error(tableId,`throwCardHandler Error :: ${error}`)

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
      if (lock) await Lock.getLock().release(lock);
    } catch (error) {
      Logger.error(tableId,error, '<<= leaveTable >> ');
    }
  }
}

async function checkPanelty(data:any) {
  Logger.info(data.tableId," checkPanelty :: checkPanelty :: ", await data.lastThrowCard.includes("D4C-"),
  await data.lastThrowCard.includes("D2C-") , await data.lastThrowCard.includes("-S-") ,
  await data.lastThrowCard.includes("-RE-"));
  let response={flag:false,status:""};
  // Check for draw 4 card
  if(await data.lastThrowCard.includes("D4C-")){
    response.status = "D4C-";
    response.flag = true;
  }else if(await data.lastThrowCard.includes("D2C-")){
    response.status = "D2C-";
    response.flag = true;
  }else if(await data.lastThrowCard.includes("-S-")){
    response.status = "-S-";
    response.flag = true;
  }else if(await data.lastThrowCard.includes("-RE-")){
    response.status = "-RE-";
    response.flag = true;
  }
  
  Logger.info(data.tableId," checkPanelty :: checkPanelty :1: ", data);
  return response;
}

// async function givePanelty(data:any) {

//   Logger.info(data.tableId," givePanelty :: givePanelty :: ", data);
//   const [tableConfig, tableGamePlay] = await Promise.all([
//     tableConfigCache.getTableConfig(data.tableId),
//     tableGamePlayCache.getTableGamePlay(data.tableId),
//   ]);

//   if (!tableGamePlay) throw new Errors.UnknownError('Unable to get table game play');
//   if (!tableConfig) throw new Errors.UnknownError('Unable to get player game play');

//   const activePlayersData: seatsInterface[] = await getPlayingUserInRound(tableGamePlay);

//   // change turn user
//   let nextPlayer: seatsInterface = {} as seatsInterface;
//   if (tableGamePlay.cardTurnCircle === "0-1") {
//     nextPlayer = getNextPlayer(activePlayersData, tableGamePlay.currentTurnUserId, data.tableId);
//   } else {
//     Logger.info(data.tableId," changeTurn :: priviuosPlayer :: ", nextPlayer);
//     nextPlayer = await getPreviousPlayer(activePlayersData, tableGamePlay.currentTurnUserId,data.tableId);
//     Logger.info(data.tableId,"changeTurn :: nextPlayer :: ", nextPlayer);

//   }


//   if(data.status === "D4C-"){
//     for (let index = 0; index < 4; index++) {
//       pickFromExtraCardHandler({id:"auto",userId:nextPlayer.userId,tableId:data.tableId})
//     }
//   }else if(data.status === "D2C-"){
//     for (let index = 0; index < 2; index++) {
//       pickFromExtraCardHandler({id:"auto",userId:nextPlayer.userId,tableId:data.tableId})
//     }
//   }else if(data.status === "-S-"){
//     for (let index = 0; index < 2; index++) {
//       tableGamePlay.currentTurnSeatIndex = nextPlayer.si;
//       tableGamePlay.currentTurnUserId = nextPlayer.userId;
//       tableGamePlayCache.insertTableGamePlay(tableGamePlay,data.tableId),
//       Scheduler.cancelJob.cancelPlayerTurnTimer(`${data.tableId}:${nextPlayer.userId}:${tableConfig.currentRound}`,data.tableId);
//       Scheduler.cancelJob.cancelSeconderyTimer(`${data.tableId}:${nextPlayer.userId}:${tableConfig.currentRound}`,data.tableId);
//       Scheduler.addJob.nextTurnDelay({
//           timer: NUMERICAL.ONE * NUMERICAL.ZERO,
//           jobId: `nextTurn:${data.tableId}:${NUMERICAL.ONE}`,
//           tableId:data.tableId,
//       });
//     }
//   }else if(data.status === "-RE-"){
//     tableGamePlay.cardTurnCircle = tableGamePlay.cardTurnCircle === "0-1" ? "1-0" : "0-1";
//     tableGamePlay.currentTurnUserId = nextPlayer.userId;
//     tableGamePlayCache.insertTableGamePlay(tableGamePlay,data.tableId),
//     Scheduler.cancelJob.cancelPlayerTurnTimer(`${data.tableId}:${nextPlayer.userId}:${tableConfig.currentRound}`,data.tableId);
//     Scheduler.cancelJob.cancelSeconderyTimer(`${data.tableId}:${nextPlayer.userId}:${tableConfig.currentRound}`,data.tableId);
//     Scheduler.addJob.nextTurnDelay({
//         timer: NUMERICAL.ONE * NUMERICAL.ZERO,
//         jobId: `nextTurn:${data.tableId}:${NUMERICAL.ONE}`,
//         tableId:data.tableId,
//     });
//   }
//   // return response;
// }

// async function UserBlockCheck(pgp:any,tgp:any){
//   let user_card = pgp.card;
//   let last_moved_card = tgp.movedCard[tgp.movedCard.length-1];

//   let skip_card= /*(user_card)?user_card*/(last_moved_card)?last_moved_card.slice(1, 4):"";
//   let reverse_card= /*(user_card)?user_card*/(last_moved_card)?last_moved_card.slice(1, 5):"";
//   let Draw_card= /*(user_card)?user_card*/(last_moved_card)?last_moved_card.slice(1, 6):"";

//   let last_moved_card= (last_moved_card)?last_moved_card.slice(0, 2):"";
  
  
  
  
  

//   let a = user_card;
//   let term = last_moved_card; // search term (regex pattern)
//   if(last_moved_card=="WC" || last_moved_card=="D4"){
//       term=tgp.wild_card+"-"
//   }
//   // Search for card color
//   let search = new RegExp(term , 'i'); // prepare a regex object
//   let card = a.filter((item:string) => search.test(item));
  

//   // Search for wild card
//   let term_wc = "WC-"; // search term (regex pattern)
//   let search_wc = new RegExp(term_wc , 'i'); // prepare a regex object
//   let card_wild = a.filter((item:string) => search_wc.test(item));
  

//   // Search for draw 4 card
//   let term_w4c = "D4C-"; // search term (regex pattern)
//   let search_w4c = new RegExp(term_w4c , 'i'); // prepare a regex object
//   let card_w4c = a.filter((item:string) => search_w4c.test(item));
  

//   // Search base on card number
//   let term_c_no = "-"+tgp.cardNumber+"-"; // search term (regex pattern)
//   let search_c_no = new RegExp(term_c_no , 'i'); // prepare a regex object
//   let card_no = a.filter((item:string) => search_c_no.test(item));
  

//   // Search for reverse card 
//   let term_c_reverse = (reverse_card=="-RE-")?reverse_card:"---"; // search term (regex pattern)
//   let search_c_reverse = new RegExp(term_c_reverse , 'i'); // prepare a regex object
//   let card_reverse = a.filter((item:string) => search_c_reverse.test(item));
  

//   //Search for skip card 
//   let term_c_skip = (skip_card=="-S-")?skip_card:"---"; // search term (regex pattern)
//   let search_c_skip = new RegExp(term_c_skip , 'i'); // prepare a regex object
//   let card_skip = a.filter((item:string) => search_c_skip.test(item));
  

//   //Search for draw card 
//   let term_c_draw = (Draw_card=="-D2C-")?Draw_card:"---"; // search term (regex pattern)
//   let search_c_draw = new RegExp(term_c_draw , 'i'); // prepare a regex object
//   let card_draw = a.filter((item:string) => search_c_draw.test(item));
  

//   let flag = true; 
  
//   if(card.length > 0){
//       flag=false;
//   }else if(card_wild.length > 0){
//       flag=false;
//   }else if(card_w4c.length > 0){
//       flag=false;
//   }else if(card_no.length > 0){
//       flag=false;
//   }else if(card_reverse.length > 0 && reverse_card!= "C-2"){
//       flag=false;
//   }else if(card_skip.length > 0 && skip_card!= "C-2"){
//       flag=false;
//   }else if(card_draw.length > 0 && Draw_card!= "C-2"){
//       flag=false;
//   }

  
//   return flag;    
// }
// async function give_panelty_1(req_data:any,pgp:any,tgp:any){ 
                                    
//   databaseClass.findOne('playing_table',{_id : ObjectId(req_data.tbid)} ,{}, function (table_data) {
      
//       let isValid=false;
//       if(tgp.OldPaneltyID){ // Check for panelty Id
//           isValid=true;
//       }else if(tgp.PaneltyID){ // Check for panelty Id
//           isValid=true;
//       }else{
//           isValid=false;
//       }
//       if(isValid){ // Check valid panelty
//           let check_extra_card=false;
//           // Check for extra card 
//           // If extra card are not available then reset it first.
//           // Then after give panelty to user.
//           if((tgp.extra_card.length < 2) /*|| (no_of_draw_card==3 && tgp.extra_card.length < 2)*/){
              
//               tgp.extra_card=tgp.extra_card.concat(tgp.moved_card);
              
//               /*tgp.extra_card=*/tgp.extra_card.splice(tgp.extra_card.length-1, 1);
              
//               let last_moved_card=tgp.moved_card[tgp.moved_card.length-1];
              
//               tgp.moved_card=[];
              
//               tgp.moved_card.push(last_moved_card);
              
//               check_extra_card=true;
//           }else if(tgp.extra_card.length==0) {
              
//               tgp.extra_card=tgp.extra_card.concat(tgp.moved_card);
              
//               /*tgp.extra_card=*/tgp.extra_card.splice(tgp.extra_card.length-1, 1);
              
//               let last_moved_card=tgp.moved_card[tgp.moved_card.length-1];
              
//               tgp.moved_card=[];
              
//               tgp.moved_card.push(last_moved_card);
              
//               check_extra_card=true;
//           }

//           let set_length=2;
//           if (tgp.extra_card.length < 2) {
//               set_length=tgp.extra_card.length
//           }
//           let draw_card:Array<string> =[];
//           for (let i = 0; i<set_length; i++) {
//               draw_card.push(tgp.extra_card[i])
//           }
          
//           let concated_user_card=pgp.card.concat(draw_card);
//           let concated_extra_card=tgp.extra_card;
//           let remove_index=[];
//           for (let ij = 0; ij < draw_card.length; ij++) {
//               remove_index.push(ij);
//           }
//           let indexSet = new Set(remove_index);

//           let arrayWithValuesRemoved = concated_extra_card.filter((value:any, i:any) => !indexSet.has(i));
//           eval('update_2 = {$set:{ "pi.'+req_data.next_si+'.ui.card" : concated_user_card,extra_card:arrayWithValuesRemoved }}');

//           if(check_extra_card==true){
//               update_2["$set"]["moved_card"]=tgp.moved_card;    
//           }

//           if(req_data.remove_id){ // Reset panelty id and panelty index
//               update_2["$set"]["PaneltyID"]=""; 
//               update_2["$set"]["OldPaneltyID"]="";
//               update_2["$set"]["Panelty_Turn"]=-1;    
//           }else {
//               update_2["$set"]["PaneltyID"]=tgp.PaneltyID; 
//               update_2["$set"]["OldPaneltyID"]=uptable.PaneltyID; 
//               update_2["$set"]["Panelty_Turn"]=tgp.Panelty_Turn; 
//           }

//           let nxt = playingTableClass.Next_Turn(tgp.tos,tgp); // get next turn index
//           nxt=nxt.turn_si;
//           let wh ={_id:ObjectId(tgp._id.toString())};
//           update_2["$set"]["tos"]=nxt; 
//           // Update table data
//           db.collection('playing_table').findAndModify(wh,{}, update_2, {new : true}, function (err, uptable_2) {
//               if(uptable_2!=null && typeof uptable_2.value != "undefined" && uptable_2.value != null) {
//                   let panelty_data={};
//                   panelty_data.si=req_data.si;
//                   panelty_data.Next_Turn=req_data.next_si;
//                   panelty_data.draw_card=draw_card;
//                   panelty_data.no_of_draw_card=2;
                  

//                   if(check_extra_card==true){// If reset extra card array then send EC_MC_RST(Extra Card And Moved Card Reset) event. 
//                       commonClass.SendDataToTable("EC_MC_RST",{tbid:tgp._id.toString(),extra_card:tgp.extra_card,moved_card:tgp.moved_card},table._id.toString()); //EC_MC_RST - Extra card and Moved card Reset
//                       setTimeout(function(){
//                           // Send UNO_PANELTY event to client side
//                           commonClass.SendDataToTable("UNO_PANELTY",panelty_data,req_data.tbid);
//                           playingTableClass.WinnerCheckAndNextTimer(uptable_2.value,client);
//                       },1000)
//                   }else{ 
//                       // Send UNO_PANELTY event to client side
//                       commonClass.SendDataToTable("UNO_PANELTY",panelty_data,req_data.tbid);
//                       playingTableClass.WinnerCheckAndNextTimer(uptable_2.value,client);
//                   }    
//               }
//           })                                          
//       }
//   })    
// }
export = throwCardHandler;
import { CONSTANTS } from "../Constants";
import { GetTableConfig, GetUserInTable } from "../GameRedisOperations/gameRedisOperations";
import { UserInTableInterface } from "../Interface/UserInTable/UserInTableInterface";
import { GAME_ACTIONS } from "../GameActions";
import { BullTimer } from "../BullTimer";
import { Config } from "../Config";
import { findPointAndColorWiseCards } from "./findPointAndColorWiseCards";

async function findActiveCard(userCardArray:any, tableData:any){
    const CONFIG = Config();

    const TableConfigDetails = await GetTableConfig(tableData.tableId);

    if (!TableConfigDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_CONFIG_NOT_FOUND) };

    console.log(" findActiveCard findActiveCard : ", userCardArray,tableData);
    let user_card = userCardArray;
    let last_moved_card = tableData.activeCard;
  
    last_moved_card= (last_moved_card)?last_moved_card.slice(0, 2):"";

    let term = last_moved_card; // search term (regex pattern)
    if(tableData.activeCard.slice(2, 5) === "D2C" || tableData.activeCard.slice(2, 5) === "D4C"){
        term = '----';
    }else{
        term = tableData.activeCardColor+"-";
    }
    // Search for card color
    let card = user_card.filter((item:string) => new RegExp(term , 'i').test(item));
    
    if (card.length > 0) {
        card = card.sort(function(user_card:string, b:string){return Number(user_card[2]) - Number(b[2])})
        card = card.reverse();
    }

    // Search for wild card
    let card_wild = user_card.filter((item:string) => new RegExp("W-CH" , 'i').test(item));
    
    // Search for draw 4 card
    let card_w4c = user_card.filter((item:string) => new RegExp("D4C-" , 'i').test(item));
  
    // Search base on card number
    let card_no = user_card.filter((item:string) => new RegExp("-"+tableData.cardNumber+"-" , 'i').test(item));
    
    // Search for reverse card 
    let card_reverse = [];
    if(tableData.activeCard.slice(1, 5)  === "-RE-")
        card_reverse = user_card.filter((item:string) => new RegExp("-RE-" , 'i').test(item));
    
    //Search for skip card 
    let card_skip = []; 
    if(tableData.activeCard.slice(1, 4)  === "-S-")
        card_skip = user_card.filter((item:string) => new RegExp("-S-" , 'i').test(item));
    
    //Search for draw card 
    let card_draw = []; 
    if(tableData.activeCard.slice(1, 6)  === "-D2C-")
        card_draw = user_card.filter((item:string) => new RegExp("-D2C-" , 'i').test(item));

    console.log(" findActiveCard findActiveCard 1: ");
    let flag = false; 
    
    if(card.length > 0){
        flag=true;
    }else if(card_wild.length > 0){
        flag=true;
    }else if(card_w4c.length > 0){
        flag=true;
    }else if(card_no.length > 0){
        flag=true;
    }else if(card_reverse.length > 0){
        flag=true;
    }else if(card_skip.length > 0 ){
        flag=true;
    }else if(card_draw.length > 0 ){
        flag=true;
    }

    if(tableData.activeCard.slice(2, 5) === "D2C" && card_draw.length === 0 && card_w4c.length === 0){
        flag= false;
    }else if(tableData.activeCard.slice(2, 5) === "D4C" && card_w4c.length === 0){
        flag= false;
    }else if(tableData.activeCard.slice(2, 5) === "D2C" && (card_draw.length > 0 || card_w4c.length  > 0)){
        card = [];
        card_wild = [];
        card_no = [];
        card_reverse = [];
        card_skip = [];
    }else if(tableData.activeCard.slice(2, 5) === "D4C" && card_w4c.length > 0){
        card = [];
        card_wild = [];
        card_no = [];
        card_reverse = [];
        card_skip = [];
        card_draw = [];
    }
    console.log(" findActiveCard findActiveCard 2: ",card," card_wild: ",card_wild, " card_w4c :" ,card_w4c," card_no : ",card_no," card_reverse : ",card_reverse," card_skip : ",card_skip," card_draw : ",card_draw);
    
    card=card_no.concat(card);
    let active_card=card.concat(card_wild);
    active_card=active_card.concat(card_w4c);
    // active_card=active_card.concat(card_no);
    active_card=active_card.concat(card_reverse);
    active_card=active_card.concat(card_skip);
    active_card=active_card.concat(card_draw);
    
    let uniqueArray=[];
    for(let i=0; i < active_card.length; i++){
        if(uniqueArray.indexOf(active_card[i]) === -1) {
            uniqueArray.push(active_card[i]);
        }
    }

    let nextTurn:any = null ;
    if (tableData.isClockwise) {

        nextTurn = await GAME_ACTIONS.ClockWiseTurnChange(tableData);

        if (!nextTurn && nextTurn !== 0) { throw new Error(CONSTANTS.ERROR_MESSAGES.TURN_CHANGE_ERROR) };

    } else {

        nextTurn = await GAME_ACTIONS.AntiClockWiseTurnChange(tableData);

        if (!nextTurn && nextTurn !== 0) { throw new Error(CONSTANTS.ERROR_MESSAGES.TURN_CHANGE_ERROR) };

    };

    const UserAvailableInTable = tableData.playersArray.find((e:any) => { return e.seatIndex === nextTurn });

    let nextUserInTableDetails: UserInTableInterface = await GetUserInTable(tableData.tableId,UserAvailableInTable?.userId);
    if(tableData.robotType==CONSTANTS.BOT_PRIORITY.EASY){
        let botPickPriority = await GAME_ACTIONS.RandomNumber(0,10);
        let botPickPriorityBaseOnOpponentCards = await GAME_ACTIONS.RandomNumber(2,5);
        if(botPickPriority > 4 && nextUserInTableDetails.cardArray.length < botPickPriorityBaseOnOpponentCards){
            flag = false; 
        }
    }
    

    console.log(" findActiveCard findActiveCard 3: ",active_card, uniqueArray);

    let return_data={flag:flag,si:tableData.currentTurnSeatIndex,card:"",C_C:""}
    let color_array=["R","G","Y","B"];
    let color_index= await GAME_ACTIONS.RandomNumber(0,color_array.length-1);
    if(flag==true){
        let card_bot_w4c=[];
        let card_bot_w2c=[];
        let card_bot_skip=[];
        let card_bot_reverse=[];
        console.log(" findActiveCard findActiveCard 4: ",tableData.robotType);
        // tableData.robotType="high";
        let card_bot_wild = [];
        if(tableData.robotType==CONSTANTS.BOT_PRIORITY.EASY){
            return_data.card=uniqueArray[0];
        }else if(tableData.robotType==CONSTANTS.BOT_PRIORITY.HARD){
            // Search for draw 4 card
            card_bot_w4c = uniqueArray.filter(item => new RegExp("D4C-" , 'i').test(item));

            // Search for draw 2 card
            card_bot_w2c = uniqueArray.filter(item => new RegExp("-D2C-" , 'i').test(item));

            // Search for skip card
            card_bot_skip = uniqueArray.filter(item => new RegExp("-S-" , 'i').test(item));
  
            // Search for reverse card
            card_bot_reverse = uniqueArray.filter(item => new RegExp("-RE-" , 'i').test(item));
  
            // Search for wild card\
            card_bot_wild = uniqueArray.filter(item => new RegExp("W-CH" , 'i').test(item));
            console.log(" findActiveCard findActiveCard 5: ",tableData.robotType);
            if(tableData.activeCard.slice(2, 5) === "D4C" && card_bot_w4c.length > 0){

            }else if(tableData.activeCard.slice(2, 5) === "D2C" && (card_bot_w4c.length > 0 || card_bot_w2c.length > 0)){

            }else if(card_bot_w2c.length > 0 || card_bot_w4c.length > 0 || card_bot_wild.length > 0){
                // let nextTurn:any = null ;
                // if (tableData.isClockwise) {

                //     nextTurn = await GAME_ACTIONS.ClockWiseTurnChange(tableData);

                //     if (!nextTurn && nextTurn !== 0) { throw new Error(CONSTANTS.ERROR_MESSAGES.TURN_CHANGE_ERROR) };

                // } else {

                //     nextTurn = await GAME_ACTIONS.AntiClockWiseTurnChange(tableData);

                //     if (!nextTurn && nextTurn !== 0) { throw new Error(CONSTANTS.ERROR_MESSAGES.TURN_CHANGE_ERROR) };

                // };
                // const UserAvailableInTable = tableData.playersArray.find((e:any) => { return e.seatIndex === nextTurn });

                // let nextUserInTableDetails: UserInTableInterface = await GetUserInTable(UserAvailableInTable?.userId);
                // let D4C_CardInNextPlayerCard = nextUserInTableDetails.cardArray.filter(item => new RegExp("D4C-" , 'i').test(item));
                // let D2C_CardInNextPlayerCard = nextUserInTableDetails.cardArray.filter(item => new RegExp("-D2C-" , 'i').test(item));
                // if(D4C_CardInNextPlayerCard.length > 0){
                //     card_bot_w4c = []
                //     card_bot_w2c = [];
                // }else if(D2C_CardInNextPlayerCard.length > 0 && nextUserInTableDetails.cardArray.length){
                //     // card_bot_w4c = [];
                //     card_bot_w2c = [];
                // }

                const RoundJob = await BullTimer.CheckJob.CheckRound(tableData.tableId);
                let RemainingRoundTimer: any = 0;
                if (RoundJob) { RemainingRoundTimer = await GAME_ACTIONS.RemainTimeCalculation(RoundJob); };
                let userActionCardThrowRandom = await GAME_ACTIONS.RandomNumber(2,4);

                // if(CONFIG.GamePlay.USER_TURN_TIMER < )

                if((card_bot_w2c.length > 0 || card_bot_w4c.length > 0) && RemainingRoundTimer > TableConfigDetails.USER_TURN_TIMER + 30 /*nextUserInTableDetails.cardArray.length > userActionCardThrowRandom*/){
                    card_bot_w4c = []
                    card_bot_w2c = [];
                }else if((card_bot_w2c.length > 0 || card_bot_w4c.length > 0) && nextUserInTableDetails.cardArray.length > userActionCardThrowRandom){
                    card_bot_w4c = []
                    card_bot_w2c = [];
                }
                console.log("card : card :", card, 
                " card_bot_wild : ", card_bot_wild, 
                "nextUserInTableDetails.cardArray  : ", nextUserInTableDetails.cardArray, 
                " userActionCardThrowRandom : ", userActionCardThrowRandom );
                if((card_bot_wild.length > 0  && card.length === 0 && card_no.length === 0) || nextUserInTableDetails.cardArray.length < userActionCardThrowRandom /*&& D4C_CardInNextPlayerCard.length === 0*/){
                    color_index = await findPointAndColorWiseCards(userCardArray,color_index)
                }else{
                    card_bot_wild = [];
                }
                

            }
            console.log(" findActiveCard findActiveCard 6: ");

        }
  
        if(card_bot_w4c.length > 0){
            return_data.card=card_bot_w4c[0];
            color_index = await findPointAndColorWiseCards(userCardArray,color_index)
            return_data.C_C=color_array[color_index];
        }else if(card_bot_w2c.length > 0){
            return_data.card=card_bot_w2c[0];
            return_data.C_C=card_bot_w2c[0][0];
        }else if(card_bot_wild.length > 0){
            return_data.card=card_bot_wild[0];
            return_data.C_C=color_array[color_index];
        }else if(card_bot_skip.length > 0){
            return_data.card=card_bot_skip[0];
            return_data.C_C=card_bot_skip[0][0];
        }else if(card_bot_reverse.length > 0){
            return_data.card=card_bot_reverse[0];
            return_data.C_C=card_bot_reverse[0][0];
        }else{

            let zeroNumberCard = uniqueArray.filter(item => new RegExp("-0-" , 'i').test(item));
            if(zeroNumberCard.length > 0 && tableData.robotType==CONSTANTS.BOT_PRIORITY.HARD){
                return_data.C_C=zeroNumberCard[0][0];
                return_data.card=zeroNumberCard[0];
            }else{
                let chk__card=uniqueArray[0].slice(0, 4);
                console.log(" findActiveCard chk__card : ",chk__card);
                if(chk__card=="W-D4"){
                    color_index = await findPointAndColorWiseCards(userCardArray,color_index)
                    return_data.C_C=color_array[color_index];  
                }else if(chk__card=="W-CH"){
                    color_index = await findPointAndColorWiseCards(userCardArray,color_index)
                    return_data.C_C=color_array[color_index];  
                }else{
                    return_data.C_C=uniqueArray[0][0];
                }
                return_data.card=uniqueArray[0];
            } 
        }
  
    }
    return return_data; 
  }
export { findActiveCard };
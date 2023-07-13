import { CONSTANTS } from "../Constants";
import { GetTable, GetUserInTable } from "../GameRedisOperations/gameRedisOperations";
import { TableInterface } from "../Interface/Table/TableInterface";
import { UserInTableInterface } from "../Interface/UserInTable/UserInTableInterface";
import { Logger } from "../Logger/logger";
import { PickCard } from "../PickCard/pickCard";
import { ThrowCard } from "../ThrowCard/throwCard";
import { GAME_ACTIONS } from "../GameActions";

const TakeTurn = async (tableId: string) => {

    try {

        Logger("TakeTurn", JSON.stringify({ tableId }));

        let TableDetails: TableInterface = await GetTable(tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        const UserAvailableInTable = TableDetails.playersArray.find(e => { return e.seatIndex === TableDetails.currentTurn });

        if (!UserAvailableInTable) { throw new Error(CONSTANTS.ERROR_MESSAGES.WRONG_TABLE) };

        let UserInTableDetails: UserInTableInterface = await GetUserInTable(UserAvailableInTable?.userId);

        if (!UserInTableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_IN_TABLE_NOT_FOUND) };

        // let isPlayableCard = false, playableCard = '';

        // for (let i = 0; i < UserInTableDetails.cardArray.length; i++) {

        //     if (UserInTableDetails.cardArray[i].split("-")[1] === TableDetails.activeCardType || UserInTableDetails.cardArray[i].split("-")[0] === TableDetails.activeCardColor) {

        //         playableCard = UserInTableDetails.cardArray[i];

        //         isPlayableCard = true;

        //         break;

        //     };
        // };

        // console.log({ isPlayableCard, playableCard, avtiveCard: TableDetails.activeCard });

        let detailsOfActiveCard = await findActiveCard(UserInTableDetails.cardArray,{activeCard:TableDetails.activeCard,cardNumber:TableDetails.activeCardType,currentTurnSeatIndex:TableDetails.currentTurn,robotType:TableDetails.botPriority})

        console.log(" TakeTurn detailsOfActiveCard : ", detailsOfActiveCard);

        if (/*isPlayableCard*/detailsOfActiveCard.flag==true && detailsOfActiveCard.card) { // ^ Throw Card

            let Fake_Socket = {

                id: 'Fake_SocketId',

                handshake: {

                    auth: {

                        userId: '',
                        tableId: '',
                        seatIndex: -1,
                        playerCount: 0,
                        bootValue: 0,

                    },
                },
            };

            const Fake_Data = {

                card:detailsOfActiveCard.card, //playableCard,
                cardType:detailsOfActiveCard.card.split('-')[1], //playableCard.split('-')[1],
                cardColor:detailsOfActiveCard.C_C,//detailsOfActiveCard.card.split('-')[0], //playableCard.split('-')[0],
                cardIndex: 0,

                userId: UserInTableDetails.userId,
                tableId: UserInTableDetails.tableId,
                seatIndex: UserInTableDetails.seatIndex

            };

            await ThrowCard('THROW_CARD', Fake_Socket, Fake_Data);

        } else { // ^ Pick Card

            let Fake_Socket = {

                id: 'Fake_SocketId',

                handshake: {

                    auth: {

                        userId: '',
                        tableId: '',
                        seatIndex: -1,
                        playerCount: 0,
                        bootValue: 0,

                    },
                },
            };

            const Fake_Data = {

                userId: UserInTableDetails.userId,
                tableId: UserInTableDetails.tableId,
                seatIndex: UserInTableDetails.seatIndex

            };

            await PickCard('PICK_CARD', Fake_Socket, Fake_Data);

        };

    } catch (error: any) {
        Logger('TakeTurn Error : ', error);
    };
};


async function findActiveCard(userCardArray:any, tableData:any){
    let user_card = userCardArray;
    let last_moved_card = tableData.activeCard;
  
    // let skip_card= /*(user_card)?user_card*/(last_moved_card)?last_moved_card.slice(1, 4):"";
    // let reverse_card= /*(user_card)?user_card*/(last_moved_card)?last_moved_card.slice(1, 5):"";
    // let Draw_card= /*(user_card)?user_card*/(last_moved_card)?last_moved_card.slice(1, 6):"";
  
    last_moved_card= (last_moved_card)?last_moved_card.slice(0, 2):"";
    
    
    
    
    
  
    let a = user_card;
    let term = last_moved_card; // search term (regex pattern)
    if(last_moved_card=="W-" /*|| last_moved_card=="D4"*/){
        term = tableData.activeCard.slice(0, 4)//last_moved_card+"-"
    }
    // Search for card color
    let search = new RegExp(term , 'i'); // prepare a regex object
    let card = a.filter((item:string) => search.test(item));
    
  
    // Search for wild card
    let term_wc = "W-CH"; // search term (regex pattern)
    let search_wc = new RegExp(term_wc , 'i'); // prepare a regex object
    let card_wild = a.filter((item:string) => search_wc.test(item));
    
  
    // Search for draw 4 card
    let term_w4c = "D4C-"; // search term (regex pattern)
    let search_w4c = new RegExp(term_w4c , 'i'); // prepare a regex object
    let card_w4c = a.filter((item:string) => search_w4c.test(item));
    
  
    // Search base on card number
    let term_c_no = "-"+tableData.cardNumber+"-"; // search term (regex pattern)
    let search_c_no = new RegExp(term_c_no , 'i'); // prepare a regex object
    let card_no = a.filter((item:string) => search_c_no.test(item));
    
  
    // Search for reverse card 
    // let term_c_reverse = (reverse_card=="-RE-")?reverse_card:"---"; // search term (regex pattern)
    let term_c_reverse = "-RE-"; 
    let search_c_reverse = new RegExp(term_c_reverse , 'i'); // prepare a regex object
    let card_reverse = a.filter((item:string) => search_c_reverse.test(item));
    
  
    //Search for skip card 
    let term_c_skip = "-S-"; // search term (regex pattern)
    let search_c_skip = new RegExp(term_c_skip , 'i'); // prepare a regex object
    let card_skip = a.filter((item:string) => search_c_skip.test(item));
    
  
    //Search for draw card 
    let term_c_draw = "-D2C-"; // search term (regex pattern)
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
    }else if(card_reverse.length > 0 /*&& reverse_card!= "C-1"*/){
        flag=true;
    }else if(card_skip.length > 0 /*&& skip_card!= "C-1"*/){
        flag=true;
    }else if(card_draw.length > 0 /*&& Draw_card!= "C-1"*/){
        flag=true;
    }

    if(tableData.activeCard.slice(2, 5) === "D2C" && card_draw.length === 0 && card_w4c.length === 0 && card_wild.length === 0){
        flag= false;
    }else if(tableData.activeCard.slice(2, 5) === "D4C" && card_w4c.length === 0 && card_wild.length === 0){
        flag= false;
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
    let return_data={flag:flag,si:tableData.currentTurnSeatIndex,card:"",C_C:"",forcefully_throw_card: false,UNO_button:false}
    let color_array=["R","G","Y","B"];
    let color_index= await GAME_ACTIONS.RandomNumber(0,color_array.length-1);
    if(flag==true){
        let card_bot_w4c=[];
        let card_bot_w2c=[];
        let card_bot_skip=[];
        let card_bot_reverse=[];
        let set_midium_robot_move= await GAME_ACTIONS.RandomNumber(0,5);
        // tableData.robotType="high";
        let card_bot_wild = [];
        if(tableData.robotType==CONSTANTS.BOT_PRIORITY.EASY){
            return_data.card=uniqueArray[0];
        }else if(tableData.robotType==CONSTANTS.BOT_PRIORITY.HARD){
            // Search for draw 4 card
            let term_bot_w4c = "D4C-"; // search term (regex pattern)
            let search_bot_w4c = new RegExp(term_bot_w4c , 'i'); // prepare a regex object
            card_bot_w4c = uniqueArray.filter(item => search_bot_w4c.test(item));
  
            // Search for draw 2 card
            let term_bot_w2c = "-D2C-"; // search term (regex pattern)
            let search_bot_w2c = new RegExp(term_bot_w2c , 'i'); // prepare a regex object
            card_bot_w2c = uniqueArray.filter(item => search_bot_w2c.test(item));
  
            // Search for skip card
            let term_bot_skip = "-S-"; // search term (regex pattern)
            let search_bot_skip = new RegExp(term_bot_skip , 'i'); // prepare a regex object
            card_bot_skip = uniqueArray.filter(item => search_bot_skip.test(item));
  
            // Search for reverse card
            let term_bot_reverse = "-RE-"; // search term (regex pattern)
            let search_bot_reverse = new RegExp(term_bot_reverse , 'i'); // prepare a regex object
            card_bot_reverse = uniqueArray.filter(item => search_bot_reverse.test(item));
  
            // Search for wild card
            let term_bot_wc = "W-CH"; // search term (regex pattern)
            let search_bot_wc = new RegExp(term_bot_wc , 'i'); // prepare a regex object
            card_bot_wild = uniqueArray.filter(item => search_bot_wc.test(item));
        }
        // else if(tableData.robotType=="medium" && set_midium_robot_move==0){
        //     // Search for draw 4 card
        //     let term_bot_w4c = "D4C-"; // search term (regex pattern)
        //     let search_bot_w4c = new RegExp(term_bot_w4c , 'i'); // prepare a regex object
        //     card_bot_w4c = uniqueArray.filter(item => search_bot_w4c.test(item));
  
        //     // Search for draw 2 card
        //     let term_bot_w2c = "-D2C-"; // search term (regex pattern)
        //     let search_bot_w2c = new RegExp(term_bot_w2c , 'i'); // prepare a regex object
        //     card_bot_w2c = uniqueArray.filter(item => search_bot_w2c.test(item));
  
        //     // Search for skip card
        //     let term_bot_skip = "-S-"; // search term (regex pattern)
        //     let search_bot_skip = new RegExp(term_bot_skip , 'i'); // prepare a regex object
        //     card_bot_skip = uniqueArray.filter(item => search_bot_skip.test(item));
  
        //     // Search for reverse card
        //     let term_bot_reverse = "-RE-"; // search term (regex pattern)
        //     let search_bot_reverse = new RegExp(term_bot_reverse , 'i'); // prepare a regex object
        //     card_bot_reverse = uniqueArray.filter(item => search_bot_reverse.test(item));
  
        //     // Search for wild card
        //     let term_bot_wc = "W-CH"; // search term (regex pattern)
        //     let search_bot_wc = new RegExp(term_bot_wc , 'i'); // prepare a regex object
        //      card_bot_wild = uniqueArray.filter(item => search_bot_wc.test(item));
        // }
  
        if(card_bot_w4c.length > 0){
            return_data.card=card_bot_w4c[0];
            return_data.C_C=color_array[color_index];
        }else if(card_bot_w2c.length > 0){
            return_data.card=card_bot_w2c[0];
            return_data.C_C=card_bot_w2c[0][0];
        }else if(card_bot_skip.length > 0){
            return_data.card=card_bot_skip[0];
            return_data.C_C=card_bot_skip[0][0];
        }else if(card_bot_reverse.length > 0){
            return_data.card=card_bot_reverse[0];
            return_data.C_C=card_bot_reverse[0][0];
        }else if(card_bot_wild.length > 0){
            return_data.card=card_bot_wild[0];
            return_data.C_C=color_array[color_index];
        }else{
            let chk__card=uniqueArray[0].slice(0, 4);
            if(chk__card=="W-D4"){
                return_data.C_C=color_array[color_index];  
            }else if(chk__card=="W-CH"){
                return_data.C_C=color_array[color_index];  
            }else{
                return_data.C_C=uniqueArray[0][0];
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

export { TakeTurn };
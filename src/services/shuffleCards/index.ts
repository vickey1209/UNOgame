import { shuffleCards,GetRandomInt } from '../../common';
import { NUMERICAL, SHUFFLE_CARDS } from '../../constants';
import Logger from "../../logger";
// import {shuffleCards} from "../../common";

export interface cardsAndScoreInterface {
  card: Array<string>;
  points: number;
}
export interface shuffleCardData {
  moved_card: Array<string>;
  cardColor: string;
  cardNumber: string;
  userCardArray: Array<Array<string>>;
  extraCard:Array<string>;
}
// async function setDistributedCard1(
//   maximumPlayerCount: number,
//   totalActivePlayer: number,
//   tableId: string,
// ): Promise<shuffleCardData> {
//   try {
//     Logger.info(tableId,'totalActivePlayer :>> ', totalActivePlayer);
//     let cardArray = [];
//     const cards = [];
//     let s1_card = [];
//     let s2_card = [];
//     let s3_card = [];
//     let s4_card = [];
//     let s5_card = [];
//     let s6_card = [];
//     let s1_points;
//     let s2_points;
//     let s3_points;
//     let s4_points;
//     let s5_points;
//     let s6_points;

//     // cardArray = SHUFFLE_CARDS.DECK_ONE;
//     cardArray = SHUFFLE_CARDS.DECK_ONE.concat(SHUFFLE_CARDS.DECK_TWO).concat(SHUFFLE_CARDS.JOKER);
//     // cardArray = [
//     //   'S_14_0_1',
//     //   'S_2_0_1',
//     //   'S_3_0_1',
//     //   'S_4_0_1',
//     //   'S_5_0_1',
//     //   'S_6_0_1',
//     //   'S_7_0_1',
//     //   'S_8_0_1',
//     //   'S_9_0_1',
//     //   'S_10_0_1',
//     //   'S_11_0_1',
//     //   'S_12_0_1',
//     //   'S_13_0_1',
//     //   'C_14_0_1',
//     //   'C_2_0_1',
//     //   'C_3_0_1',
//     //   'C_4_0_1',
//     //   'C_5_0_1',
//     //   'C_6_0_1',
//     //   'C_7_0_1',
//     //   'C_8_0_1',
//     //   'C_9_0_1',
//     //   'C_10_0_1',
//     //   'C_11_0_1',
//     //   'C_12_0_1',
//     //   'C_13_0_1',
//     //   'H_14_0_1',
//     //   'H_2_0_1',
//     //   'H_3_0_1',
//     //   'H_4_0_1',
//     //   'H_5_0_1',
//     //   'H_6_0_1',
//     //   'H_7_0_1',
//     //   'H_8_0_1',
//     // ]
//     Logger.info(tableId,'Defalt 2-Deck cardArray.length :>> ', cardArray.length);

//     /** Create joker */
//     const jokerCard = Math.floor(Math.random() * cardArray.length);
//     let jokar = cardArray.splice(jokerCard, NUMERICAL.ONE)[0];
//     if (jokar == 'J_J_J_1' || jokar == 'J_J_J_2') { jokar = 'S_14_0_1'; }
//     const trumpCard: string[] = [jokar];
//     Logger.info(tableId,"trumpCard :: ", trumpCard);

//     let value = jokar.split('_');
//     cardArray = cardArray.map((ele, ind) => {
//       let tempcard = ele.split('_');
//       if (tempcard[1] == value[1]) {
//         return ele = `${tempcard[0]}_${tempcard[1]}_J_${tempcard[3]}`;
//       }
//       return ele;
//     })
//     Logger.info(tableId,'cardArray updated with joker and wlid card :>> ', cardArray);

//     const twoDeck = cardArray;
//     const shuffle = shuffleCards(twoDeck);
//     cardArray = shuffleCards(shuffle);

//     const opendDeck: string[] = cardArray.splice(0, NUMERICAL.ONE);
//     Logger.info(tableId," opendDeck :: ", opendDeck);

//     if (totalActivePlayer == NUMERICAL.ONE) {
//       s1_card = cardArray.splice(0, NUMERICAL.THIRTEEN);

//       s1_points = await pointCalculate(s1_card);
//       cards.push({ card: s1_card, points: s1_points });
//     }

//     if (totalActivePlayer == NUMERICAL.TWO) {
//       s1_card = cardArray.splice(0, NUMERICAL.THIRTEEN);
//       s2_card = cardArray.splice(0, NUMERICAL.THIRTEEN);

//       // s1_card = ['S_2_0_1', 'S_3_0_1', 'S_4_0_1', 'S_5_0_1', 'S_6_0_1', 'S_7_0_1', 'S_8_0_1', 'S_9_0_1', 'S_10_0_1', 'S_11_0_1', 'S_12_0_1', 'S_13_0_1', 'J_J_J_1'];
//       // s2_card = ['S_2_0_1', 'S_3_0_1', 'S_4_0_1', 'S_5_0_1', 'S_6_0_1', 'S_7_0_1', 'S_8_0_1', 'S_9_0_1', 'S_10_0_1', 'S_11_0_1', 'S_12_0_1', 'S_13_0_1', 'J_J_J_1'];

//       s1_points = await pointCalculate(s1_card);
//       s2_points = await pointCalculate(s2_card);

//       cards.push({ card: s1_card, points: s1_points });
//       cards.push({ card: s2_card, points: s2_points });
//     }

//     if (totalActivePlayer == NUMERICAL.THREE) {
//       s1_card = cardArray.splice(0, NUMERICAL.THIRTEEN);
//       s2_card = cardArray.splice(0, NUMERICAL.THIRTEEN);
//       s3_card = cardArray.splice(0, NUMERICAL.THIRTEEN);

//       s1_points = await pointCalculate(s1_card);
//       s2_points = await pointCalculate(s2_card);
//       s3_points = await pointCalculate(s3_card);

//       cards.push({ card: s1_card, points: s1_points });
//       cards.push({ card: s2_card, points: s2_points });
//       cards.push({ card: s3_card, points: s3_points });
//     }

//     if (totalActivePlayer == NUMERICAL.FOUR) {
//       s1_card = cardArray.splice(0, NUMERICAL.THIRTEEN);
//       s2_card = cardArray.splice(0, NUMERICAL.THIRTEEN);
//       s3_card = cardArray.splice(0, NUMERICAL.THIRTEEN);
//       s4_card = cardArray.splice(0, NUMERICAL.THIRTEEN);

//       s1_points = await pointCalculate(s1_card);
//       s2_points = await pointCalculate(s2_card);
//       s3_points = await pointCalculate(s3_card);
//       s4_points = await pointCalculate(s4_card);

//       cards.push({ card: s1_card, points: s1_points });
//       cards.push({ card: s2_card, points: s2_points });
//       cards.push({ card: s3_card, points: s3_points });
//       cards.push({ card: s4_card, points: s4_points });
//     }

//     if (totalActivePlayer == NUMERICAL.FIVE) {
//       s1_card = cardArray.splice(0, NUMERICAL.THIRTEEN);
//       s2_card = cardArray.splice(0, NUMERICAL.THIRTEEN);
//       s3_card = cardArray.splice(0, NUMERICAL.THIRTEEN);
//       s4_card = cardArray.splice(0, NUMERICAL.THIRTEEN);
//       s5_card = cardArray.splice(0, NUMERICAL.THIRTEEN);

//       s1_points = await pointCalculate(s1_card);
//       s2_points = await pointCalculate(s2_card);
//       s3_points = await pointCalculate(s3_card);
//       s4_points = await pointCalculate(s4_card);
//       s5_points = await pointCalculate(s5_card);

//       cards.push({ card: s1_card, points: s1_points });
//       cards.push({ card: s2_card, points: s2_points });
//       cards.push({ card: s3_card, points: s3_points });
//       cards.push({ card: s4_card, points: s4_points });
//       cards.push({ card: s5_card, points: s5_points });
//     }

//     if (totalActivePlayer == NUMERICAL.SIX) {
//       s1_card = cardArray.splice(0, NUMERICAL.THIRTEEN);
//       s2_card = cardArray.splice(0, NUMERICAL.THIRTEEN);
//       s3_card = cardArray.splice(0, NUMERICAL.THIRTEEN);
//       s4_card = cardArray.splice(0, NUMERICAL.THIRTEEN);
//       s5_card = cardArray.splice(0, NUMERICAL.THIRTEEN);
//       s6_card = cardArray.splice(0, NUMERICAL.THIRTEEN);

//       s1_points = await pointCalculate(s1_card);
//       s2_points = await pointCalculate(s2_card);
//       s3_points = await pointCalculate(s3_card);
//       s4_points = await pointCalculate(s4_card);
//       s5_points = await pointCalculate(s5_card);
//       s6_points = await pointCalculate(s6_card);

//       cards.push({ card: s1_card, points: s1_points });
//       cards.push({ card: s2_card, points: s2_points });
//       cards.push({ card: s3_card, points: s3_points });
//       cards.push({ card: s4_card, points: s4_points });
//       cards.push({ card: s5_card, points: s5_points });
//       cards.push({ card: s6_card, points: s6_points });
//     }
    
//     return { cardAndPoint: cards, closedDeck: cardArray, opendDeck, trumpCard };
//   }
//   catch (e) {
//     Logger.error(tableId,'setDistributedCard error', e);
//     throw new Error('setDistributedCard error');
//   }
// }


async function pointCalculate(cards: any[]): Promise<number> {
  let arrNumber: any[] = [];
  cards.map((ele) => {
    let arr = ele.split('_');
    if (arr[NUMERICAL.TWO] == String(NUMERICAL.ZERO)) {
      (arr[NUMERICAL.ONE] > NUMERICAL.TEN)
        ? arrNumber.push(NUMERICAL.TEN)
        : arrNumber.push(Number(arr[NUMERICAL.ONE]))
    }
  })
  const sum: number = arrNumber.reduce((partialSum, a) => partialSum + a, 0);
  let res: number = (sum > NUMERICAL.EIGHTY) ? NUMERICAL.EIGHTY : sum;

  return res;

}



async function setDistributedCard(tableId:string,seats:any){
  //Find Table
  // databaseClass.findOne('playing_table',{_id:ObjectId(tableId.toString())} ,{}, function (tabledata) {
      // if(tabledata!=null){
        
          let getConstantCards = await getCardList();
          let extraCard = shuffleCards(getConstantCards.cardArrayWithOutActionCard);
          // Get index of first move of card
          // let random_card_index = await GetRandomInt(0, (getConstantCards.cardArrayWithOutActionCard.length - 1));
          // Get card for first move.
          let first_turn_random_card=extraCard.slice(0, 1);
          let first_turn_random_card_array=first_turn_random_card;
          // first_turn_random_card_array.push(first_turn_random_card);
          // for (let i = 0; i < getConstantCards.cardArray.length; i++) {
          //     if(first_turn_random_card==getConstantCards.cardArray[i]){
          //       getConstantCards.cardArray.splice(i, 1);
          //     }
          // }
          // Find number for first moved card 
          let cardNumber= first_turn_random_card[0].slice(2, 3); //number
          // Find color for first moved card  
          let cardColor= first_turn_random_card[0].slice(0, 1); //color
          // c("========Send Card=>>>",getConstantCards.cardArrayWithOutActionCard.length,random_card_index,first_turn_random_card,CardArray);
          // shuffle card array
          // let extraCard = shuffleCards(getConstantCards.cardArray);
          // let updateData = { $set : {buc:0,cp:0,tos:tos,lws:lws,ob:[],fd:"",tst:'round_start',tt:new Date(),moved_card :first_turn_random_card_array,card_color:card_color,card_number:card_number} };
          let noOfCards = (seats.length==2)?5:5; //splice number
          // c("SendCard >> nu >>",nu);
          let userCardArray = [];
          // Distribute and update card
          for(let i in seats){
              let user_card = extraCard.splice(0,noOfCards);
              userCardArray.push(user_card);
          }
        console.log("ddd : ",userCardArray);

          let actionCard = shuffleCards(getConstantCards.actionCardArray);
          console.log("ddd actionCard: ",actionCard);
          userCardArray.forEach(element => {
            let user_card = actionCard.splice(0,2);
            element = element.concat(user_card);
          });
          // for(let j in seats){
          //   let user_card = actionCard.splice(0,2);
          //   userCardArray = userCardArray.concat(user_card);
          // }
          extraCard = extraCard.concat(actionCard);
          extraCard = shuffleCards(extraCard);
          return {moved_card:first_turn_random_card_array, cardColor, cardNumber,extraCard,userCardArray }
          // tos=0;
          // updateData["$set"]["tos"] = tos;
          
          // updateData["$set"]["extra_card"] = arr; 
          // c("SendDice >> updateData >>",updateData);
          // updateData["$set"]["DC_send"] = true;
          // c("========Send 111Card=>>>",updateData);
          // Update table 
          // commonClass.SendDataToTable("DC",{ pi : upDicetable.pi,first_turn_card:first_turn_random_card,ap:upDicetable.ap},tableId);    
      // }
  // })
}

async function getCardList(){
  /*
  R-S-1 -> Red Skip Card 1
  Y-S-1 -> Yellow Skip Card 1
  G-S-1 -> Green Skip Card 1
  B-S-1 -> Blue Skip Card 1

  R-S-2 -> Red Skip Card 2
  Y-S-2 -> Yellow Skip Card 2
  G-S-2 -> Green Skip Card 2
  B-S-2 -> Blue Skip Card 2

  R-RE-1 -> Red Reverse Card 1
  Y-RE-1 -> Yellow Reverse Card 1
  G-RE-1 -> Green Reverse Card 1
  B-RE-1 -> Blue Reverse Card 1

  R-RE-2 -> Red Reverse Card 2
  Y-RE-2 -> Yellow Reverse Card 2
  G-RE-2 -> Green Reverse Card 2
  B-RE-2 -> Blue Reverse Card 2

  R-D2C-1 -> Red Draw 2 Card
  Y-D2C-1 -> Yellow Draw 2 Card
  G-D2C-1 -> Green Draw 2 Card
  B-D2C-1 -> Blue Draw 2 Card

  R-D2C-2 -> Red Draw 2 Card
  Y-D2C-2 -> Yellow Draw 2 Card
  G-D2C-2 -> Green Draw 2 Card
  B-D2C-2 -> Blue Draw 2 Card

  WC-1 ->  Wild Card 1
  WC-2 ->  Wild Card 1
  WC-3 ->  Wild Card 1
  WC-4 ->  Wild Card 1

  D4C-1 -> Red Draw 4 Card
  D4C-2 -> Yellow Draw 4 Card
  D4C-3 -> Green Draw 4 Card
  D4C-4 -> Blue Draw 4 Card
  */
const cardArray = ["R-0-1","R-1-1","R-2-1","R-3-1","R-4-1","R-5-1","R-6-1","R-7-1","R-8-1","R-9-1","R-S-1","R-RE-1","R-D2C-1","WC-1",
  "R-1-2","R-2-2","R-3-2","R-4-2","R-5-2","R-6-2","R-7-2","R-8-2","R-9-2","R-S-2","R-RE-2","R-D2C-2","D4C-1",
  
  "Y-0-1","Y-1-1","Y-2-1","Y-3-1","Y-4-1","Y-5-1","Y-6-1","Y-7-1","Y-8-1","Y-9-1","Y-S-1","Y-RE-1","Y-D2C-1","WC-2",
  "Y-1-2","Y-2-2","Y-3-2","Y-4-2","Y-5-2","Y-6-2","Y-7-2","Y-8-2","Y-9-2","Y-S-2","Y-RE-2","Y-D2C-2","D4C-2",

  "G-0-1","G-1-1","G-2-1","G-3-1","G-4-1","G-5-1","G-6-1","G-7-1","G-8-1","G-9-1","G-S-1","G-RE-1","G-D2C-1","WC-3",
  "G-1-2","G-2-2","G-3-2","G-4-2","G-5-2","G-6-2","G-7-2","G-8-2","G-9-2","G-S-2","G-RE-2","G-D2C-2","D4C-3",

  "B-0-1","B-1-1","B-2-1","B-3-1","B-4-1","B-5-1","B-6-1","B-7-1","B-8-1","B-9-1","B-S-1","B-RE-1","B-D2C-1","WC-4",
  "B-1-2","B-2-2","B-3-2","B-4-2","B-5-2","B-6-2","B-7-2","B-8-2","B-9-2","B-S-2","B-RE-2","B-D2C-2","D4C-4"]

  const cardArrayWithOutActionCard = ["R-0-1","R-1-1","R-2-1","R-3-1","R-4-1","R-5-1","R-6-1","R-7-1","R-8-1","R-9-1",
  "R-1-2","R-2-2","R-3-2","R-4-2","R-5-2","R-6-2","R-7-2","R-8-2","R-9-2",
  
  "Y-0-1","Y-1-1","Y-2-1","Y-3-1","Y-4-1","Y-5-1","Y-6-1","Y-7-1","Y-8-1","Y-9-1",
  "Y-1-2","Y-2-2","Y-3-2","Y-4-2","Y-5-2","Y-6-2","Y-7-2","Y-8-2","Y-9-2",

  "G-0-1","G-1-1","G-2-1","G-3-1","G-4-1","G-5-1","G-6-1","G-7-1","G-8-1","G-9-1",
  "G-1-2","G-2-2","G-3-2","G-4-2","G-5-2","G-6-2","G-7-2","G-8-2","G-9-2",

  "B-0-1","B-1-1","B-2-1","B-3-1","B-4-1","B-5-1","B-6-1","B-7-1","B-8-1","B-9-1",
  "B-1-2","B-2-2","B-3-2","B-4-2","B-5-2","B-6-2","B-7-2","B-8-2","B-9-2"];
 
  const actionCardArray = [
    "R-S-1","R-RE-1","R-D2C-1","WC-1",
  "R-S-2","R-RE-2","R-D2C-2","D4C-1",
  
  "Y-S-1","Y-RE-1","Y-D2C-1","WC-2",
  "Y-S-2","Y-RE-2","Y-D2C-2","D4C-2",

  "G-S-1","G-RE-1","G-D2C-1","WC-3",
  "G-S-2","G-RE-2","G-D2C-2","D4C-3",

  "B-S-1","B-RE-1","B-D2C-1","WC-4",
  "B-S-2","B-RE-2","B-D2C-2","D4C-4"]
  return {cardArray, cardArrayWithOutActionCard,actionCardArray};

}

// async function getRandomInt(min:number, max:number) {
//   let rnd = Math.floor(Math.random() * (max - min + 1)) + min;
//   return Number(rnd);
// }

export { setDistributedCard, pointCalculate, getCardList };

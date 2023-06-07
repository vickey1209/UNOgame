import { NUMERICAL } from "../constants";
const _ = require('underscore');


function GetRandomInt(min : number, max : number) {
    const rnd : number =
      Math.floor(Math.random() * (Number(max) - Number(min) + 1)) +
      Number(min);
    return Number(rnd);
}

function diffSeconds(date1: Date, date2: Date): number {
  const diff = (new Date(date1).getTime() - new Date(date2).getTime()) / 1000;
  return Math.ceil(diff);
}

function calculateAmount(score : number, entryFee : number): number {
  
  const rnd : number = entryFee * (NUMERICAL.EIGHTY - score);
  return Number(rnd);
}

function shuffleCards(Cards: string[]) {
  const cards = _.clone(Cards);
  const shuffle = [];
  while (cards.length > 0) {
    const rt = Math.floor(Math.random() * cards.length);
    shuffle.push(cards[rt]);
    cards.splice(rt, 1);
  }
  return shuffle;
}

async function userBlockCheck(pgp:any,tgp:any){
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
  return {flag:flag,activeCards:uniqueArray};    
}




const exportedObject = { GetRandomInt, diffSeconds, calculateAmount, shuffleCards, userBlockCheck };
export = exportedObject;


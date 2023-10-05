import { getUserScore } from "../AllUserScore/allUserScore";


async function findPointAndColorWiseCards(userCardArray:any, color_index:number,tableId:string){
    // let resRedCardsNextPlayer = nextUserInTableDetails.cardArray.filter(item => new RegExp("R-" , 'i').test(item));
    // let resGreenCardsNextPlayer = nextUserInTableDetails.cardArray.filter(item => new RegExp("G-" , 'i').test(item));
    // let resYelloCardsNextPlayer = nextUserInTableDetails.cardArray.filter(item => new RegExp("Y-" , 'i').test(item));
    // let resBlueCardsNextPlayer = nextUserInTableDetails.cardArray.filter(item => new RegExp("B-" , 'i').test(item));
    
    let resRedCardsCurrentPlayer = userCardArray.filter((item:string) => new RegExp("R-" , 'i').test(item));
    let resGreenCardsCurrentPlayer = userCardArray.filter((item:string) => new RegExp("G-" , 'i').test(item));
    let resYelloCardsCurrentPlayer = userCardArray.filter((item:string) => new RegExp("Y-" , 'i').test(item));
    let resBlueCardsCurrentPlayer = userCardArray.filter((item:string) => new RegExp("B-" , 'i').test(item));
    console.log("resRedCardsCurrentPlayer :", resRedCardsCurrentPlayer ," resGreenCardsCurrentPlayer :", resGreenCardsCurrentPlayer ," resYelloCardsCurrentPlayer :", resYelloCardsCurrentPlayer , "resBlueCardsCurrentPlayer :", resBlueCardsCurrentPlayer );
    let masterArray = [resRedCardsCurrentPlayer,resGreenCardsCurrentPlayer,resYelloCardsCurrentPlayer,resBlueCardsCurrentPlayer];

    const userCardPointArray = await Promise.all(
        masterArray.map(async (cardsArray: any) => await getUserScore(cardsArray,tableId)),
    );
    console.log("userCardPointArray :", userCardPointArray );
    let cardPointObj:any = {};
    let idx = 0;
    userCardPointArray.forEach((cardsArray: any)=>{
        console.log("userCardPointArray IN ::",cardPointObj,Object.keys(cardPointObj).length, cardsArray );
        if(Object.keys(cardPointObj).length === 0 && cardsArray && cardsArray.currentRoundScore > 0){
            console.log("YES 1 : ")
            cardPointObj = cardsArray;
            cardPointObj.idx = idx
            
        }else if(cardsArray && cardsArray.currentRoundScore > cardPointObj.currentRoundScore){
            console.log("YES 2 : ")
            cardPointObj = cardsArray;
            cardPointObj.idx = idx
        }
        idx++;
        console.log("userCardPointArray IN-OUT ::",cardPointObj, cardsArray );
    })    

    console.log("indexOfLongestArray :", cardPointObj );
    color_index = cardPointObj.idx;
    
    // if(resRedCardsCurrentPlayer.length === 0){
    //     color_index = 0;
    // }else if(resGreenCardsCurrentPlayer.length === 0){
    //     color_index = 1;
    // }else if(resYelloCardsCurrentPlayer.length === 0){
    //     color_index = 2;
    // }else if(resBlueCardsCurrentPlayer.length === 0){
    //     color_index = 3;
    // }

    // if(resRedCardsNextPlayer.length === 0 && resRedCardsCurrentPlayer.length > 0){
    //     color_index = 0;
    // }else if(resGreenCardsNextPlayer.length === 0  && resGreenCardsCurrentPlayer.length > 0){
    //     color_index = 1;
    // }else if(resYelloCardsNextPlayer.length === 0  && resYelloCardsCurrentPlayer.length > 0){
    //     color_index = 2;
    // }else if(resBlueCardsNextPlayer.length === 0  && resBlueCardsCurrentPlayer.length > 0){
    //     color_index = 3;
    // }else if(resRedCardsNextPlayer.length === 0){
    //     color_index = 0;
    // }else if(resGreenCardsNextPlayer.length === 0){
    //     color_index = 1;
    // }else if(resYelloCardsNextPlayer.length === 0){
    //     color_index = 2;
    // }else if(resBlueCardsNextPlayer.length === 0){
    //     color_index = 3;
    // }
    return color_index;
}
export { findPointAndColorWiseCards };
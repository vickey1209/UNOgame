export interface UserInTableInterface {

    userId: string,
    tableId: string,
    seatIndex: number,
    userScore: number,
    turnMissCount: number,
    isBot: boolean,
    isUnoClick: boolean,
    lastPickCard: string,
    lastThrowCard: string,
    cardArray: Array<string>,

}
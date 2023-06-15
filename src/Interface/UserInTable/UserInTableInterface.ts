export interface UserInTableInterface {

    userId: string,
    tableId: string,
    seatIndex: number,
    userScore: number,
    isBot: boolean,
    isUnoClick: boolean,
    lastPickCard: string,
    lastThrowCard: string,
    cardArray: Array<string>,

}
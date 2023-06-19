export interface TurnInfoResInterface {

    currentTurn: number,
    activeCard: string,
    activeCardType: string,
    activeCardColor: string,

    isSkip: boolean,
    skipSeatIndex: number,

    totalTime: number,
    remainingTime: number,

}
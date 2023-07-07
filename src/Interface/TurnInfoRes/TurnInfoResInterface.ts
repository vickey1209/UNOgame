export interface TurnInfoResInterface {

    currentTurn: number,
    activeCard: string,
    activeCardType: string,
    activeCardColor: string,

    isSkip: boolean,
    skipSeatIndex: number,

    isRevers: boolean,
    isClockwise: boolean,

    isThrowPossible: boolean,

    totalTime: number,
    remainingTime: number,

}
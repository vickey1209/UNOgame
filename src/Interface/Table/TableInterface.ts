export interface TableInterface {

    tableId: string,
    bootValue: number,
    currentTurn: number,
    currentRound: number,
    maxPlayers: number,

    playersArray: Array<PlayersArrayInterface>,

    numberOfCardToPick: number

    activeCard: string,
    activeCardType: string,
    activeCardColor: string,
    closeCardDeck: Array<string>,
    openCardDeck: Array<string>,

    isClockwise: boolean,
    isGameStart: boolean,
    isWinning: boolean,
    isRoundScoreScreen: boolean,
    isLeaveLock: boolean,
    isTurnLock: boolean,

}

export interface PlayersArrayInterface {

    userId: string,
    userName: string,
    userProfile: string,
    seatIndex: number,
    isLeave: boolean,
    isBot: boolean,

}

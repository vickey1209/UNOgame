export interface TableInterface {

    tableId: string,
    bootValue: number,
    currentTurn: number,
    currentRound: number,
    totalRounds: number,
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
    isRoundStart: boolean,
    isScoreScreen: boolean,

    isLeaveLock: boolean,
    isTurnLock: boolean,

    isWinning: boolean,

}

export interface PlayersArrayInterface {

    userId: string,
    userName: string,
    userProfile: string,
    seatIndex: number,
    isLeave: boolean,
    isBot: boolean,

}

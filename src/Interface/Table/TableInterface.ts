export interface TableInterface {

    tableId: string,
    bootValue?: number,
    currentTurn: number,
    currentRound: number,
    totalRounds: number,
    maxPlayers: number,
    botPriority: string,
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

    disconnectedUsers: Array<string>
    winningArray: Array<WinningArrayInterface>

}

export interface PlayersArrayInterface {

    userId: string,
    userName: string,
    userProfile: string,
    seatIndex: number,
    isLeave: boolean,
    isBot: boolean,

}

export interface WinningArrayInterface {

    userId: string,
    userName: string,
    userProfile: string,
    userScore: number,
    isLeave: boolean,
    rankNumber: number,
    price: number,
    previousScore: Array<number>

}
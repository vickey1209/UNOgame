// export interface SignUpInterface {

//     userId: string,
//     userName: string,
//     userProfile: string,
//     chips: number,
//     socketId: string,
//     tableId: string,
//     bootValue: number,
//     playerCount: number,
//     isBot: boolean

// }

export interface SignUpInterface {

    userId: string,
    userName: string,
    userProfile: string,
    chips: number,
    socketId: string,
    tableId: string,
    bootValue: number,
    playerCount: number,
    isBot: boolean

}

export interface UserInterface {

    userId: string,
    userName: string,
    userProfile: string,
    isBot: boolean,
    socketId: string,
    tableId: string,
    playerCount: number,

}

export interface WinZoSignUpInterface {

    winzoApiData: WinzoApiDataInterface

}

export interface WinzoApiDataInterface {

    tableId: string,
    playerCount: number,
    localPlayerData: WinZoLocalPlayerDataInterface,
    allOpponentsData: Array<WinZoLocalPlayerDataInterface>,
    configData: WinZoConfigDataInterface

}

export interface WinZoLocalPlayerDataInterface {

    playerName: string,
    playerId: string,
    playerProfilePic: string,
    isAI: boolean

}

export interface WinZoConfigDataInterface {

    USER_TURN_TIMER: number,
    TOTAL_ROUND_NUMBER: number,
    ROUND_TIMER: number,
    DISTRIBUTE_CARDS_LIMIT: number,
    TURN_TIMEOUT_COUNT: number,
    INITIAL_SCORE_POINT: number,
    UNO_PLAYER_BONUS_POINT: number,
    PLUS_ON_PLUS: boolean,
    ZERO_POINT: number,
    SKIP_POINT: number,
    REVERS_POINT: number,
    PLUS_TWO_POINT: number,
    PLUS_FOUR_POINT: number,
    COLOR_CHANGE_POINT: number,

} 
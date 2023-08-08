import { Round } from "./round";
import { TimesUp } from "./timesUp";
import { TurnInfo } from "./turnInfo";
import { UnoClick } from "./unoClick";
import { UserTurn } from "./userTurn";
import { BotCardThrow } from "./botCardThrow";
import { NextRound } from "./nextRound";
import { CollectBootValue } from "./collectBoot";
import { DisconnectUser } from "./disconnectUser";
import { PickCardDelay } from "./pickCardDelay";
import { RoundScoreDelay } from "./roundScoreDelay";
import { BotSignup } from "./botSignup";
import { BotTurn } from "./botTurn";
import { GameEnd } from "./gameEnd";
import { WinningDelay } from "./winningDelay";

const AddJob = {

    Round,
    TimesUp,
    BotTurn,
    GameEnd,
    UnoClick,
    TurnInfo,
    UserTurn,
    NextRound,
    BotSignup,
    WinningDelay,
    BotCardThrow,
    PickCardDelay,
    DisconnectUser,
    RoundScoreDelay,
    CollectBootValue,

};

export { AddJob };
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
import { GameEnd } from "./gameEnd";

const AddJob = {

    CollectBootValue,
    UserTurn,
    Round,
    NextRound,
    TurnInfo,
    DisconnectUser,
    UnoClick,
    TimesUp,
    BotCardThrow,
    PickCardDelay,
    RoundScoreDelay,
    GameEnd,

};

export { AddJob };
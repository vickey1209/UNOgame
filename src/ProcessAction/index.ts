import { CollectBootValueProcessAction } from "./collectBootValueProcessAction";
import { DisconnectUserProcessAction } from "./disconnectUserProcessAction";
import { GameEndProcessAction } from "./endGameProcessAction";
import { NextRoundProcessAction } from "./nextRoundProcessAction";
import { PickCardDelayProcessAction } from "./pickCardDelayProcessAction";
import { RoundProcessAction } from "./roundProcessAction";
import { RoundScoreDelayProcessAction } from "./roundScoreDelayProcessAction";
import { TimesUpProcessAction } from "./timesUpProcessAction";
import { TurnInfoProcessAction } from "./turnInfoProcessAction";
import { UnoClickProcessAction } from "./unoClickProcessAction";
import { UserTurnProcessAction } from "./userTurnProcessAction";

const PROCESS_ACTION = {

    RoundProcessAction,
    TimesUpProcessAction,
    GameEndProcessAction,
    UserTurnProcessAction,
    TurnInfoProcessAction,
    UnoClickProcessAction,
    NextRoundProcessAction,
    PickCardDelayProcessAction,
    DisconnectUserProcessAction,
    RoundScoreDelayProcessAction,
    CollectBootValueProcessAction,

};

export { PROCESS_ACTION };
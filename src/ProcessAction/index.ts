import { CollectBootValueProcessAction } from "./collectBootValueProcessAction";
import { DisconnectUserProcessAction } from "./disconnectUserProcessAction";
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
    UserTurnProcessAction,
    TurnInfoProcessAction,
    UnoClickProcessAction,
    NextRoundProcessAction,
    DisconnectUserProcessAction,
    CollectBootValueProcessAction,
    PickCardDelayProcessAction,
    RoundScoreDelayProcessAction,

};

export { PROCESS_ACTION };
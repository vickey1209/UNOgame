import { CollectBootValueProcessAction } from "./collectBootValueProcessAction";
import { DisconnectUserProcessAction } from "./disconnectUserProcessAction";
import { GameEndProcessAction } from "./endGameProcessAction";
import { NextRoundProcessAction } from "./nextRoundProcessAction";
import { PickCardDelayProcessAction } from "./pickCardDelayProcessAction";
import { RoundProcessAction } from "./roundProcessAction";
import { RoundScoreDelayProcessAction } from "./roundScoreDelayProcessAction";
import { TurnInfoProcessAction } from "./turnInfoProcessAction";
import { UnoClickProcessAction } from "./unoClickProcessAction";
import { UserTurnProcessAction } from "./userTurnProcessAction";
import { WinningDelayProcessAction } from "./winningDelayProcessAction";

const PROCESS_ACTION = {

    RoundProcessAction,
    GameEndProcessAction,
    UserTurnProcessAction,
    TurnInfoProcessAction,
    UnoClickProcessAction,
    NextRoundProcessAction,
    WinningDelayProcessAction,
    PickCardDelayProcessAction,
    DisconnectUserProcessAction,
    RoundScoreDelayProcessAction,
    CollectBootValueProcessAction,

};

export { PROCESS_ACTION };
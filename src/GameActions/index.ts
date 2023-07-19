import { DistributeCards } from './DistributeCards/distributeCards';
import { EndRound } from './EndRound/endRound';
import { IsShufflePossible } from './IsShufflePossible/isShufflePossible';
import { IsThrowPossible } from './IsThrowPossible/isThrowPossible';
import { PlusFour } from './PlusFour/plusFour';
import { PlusTwo } from './PlusTwo/plusTwo';
import { RandomNumber } from './RandomNumber/randomNumber'
import { RemainTimeCalculation } from './RemainTimeCalculation/remainTimeCalculation';
import { RemoveDisconnectedUsers } from './RemoveDisconnectedUsers/removeDisconnectedUsers';
import { ShuffleArray } from './ShuffleArray/shuffleArray';
import { Skip } from './Skip/skip';
import { ClockWiseTurnChange, AntiClockWiseTurnChange } from './TurnChange/turnChange';


const GAME_ACTIONS = {

    Skip,
    PlusTwo,
    PlusFour,
    EndRound,
    RandomNumber,
    ShuffleArray,
    IsThrowPossible,
    DistributeCards,
    IsShufflePossible,
    ClockWiseTurnChange,
    RemainTimeCalculation,
    RemoveDisconnectedUsers,
    AntiClockWiseTurnChange,

};

export { GAME_ACTIONS };
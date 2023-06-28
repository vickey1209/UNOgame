import { DistributeCards } from './DistributeCards/distributeCards';
import { EndRound } from './EndRound/endRound';
import { IsShufflePossible } from './IsShufflePossible/isShufflePossible';
import { PlusFour } from './PlusFour/plusFour';
import { PlusTwo } from './PlusTwo/plusTwo';
import { RandomNumber } from './RandomNumber/randomNumber'
import { RemainTimeCalculation } from './RemainTimeCalculation/remainTimeCalculation';
import { ShuffleArray } from './ShuffleArray/shuffleArray';
import { Skip } from './Skip/skip';
import { ClockWiseTurnChange, AntiClockWiseTurnChange } from './TurnChange/turnChange';

const GAME_ACTIONS = {

    RandomNumber,
    DistributeCards,
    ShuffleArray,
    ClockWiseTurnChange,
    AntiClockWiseTurnChange,
    RemainTimeCalculation,
    Skip,
    PlusTwo,
    PlusFour,
    EndRound,
    IsShufflePossible,
}

export { GAME_ACTIONS };
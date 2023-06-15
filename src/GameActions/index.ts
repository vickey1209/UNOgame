import { DistributeCards } from './DistributeCards/distributeCards';
import { RandomNumber } from './RandomNumber/randomNumber'
import { RemainTimeCalculation } from './RemainTimeCalculation/remainTimeCalculation';
import { ShuffleArray } from './ShuffleArray/shuffleArray';
import { ClockWiseTurnChange, AntiClockWiseTurnChange } from './TurnChange/turnChange';

const GAME_ACTIONS = {

    RandomNumber,
    DistributeCards,
    ShuffleArray,
    ClockWiseTurnChange,
    AntiClockWiseTurnChange,
    RemainTimeCalculation,

}

export { GAME_ACTIONS };
import playerTurnTimer from './playerTurnTimer.queue';
import roundTimerStart from './roundTimerStart.queue';
import bootCollectingStartTimer from "./bootCollectingStartTimer.queue";
import cardDealing from "./cardDealing.queue";
import nextTurnDelay from "./nextTurnDelay.queue";
import declarePlayerTurnTimer from "./declarePlayerTurnTimer.queue";
// import scoreBoardShow from "./scoreBoardShow.queue";
import rejoinTimer from "./rejoinTimer.queue";
import robotSeatInTableTimer from "./robotSeatInTableTimer.queue";
import lockTimerStart from "./lockTimerStart.queue";
import tossCardStart from "./tossCard.queue";
import waitingForPlayerTimerStart from "./waitingForPlayerTimerStart.queue";
import newGameStartTimer from "./newGameStartTimer.queue";
import scoreBoardTimer from "./scoreBoardTimer.queue";
import seconderyTimer from "./seconderyTimer.queue"

export = {
  playerTurnTimer,
  roundTimerStart,
  bootCollectingStartTimer,
  cardDealing,
  nextTurnDelay,
  declarePlayerTurnTimer,
  // scoreBoardShow,
  rejoinTimer,
  robotSeatInTableTimer,
  lockTimerStart,
  tossCardStart,
  waitingForPlayerTimerStart,
  newGameStartTimer,
  scoreBoardTimer,
  seconderyTimer,
};

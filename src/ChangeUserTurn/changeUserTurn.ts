import { BullTimer } from "../BullTimer";
import { CONSTANTS } from "../Constants";
import { GAME_ACTIONS } from "../GameActions";
import { GetTable, SetTable } from "../GameRedisOperations/gameRedisOperations";
import { TableInterface } from "../Interface/Table/TableInterface";
import { Logger } from "../Logger/logger";

const ChangeUserTurn = async (tableId: string, isThrow: boolean, isPick: boolean, remainingCardsNumber: number) => {

    try {

        Logger("ChangeUserTurn", JSON.stringify({ tableId }));

        let TableDetails: TableInterface = await GetTable(tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        let isSkip = false, skipSeatIndex = -1, isRevers = false, isGameEnd = false, unoSeatIndex = TableDetails.currentTurn, turnInfoDelay = isPick ? 0.7 : 0;

        if (TableDetails.activeCardType === CONSTANTS.UNO_CARDS.CARDS_TYPE.REVERS && isThrow) { // ^ Revers Card !

            TableDetails.isClockwise = TableDetails.isClockwise ? false : true;
            isRevers = true;

        };

        if (isPick && TableDetails.numberOfCardToPick !== 0) {

            turnInfoDelay += (TableDetails.numberOfCardToPick * 0.7);

            isSkip = true, skipSeatIndex = TableDetails.currentTurn;

            TableDetails.numberOfCardToPick = 0;

        };

        if (TableDetails.activeCardType === CONSTANTS.UNO_CARDS.CARDS_TYPE.PLUS_FOUR && isThrow) { // ^ +4 Wild Card !

            const PlusFourData = await GAME_ACTIONS.PlusFour(TableDetails.tableId);

            if (!PlusFourData) { throw new Error(CONSTANTS.ERROR_MESSAGES.PLUS_4_ERROR) };

            // turnInfoDelay += (TableDetails.numberOfCardToPick * 0.9);

            turnInfoDelay += 4;

            turnInfoDelay += (PlusFourData.pickCards.length * 0.7);

            // if (PlusFourData.penaltyNumber === 0) { turnInfoDelay += (TableDetails.numberOfCardToPick * 0.7); };
            // else { }

            TableDetails.currentTurn = PlusFourData.nextTurnSeatIndex;
            TableDetails.numberOfCardToPick = PlusFourData.penaltyNumber;

            PlusFourData.pickCards.forEach(element => { TableDetails.closeCardDeck.splice(TableDetails.closeCardDeck.indexOf(element), 1); });

            if (!PlusFourData.isPenaltyFreeCard) { isSkip = PlusFourData.isSkip, skipSeatIndex = PlusFourData.skipSeatIndex };

        } else if (TableDetails.activeCardType === CONSTANTS.UNO_CARDS.CARDS_TYPE.PLUS_TWO && isThrow) { // ^ +2 Card !

            const PlusTwoData = await GAME_ACTIONS.PlusTwo(TableDetails.tableId);

            if (!PlusTwoData) { throw new Error(CONSTANTS.ERROR_MESSAGES.PLUS_2_ERROR) };

            // turnInfoDelay += (TableDetails.numberOfCardToPick * 0.9);

            turnInfoDelay += 1.30;

            turnInfoDelay += (PlusTwoData.pickCards.length * 0.7);

            // if (PlusTwoData.penaltyNumber === 0) { turnInfoDelay += (TableDetails.numberOfCardToPick * 0.7); };

            TableDetails.currentTurn = PlusTwoData.nextTurnSeatIndex;
            TableDetails.numberOfCardToPick = PlusTwoData.penaltyNumber;

            PlusTwoData.pickCards.forEach(element => { TableDetails.closeCardDeck.splice(TableDetails.closeCardDeck.indexOf(element), 1); });

            if (!PlusTwoData.isPenaltyFreeCard) { isSkip = PlusTwoData.isSkip, skipSeatIndex = PlusTwoData.skipSeatIndex };

        } else if (TableDetails.activeCardType === CONSTANTS.UNO_CARDS.CARDS_TYPE.SKIP && isThrow) { // ^ Skip Card !

            const SkipData = await GAME_ACTIONS.Skip(TableDetails.tableId);

            if (!SkipData) { throw new Error(CONSTANTS.ERROR_MESSAGES.SKIP_ERROR) };

            TableDetails.currentTurn = SkipData.nextTurnSeatIndex;

            isSkip = SkipData.isSkip;
            skipSeatIndex = SkipData.skipSeatIndex;

        } else if (TableDetails.activeCardType === CONSTANTS.UNO_CARDS.CARDS_TYPE.REVERS && isThrow) { // ^ Revers Card !

            const PlayersAvailableInTable = TableDetails.playersArray.filter(player => { return player.isLeave === false });

            if (PlayersAvailableInTable.length > 2) {

                if (TableDetails.isClockwise) {

                    const NextTurn = await GAME_ACTIONS.ClockWiseTurnChange(TableDetails);

                    if (!NextTurn && NextTurn !== 0) { throw new Error(CONSTANTS.ERROR_MESSAGES.TURN_CHANGE_ERROR) };

                    TableDetails.currentTurn = NextTurn;

                } else {

                    const NextTurn = await GAME_ACTIONS.AntiClockWiseTurnChange(TableDetails);

                    if (!NextTurn && NextTurn !== 0) { throw new Error(CONSTANTS.ERROR_MESSAGES.TURN_CHANGE_ERROR) };

                    TableDetails.currentTurn = NextTurn;
                };

            };

        } else { // ^ Normal Cards

            if (TableDetails.isClockwise) {

                const NextTurn = await GAME_ACTIONS.ClockWiseTurnChange(TableDetails);

                if (!NextTurn && NextTurn !== 0) { throw new Error(CONSTANTS.ERROR_MESSAGES.TURN_CHANGE_ERROR) };

                TableDetails.currentTurn = NextTurn;

            } else {

                const NextTurn = await GAME_ACTIONS.AntiClockWiseTurnChange(TableDetails);

                if (!NextTurn && NextTurn !== 0) { throw new Error(CONSTANTS.ERROR_MESSAGES.TURN_CHANGE_ERROR) };

                TableDetails.currentTurn = NextTurn;
            };
        };

        if (TableDetails.closeCardDeck.length < 1) {

            const IsShufflePossibleData = await GAME_ACTIONS.IsShufflePossible(TableDetails.tableId);

            if (!IsShufflePossibleData) { throw new Error(CONSTANTS.ERROR_MESSAGES.CLOSE_DECK_FILL_ERROR) }

            if (IsShufflePossibleData.isShuffle) {

                TableDetails.closeCardDeck = IsShufflePossibleData.cardsForCloseDeckArray;
                TableDetails.openCardDeck = IsShufflePossibleData.cardsForOpenDeckArray;

            } else {

                isGameEnd = true;

            };
        };

        TableDetails.isTurnLock = true;

        await SetTable(TableDetails.tableId, TableDetails);

        if (isGameEnd) { // ^ End Game Immediately

            await GAME_ACTIONS.EndRound(tableId, false);

            console.log('End Game Immediately !!!');
            console.log('End Game Immediately !!!');
            console.log('End Game Immediately !!!');
            console.log('End Game Immediately !!!');
            console.log('End Game Immediately !!!');
            console.log('End Game Immediately !!!');

        } else {

            if (isThrow && remainingCardsNumber === 1) { // ^ UNO Bull

                await BullTimer.AddJob.UnoClick(TableDetails.tableId, isSkip, skipSeatIndex, isRevers, turnInfoDelay, unoSeatIndex);

            } else { // ^ Turn Bull

                await BullTimer.AddJob.TurnInfo(TableDetails.tableId, isSkip, skipSeatIndex, isRevers, turnInfoDelay);

            };

        };

    } catch (error: any) {
        Logger('ChangeUserTurn Error : ', error);
    };
};

export { ChangeUserTurn };
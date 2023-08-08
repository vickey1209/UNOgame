import { BullTimer } from "../BullTimer";
import { Config } from "../Config";
import { CONSTANTS } from "../Constants";
import { GAME_ACTIONS } from "../GameActions";
import { GetTable, SetTable } from "../GameRedisOperations/gameRedisOperations";
import { TableInterface } from "../Interface/Table/TableInterface";
import { ErrorLogger, Logger } from "../Logger/logger";

const ChangeUserTurn = async (tableId: string, isThrow: boolean, isPick: boolean, remainingCardsNumber: number) => {

    try {

        await Logger("ChangeUserTurn", JSON.stringify({ tableId }));

        const CONFIG = Config();

        let TableDetails: TableInterface = await GetTable(tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        let isSkip = false, skipSeatIndex = -1, isRevers = false, isGameEnd = false, unoSeatIndex = TableDetails.currentTurn, turnInfoDelay = 0;

        if (remainingCardsNumber < 1 && isThrow) {

            // if (TableDetails.activeCardType === CONSTANTS.UNO_CARDS.CARDS_TYPE.PLUS_TWO) { turnInfoDelay = CONFIG.GamePlay.DELAY_FOR_PLUS_TWO };
            // if (TableDetails.activeCardType === CONSTANTS.UNO_CARDS.CARDS_TYPE.PLUS_FOUR) { turnInfoDelay = CONFIG.GamePlay.DELAY_FOR_PLUS_FOUR };
            // if (TableDetails.activeCardType === CONSTANTS.UNO_CARDS.CARDS_TYPE.COLOR_CHANGE) { turnInfoDelay = CONFIG.GamePlay.DELAY_FOR_COLOR_CHANGE };

            if (TableDetails.activeCardType === CONSTANTS.UNO_CARDS.CARDS_TYPE.PLUS_TWO) { turnInfoDelay = CONFIG.GamePlay.DELAY_FOR_PLUS_TWO; }
            else if (TableDetails.activeCardType === CONSTANTS.UNO_CARDS.CARDS_TYPE.PLUS_FOUR) { turnInfoDelay = CONFIG.GamePlay.DELAY_FOR_PLUS_FOUR; }
            else if (TableDetails.activeCardType === CONSTANTS.UNO_CARDS.CARDS_TYPE.COLOR_CHANGE) { turnInfoDelay = CONFIG.GamePlay.DELAY_FOR_COLOR_CHANGE; }
            else if (TableDetails.activeCardType === CONSTANTS.UNO_CARDS.CARDS_TYPE.REVERS) { turnInfoDelay = CONFIG.GamePlay.DELAY_FOR_REVERS; }
            else { turnInfoDelay = CONFIG.GamePlay.DELAY_FOR_REVERS; };
            // else { turnInfoDelay = CONFIG.GamePlay.DELAY_FOR_SINGLE_PICK; };

            await BullTimer.AddJob.TurnInfo(TableDetails.tableId, isSkip, skipSeatIndex, isRevers, 0.1);

            await GAME_ACTIONS.EndRound(tableId, false, turnInfoDelay);

            return;

        };

        if (TableDetails.activeCardType === CONSTANTS.UNO_CARDS.CARDS_TYPE.REVERS && isThrow) { // ^ Revers Card !

            turnInfoDelay += CONFIG.GamePlay.DELAY_FOR_REVERS;

            TableDetails.isClockwise = TableDetails.isClockwise ? false : true;
            isRevers = true;

        };

        if (isPick && TableDetails.numberOfCardToPick !== 0) {

            turnInfoDelay += (TableDetails.numberOfCardToPick * CONFIG.GamePlay.DELAY_FOR_SINGLE_PICK);

            isSkip = true, skipSeatIndex = TableDetails.currentTurn;

            TableDetails.numberOfCardToPick = 0;

        };

        if (TableDetails.activeCardType === CONSTANTS.UNO_CARDS.CARDS_TYPE.PLUS_FOUR && isThrow) { // ^ +4 Wild Card !

            const PlusFourData = await GAME_ACTIONS.PlusFour(TableDetails.tableId);

            if (!PlusFourData) { throw new Error(CONSTANTS.ERROR_MESSAGES.PLUS_4_ERROR) };

            turnInfoDelay += CONFIG.GamePlay.DELAY_FOR_PLUS_FOUR;

            turnInfoDelay += (PlusFourData.pickCards.length * CONFIG.GamePlay.DELAY_FOR_SINGLE_PICK);

            TableDetails.currentTurn = PlusFourData.nextTurnSeatIndex;
            TableDetails.numberOfCardToPick = PlusFourData.penaltyNumber;

            PlusFourData.pickCards.forEach(element => { TableDetails.closeCardDeck.splice(TableDetails.closeCardDeck.indexOf(element), 1); });

            if (!PlusFourData.isPenaltyFreeCard) { isSkip = PlusFourData.isSkip, skipSeatIndex = PlusFourData.skipSeatIndex };

        } else if (TableDetails.activeCardType === CONSTANTS.UNO_CARDS.CARDS_TYPE.PLUS_TWO && isThrow) { // ^ +2 Card !

            const PlusTwoData = await GAME_ACTIONS.PlusTwo(TableDetails.tableId);

            if (!PlusTwoData) { throw new Error(CONSTANTS.ERROR_MESSAGES.PLUS_2_ERROR) };

            turnInfoDelay += CONFIG.GamePlay.DELAY_FOR_PLUS_TWO;

            turnInfoDelay += (PlusTwoData.pickCards.length * CONFIG.GamePlay.DELAY_FOR_SINGLE_PICK);

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

                    if (NextTurn === undefined) { throw new Error(CONSTANTS.ERROR_MESSAGES.TURN_CHANGE_ERROR) };
                    // if (!NextTurn && NextTurn !== 0) { throw new Error(CONSTANTS.ERROR_MESSAGES.TURN_CHANGE_ERROR) };

                    TableDetails.currentTurn = NextTurn;

                } else {

                    const NextTurn = await GAME_ACTIONS.AntiClockWiseTurnChange(TableDetails);

                    if (NextTurn === undefined) { throw new Error(CONSTANTS.ERROR_MESSAGES.TURN_CHANGE_ERROR) };
                    // if (!NextTurn && NextTurn !== 0) { throw new Error(CONSTANTS.ERROR_MESSAGES.TURN_CHANGE_ERROR) };

                    TableDetails.currentTurn = NextTurn;
                };

            };

        } else { // ^ Normal Cards

            if (isThrow) { turnInfoDelay = CONFIG.GamePlay.DELAY_FOR_SINGLE_PICK };

            if (TableDetails.isClockwise) {

                const NextTurn = await GAME_ACTIONS.ClockWiseTurnChange(TableDetails);

                if (NextTurn === undefined) { throw new Error(CONSTANTS.ERROR_MESSAGES.TURN_CHANGE_ERROR) };
                // if (!NextTurn && NextTurn !== 0) { throw new Error(CONSTANTS.ERROR_MESSAGES.TURN_CHANGE_ERROR) };

                TableDetails.currentTurn = NextTurn;

            } else {

                const NextTurn = await GAME_ACTIONS.AntiClockWiseTurnChange(TableDetails);

                if (NextTurn === undefined) { throw new Error(CONSTANTS.ERROR_MESSAGES.TURN_CHANGE_ERROR) };
                // if (!NextTurn && NextTurn !== 0) { throw new Error(CONSTANTS.ERROR_MESSAGES.TURN_CHANGE_ERROR) };

                TableDetails.currentTurn = NextTurn;
            };
        };

        if (TableDetails.closeCardDeck.length < 1 || TableDetails.closeCardDeck.length < TableDetails.numberOfCardToPick) {

            const IsShufflePossibleData = await GAME_ACTIONS.IsShufflePossible(TableDetails.tableId);

            if (!IsShufflePossibleData) { throw new Error(CONSTANTS.ERROR_MESSAGES.CLOSE_DECK_FILL_ERROR) }

            if (IsShufflePossibleData.isShuffle) {

                TableDetails.closeCardDeck = IsShufflePossibleData.cardsForCloseDeckArray;
                TableDetails.openCardDeck = IsShufflePossibleData.cardsForOpenDeckArray;

            } else {

                isGameEnd = true;

            };
        };

        if (isPick && turnInfoDelay === 0) { turnInfoDelay = CONFIG.GamePlay.DELAY_FOR_SINGLE_PICK };

        if (TableDetails.activeCardType === CONSTANTS.UNO_CARDS.CARDS_TYPE.COLOR_CHANGE && isThrow) { turnInfoDelay = CONFIG.GamePlay.DELAY_FOR_COLOR_CHANGE };

        TableDetails.isTurnLock = true;

        // await SetTable(TableDetails.tableId, TableDetails);

        if (isGameEnd) { // ^ End Game Immediately

            await SetTable(TableDetails.tableId, TableDetails);

            await GAME_ACTIONS.EndRound(tableId, false, turnInfoDelay);

        } else {

            if (isThrow && remainingCardsNumber === 1) { // ^ UNO Bull

                // turnInfoDelay += CONFIG.GamePlay.DELAU_FOR_UNO;

                const nextTurn = TableDetails.currentTurn;

                TableDetails.currentTurn = unoSeatIndex;

                await SetTable(TableDetails.tableId, TableDetails);

                await BullTimer.AddJob.UnoClick(TableDetails.tableId, isSkip, skipSeatIndex, isRevers, turnInfoDelay, unoSeatIndex, nextTurn);

            } else { // ^ Turn Bull

                await SetTable(TableDetails.tableId, TableDetails);

                await BullTimer.AddJob.TurnInfo(TableDetails.tableId, isSkip, skipSeatIndex, isRevers, turnInfoDelay);

            };

        };

    } catch (error: any) {
        await ErrorLogger('ChangeUserTurn Error : ', error);
    };
};

export { ChangeUserTurn };
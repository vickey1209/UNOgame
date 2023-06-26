import { AllUserScore } from "../AllUserScore/allUserScore";
import { BullTimer } from "../BullTimer";
import { Config } from "../Config";
import { EventEmitter } from "../Connection/emitter";
import { CONSTANTS } from "../Constants";
import { GAME_ACTIONS } from "../GameActions";
import { GetTable, SetTable } from "../GameRedisOperations/gameRedisOperations";
import { TableInterface } from "../Interface/Table/TableInterface";
import { TurnInfoResInterface } from "../Interface/TurnInfoRes/TurnInfoResInterface";
import { Logger } from "../Logger/logger";
import { PROCESS_ACTION } from "../ProcessAction";

const ChangeUserTurn = async (tableId: string, isThrow: boolean) => {

    try {

        Logger("ChangeUserTurn", JSON.stringify({ tableId }));

        const CONFIG = Config();

        const { TURN_INFO } = CONSTANTS.EVENTS_NAME;

        let TableDetails: TableInterface = await GetTable(tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        let isSkip = false, skipSeatIndex = -1, isGameEnd = false;

        if (TableDetails.activeCardType === CONSTANTS.UNO_CARDS.CARDS_TYPE.REVERS && isThrow) { // ^ Revers Card !

            TableDetails.isClockwise = TableDetails.isClockwise ? false : true;

        };

        if (TableDetails.activeCardType === CONSTANTS.UNO_CARDS.CARDS_TYPE.PLUS_FOUR && isThrow) { // ^ +4 Wild Card !

            const PlusFourData = await GAME_ACTIONS.PlusFour(TableDetails.tableId);

            if (!PlusFourData) { throw new Error(CONSTANTS.ERROR_MESSAGES.PLUS_4_ERROR) };

            TableDetails.currentTurn = PlusFourData.nextTurnSeatIndex;
            TableDetails.numberOfCardToPick = PlusFourData.penaltyNumber;

            PlusFourData.pickCards.forEach(element => { TableDetails.closeCardDeck.splice(TableDetails.closeCardDeck.indexOf(element), 1); });

        } else if (TableDetails.activeCardType === CONSTANTS.UNO_CARDS.CARDS_TYPE.PLUS_TWO && isThrow) { // ^ +2 Card !

            const PlusTwoData = await GAME_ACTIONS.PlusTwo(TableDetails.tableId);

            if (!PlusTwoData) { throw new Error(CONSTANTS.ERROR_MESSAGES.PLUS_2_ERROR) };

            TableDetails.currentTurn = PlusTwoData.nextTurnSeatIndex;
            TableDetails.numberOfCardToPick = PlusTwoData.penaltyNumber;

            PlusTwoData.pickCards.forEach(element => { TableDetails.closeCardDeck.splice(TableDetails.closeCardDeck.indexOf(element), 1); });

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

                    let NextTurn = await GAME_ACTIONS.ClockWiseTurnChange(TableDetails);

                    if (!NextTurn && NextTurn !== 0) { throw new Error(CONSTANTS.ERROR_MESSAGES.TURN_CHANGE_ERROR) };

                    TableDetails.currentTurn = NextTurn;

                } else {

                    let NextTurn = await GAME_ACTIONS.AntiClockWiseTurnChange(TableDetails);

                    if (!NextTurn && NextTurn !== 0) { throw new Error(CONSTANTS.ERROR_MESSAGES.TURN_CHANGE_ERROR) };

                    TableDetails.currentTurn = NextTurn;
                };

            };

        } else { // ^ Normal Cards

            if (TableDetails.isClockwise) {

                let NextTurn = await GAME_ACTIONS.ClockWiseTurnChange(TableDetails);

                if (!NextTurn && NextTurn !== 0) { throw new Error(CONSTANTS.ERROR_MESSAGES.TURN_CHANGE_ERROR) };

                TableDetails.currentTurn = NextTurn;

            } else {

                let NextTurn = await GAME_ACTIONS.AntiClockWiseTurnChange(TableDetails);

                if (!NextTurn && NextTurn !== 0) { throw new Error(CONSTANTS.ERROR_MESSAGES.TURN_CHANGE_ERROR) };

                TableDetails.currentTurn = NextTurn;
            };
        };

        if (TableDetails.closeCardDeck.length < 1) {

            const IsShufflePossibleData = await IsShufflePossible(TableDetails.tableId);

            console.log({ IsShufflePossibleData });

            if (!IsShufflePossibleData) { throw new Error(CONSTANTS.ERROR_MESSAGES.CLOSE_DECK_FILL_ERROR) }

            if (IsShufflePossibleData.isShuffle) {

                TableDetails.closeCardDeck = IsShufflePossibleData.cardsForCloseDeckArray;
                TableDetails.openCardDeck = IsShufflePossibleData.cardsForOpenDeckArray;

            } else {

                isGameEnd = true;

            };
        };

        await SetTable(TableDetails.tableId, TableDetails);

        if (isGameEnd) { // ^ End Game Immediately

            await PROCESS_ACTION.RoundProcessAction(TableDetails);

            console.log('End Game Immediately !!!');
            console.log('End Game Immediately !!!');
            console.log('End Game Immediately !!!');
            console.log('End Game Immediately !!!');
            console.log('End Game Immediately !!!');
            console.log('End Game Immediately !!!');

        } else {

            await BullTimer.AddJob.UserTurn(TableDetails.tableId);

            const ResData: TurnInfoResInterface = {

                currentTurn: TableDetails.currentTurn,
                activeCard: TableDetails.activeCard,
                activeCardType: TableDetails.activeCardType,
                activeCardColor: TableDetails.activeCardColor,

                isSkip,
                skipSeatIndex,

                totalTime: CONFIG.GamePlay.USER_TURN_TIMER,
                remainingTime: CONFIG.GamePlay.USER_TURN_TIMER
            };

            EventEmitter.emit(TURN_INFO, { en: TURN_INFO, RoomId: TableDetails.tableId, Data: ResData });

            await AllUserScore(TableDetails.tableId);

        };

        // await BullTimer.AddJob.UserTurn(TableDetails.tableId);

        // const ResData: TurnInfoResInterface = {

        //     currentTurn: TableDetails.currentTurn,
        //     activeCard: TableDetails.activeCard,
        //     activeCardType: TableDetails.activeCardType,
        //     activeCardColor: TableDetails.activeCardColor,

        //     isSkip,
        //     skipSeatIndex,

        //     totalTime: CONFIG.GamePlay.USER_TURN_TIMER,
        //     remainingTime: CONFIG.GamePlay.USER_TURN_TIMER
        // }

        // EventEmitter.emit(TURN_INFO, { en: TURN_INFO, RoomId: TableDetails.tableId, Data: ResData });

        // await AllUserScore(TableDetails.tableId);

    } catch (error: any) {
        Logger('ChangeUserTurn Error : ', error);
    }
};

const IsShufflePossible = async (tableId: string) => {

    try {

        Logger("IsShufflePossible", JSON.stringify({ tableId }));

        let TableDetails: TableInterface = await GetTable(tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        let isShuffle = true;

        let cardsForCloseDeckArray = TableDetails.openCardDeck.splice(0, TableDetails.openCardDeck.length - 1);

        if (cardsForCloseDeckArray.length < 1) {

            isShuffle = false;

        } else {

            cardsForCloseDeckArray = await GAME_ACTIONS.ShuffleArray(cardsForCloseDeckArray);

        };

        return { isShuffle, cardsForCloseDeckArray, cardsForOpenDeckArray: TableDetails.openCardDeck };

    } catch (error: any) {
        Logger('IsShufflePossible Error : ', error);
    };
}

export { ChangeUserTurn };
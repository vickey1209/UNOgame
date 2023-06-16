import { BullTimer } from "../BullTimer";
import { Config } from "../Config";
import { EventEmitter } from "../Connection/emitter";
import { CONSTANTS } from "../Constants";
import { GAME_ACTIONS } from "../GameActions";
import { GetTable, SetTable } from "../GameRedisOperations/gameRedisOperations";
import { TableInterface } from "../Interface/Table/TableInterface";
import { Logger } from "../Logger/logger";

const ChangeUserTurn = async (tableId: string, isThrow: boolean) => {

    try {

        Logger("ChangeUserTurn", JSON.stringify({ tableId }));

        const CONFIG = Config();

        const { TURN_INFO, PICK_CARD } = CONSTANTS.EVENTS_NAME;

        let TableDetails: TableInterface = await GetTable(tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        let isSkip = false, skipSeatIndex = -1, manuallSkip = false;

        if (TableDetails.activeCardType === CONSTANTS.UNO_CARDS.CARDS_TYPE.REVERS && isThrow) {

            TableDetails.isClockwise = TableDetails.isClockwise ? false : true;

        }

        if (TableDetails.activeCardType === CONSTANTS.UNO_CARDS.CARDS_TYPE.SKIP && isThrow) {

            const SkipData = await GAME_ACTIONS.Skip(TableDetails.tableId);

            if (!SkipData) { throw new Error(CONSTANTS.ERROR_MESSAGES.SKIP_ERROR) };

            TableDetails.currentTurn = SkipData.nextTurnSeatIndex;

            isSkip = SkipData.isSkip
            skipSeatIndex = SkipData.skipSeatIndex

        } else if (TableDetails.activeCardType === CONSTANTS.UNO_CARDS.CARDS_TYPE.PLUS_TWO && isThrow) {

            const PlusTwoData = await GAME_ACTIONS.PlusTwo(TableDetails.tableId);

            if (!PlusTwoData) { throw new Error(CONSTANTS.ERROR_MESSAGES.SKIP_ERROR) };

            TableDetails.currentTurn = PlusTwoData.nextTurnSeatIndex;
            TableDetails.numberOfCardToPick = PlusTwoData.penaltyNumber;

            PlusTwoData.pickCards.forEach(element => { TableDetails.closeCardDeck.splice(TableDetails.closeCardDeck.indexOf(element), 1); });

        } else {

            if (TableDetails.isClockwise) {

                let NextTurn = await GAME_ACTIONS.ClockWiseTurnChange(TableDetails);

                if (!NextTurn && NextTurn !== 0) { throw new Error(CONSTANTS.ERROR_MESSAGES.TURN_CHANGE_ERROR) };

                TableDetails.currentTurn = NextTurn;

            } else {

                let NextTurn = await GAME_ACTIONS.AntiClockWiseTurnChange(TableDetails);

                if (!NextTurn && NextTurn !== 0) { throw new Error(CONSTANTS.ERROR_MESSAGES.TURN_CHANGE_ERROR) };

                TableDetails.currentTurn = NextTurn;
            }
        }

        await SetTable(TableDetails.tableId, TableDetails);

        await BullTimer.AddJob.UserTurn(TableDetails.tableId);

        const ResData = {

            currentTurn: TableDetails.currentTurn,
            activeCard: TableDetails.activeCard,
            activeCardType: TableDetails.activeCardType,
            activeCardColor: TableDetails.activeCardColor,

            isSkip,
            skipSeatIndex,

            totalTime: CONFIG.GamePlay.USER_TURN_TIMER,
            remainingTime: CONFIG.GamePlay.USER_TURN_TIMER
        }

        EventEmitter.emit(TURN_INFO, { en: TURN_INFO, RoomId: TableDetails.tableId, Data: ResData });

    } catch (error: any) {
        Logger('ChangeUserTurn Error : ', error);
    }
};

export { ChangeUserTurn };
import { GAME_ACTIONS } from "..";
import { BullTimer } from "../../BullTimer";
import { Config } from "../../Config";
import { EventEmitter } from "../../Connection/emitter";
import { CONSTANTS } from "../../Constants";
import { GetTable, GetTableConfig, GetUserInTable, SetUserInTable } from "../../GameRedisOperations/gameRedisOperations";
import { PickCardResInterface } from "../../Interface/PickCardRes/PickCardResInterface";
import { ErrorLogger, Logger } from "../../Logger/logger";

const PlusFour = async (tableId: string) => {

    try {

        await Logger("PlusFour", JSON.stringify({ tableId }));

        const CONFIG = Config();

        const TableConfigDetails = await GetTableConfig(tableId);

        if (!TableConfigDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_CONFIG_NOT_FOUND) };

        let isPenaltyFreeCard = false, penaltyNumber = 0;

        let TableDetails = await GetTable(tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        let pickCards: Array<string> = [], penaltySeatIndex = -1, forLimit = (TableDetails.numberOfCardToPick + CONFIG.GamePlay.PLUS_FOUR_PENALTY_NUMBER);

        if (TableDetails.isClockwise) {

            let NextTurn = await GAME_ACTIONS.ClockWiseTurnChange(TableDetails);

            if (NextTurn === undefined) { throw new Error(CONSTANTS.ERROR_MESSAGES.TURN_CHANGE_ERROR) };
            // if (!NextTurn && NextTurn !== 0) { throw new Error(CONSTANTS.ERROR_MESSAGES.TURN_CHANGE_ERROR) };

            penaltySeatIndex = NextTurn;

        } else {

            let NextTurn = await GAME_ACTIONS.AntiClockWiseTurnChange(TableDetails);

            if (NextTurn === undefined) { throw new Error(CONSTANTS.ERROR_MESSAGES.TURN_CHANGE_ERROR) };
            // if (!NextTurn && NextTurn !== 0) { throw new Error(CONSTANTS.ERROR_MESSAGES.TURN_CHANGE_ERROR) };

            penaltySeatIndex = NextTurn;

        };

        const PenaltyUser = TableDetails.playersArray.find(e => { return e.seatIndex === penaltySeatIndex });

        if (!PenaltyUser) { throw new Error(CONSTANTS.ERROR_MESSAGES.ARRAY_FIND_ERROR) };

        let UserInTableDetails = await GetUserInTable(TableDetails.tableId, PenaltyUser?.userId);

        if (!UserInTableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_IN_TABLE_NOT_FOUND) };

        for (let i = 0; i < UserInTableDetails.cardArray.length; i++) {

            if (TableDetails.activeCardType === UserInTableDetails.cardArray[i].split("-")[1]) {

                isPenaltyFreeCard = true;
                break;
            }
        };

        if (isPenaltyFreeCard && TableConfigDetails?.PLUS_ON_PLUS) {

            let SkipData = await GAME_ACTIONS.Skip(TableDetails.tableId);

            if (!SkipData) { throw new Error(CONSTANTS.ERROR_MESSAGES.SKIP_ERROR) };

            penaltyNumber = (TableDetails.numberOfCardToPick + CONFIG.GamePlay.PLUS_FOUR_PENALTY_NUMBER);

            SkipData = { ...SkipData, nextTurnSeatIndex: SkipData.skipSeatIndex };

            await Logger("PlusFour Return", JSON.stringify({ ...SkipData, pickCards, isPenaltyFreeCard, penaltyNumber }));

            return { ...SkipData, pickCards, isPenaltyFreeCard, penaltyNumber };

        } else {

            isPenaltyFreeCard = false;

            if (forLimit === 0) { forLimit = CONFIG.GamePlay.PLUS_FOUR_PENALTY_NUMBER };

            for (let i = 0; i < forLimit; i++) {

                if (TableDetails.closeCardDeck.length) {

                    // UserInTableDetails.cardArray.push(TableDetails.closeCardDeck[0]);

                    pickCards.push(TableDetails.closeCardDeck[0]);

                    TableDetails.closeCardDeck.splice(0, 1);
                };
            };

            UserInTableDetails.isUnoClick = false;

            await SetUserInTable(TableDetails.tableId, UserInTableDetails.userId, UserInTableDetails);

            const PickCardResData: PickCardResInterface = {

                userId: UserInTableDetails.userId,
                tableId: UserInTableDetails.tableId,
                seatIndex: UserInTableDetails.seatIndex,
                pickCards,
                isPlayableCard: false

            };

            await BullTimer.AddJob.PickCardDelay(TableDetails.tableId, CONFIG.GamePlay.DELAY_FOR_PLUS_FOUR, PickCardResData);

            let SkipData = await GAME_ACTIONS.Skip(TableDetails.tableId);

            if (!SkipData) { throw new Error(CONSTANTS.ERROR_MESSAGES.SKIP_ERROR) };

            await Logger("PlusFour Return", JSON.stringify({ ...SkipData, pickCards, isPenaltyFreeCard, penaltyNumber }));

            return { ...SkipData, pickCards, isPenaltyFreeCard, penaltyNumber };

        };

    } catch (error: any) {
        await ErrorLogger('PlusFour Error : ', error);
    };
};

export { PlusFour };
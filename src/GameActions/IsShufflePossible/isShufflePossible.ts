import { GAME_ACTIONS } from "..";
import { CONSTANTS } from "../../Constants";
import { GetTable } from "../../GameRedisOperations/gameRedisOperations";
import { ErrorLogger, Logger } from "../../Logger/logger";

const IsShufflePossible = async (tableId: string) => {

    try {

        await Logger("IsShufflePossible", JSON.stringify({ tableId }));

        let TableDetails = await GetTable(tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        let isShuffle = true;

        let cardsForCloseDeckArray = TableDetails.openCardDeck.splice(0, TableDetails.openCardDeck.length - 1);

        if (cardsForCloseDeckArray.length < 1) { isShuffle = false; }
        else { cardsForCloseDeckArray = await GAME_ACTIONS.ShuffleArray(cardsForCloseDeckArray); };

        await Logger("IsShufflePossible Return", JSON.stringify({ isShuffle, cardsForCloseDeckArray, cardsForOpenDeckArray: TableDetails.openCardDeck }));

        return { isShuffle, cardsForCloseDeckArray, cardsForOpenDeckArray: TableDetails.openCardDeck };

    } catch (error: any) {
        await ErrorLogger('IsShufflePossible Error : ', error);
    };
};

export { IsShufflePossible };
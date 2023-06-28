import { GAME_ACTIONS } from "..";
import { CONSTANTS } from "../../Constants";
import { GetTable } from "../../GameRedisOperations/gameRedisOperations";
import { TableInterface } from "../../Interface/Table/TableInterface";
import { Logger } from "../../Logger/logger";

const Skip = async (tableId: string) => {

    try {

        Logger("Skip", JSON.stringify({ tableId }));

        let isSkip = false, skipSeatIndex = -1, nextTurnSeatIndex = -1;

        let TableDetails: TableInterface = await GetTable(tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        if (TableDetails.isClockwise) {

            let NextTurn = await GAME_ACTIONS.ClockWiseTurnChange(TableDetails);

            if (!NextTurn && NextTurn !== 0) { throw new Error(CONSTANTS.ERROR_MESSAGES.TURN_CHANGE_ERROR) };

            TableDetails.currentTurn = NextTurn;

            skipSeatIndex = NextTurn;

            NextTurn = await GAME_ACTIONS.ClockWiseTurnChange(TableDetails);

            if (!NextTurn && NextTurn !== 0) { throw new Error(CONSTANTS.ERROR_MESSAGES.TURN_CHANGE_ERROR) };

            TableDetails.currentTurn = NextTurn;

            isSkip = true;
            nextTurnSeatIndex = NextTurn;

        } else {

            let NextTurn = await GAME_ACTIONS.AntiClockWiseTurnChange(TableDetails);

            if (!NextTurn && NextTurn !== 0) { throw new Error(CONSTANTS.ERROR_MESSAGES.TURN_CHANGE_ERROR) };

            TableDetails.currentTurn = NextTurn;

            skipSeatIndex = NextTurn;

            NextTurn = await GAME_ACTIONS.AntiClockWiseTurnChange(TableDetails);

            if (!NextTurn && NextTurn !== 0) { throw new Error(CONSTANTS.ERROR_MESSAGES.TURN_CHANGE_ERROR) };

            TableDetails.currentTurn = NextTurn;

            isSkip = true;
            nextTurnSeatIndex = NextTurn;

        };

        return { isSkip, skipSeatIndex, nextTurnSeatIndex };

    } catch (error: any) {
        Logger('Skip Error : ', error);
    };
};

export { Skip };
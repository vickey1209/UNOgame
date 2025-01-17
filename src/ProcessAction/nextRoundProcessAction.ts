import { ApplyLock, RemoveLock } from "../Connection/redlock";
import { CONSTANTS } from "../Constants";
import { GAME_ACTIONS } from "../GameActions";
import { GetTable, GetUserInTable, SetTable, SetUserInTable } from "../GameRedisOperations/gameRedisOperations";
import { ErrorLogger, Logger } from "../Logger/logger";

const NextRoundProcessAction = async (Data: any) => {

    const Path = 'NextRoundProcessAction';

    const { LOCK, TABLES } = CONSTANTS.REDIS_COLLECTION;

    const TablelockId = `${LOCK}:${TABLES}:${Data?.tableId}`;

    const Tablelock = await ApplyLock(Path, TablelockId);

    try {

        await Logger("NextRoundProcessAction", JSON.stringify(Data));

        const tableId = Data?.tableId;

        if (!tableId) { throw new Error(CONSTANTS.ERROR_MESSAGES.BULL_DATA_NOT_FOUND) };

        let TableDetails = await GetTable(tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        if (TableDetails.isWinning) { throw new Error(CONSTANTS.ERROR_MESSAGES.WINNING_DONE) };

        for (let i = 0; i < TableDetails.playersArray.length; i++) {

            let UserInTableDetails = await GetUserInTable(TableDetails.tableId, TableDetails.playersArray[i].userId);

            if (!UserInTableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_IN_TABLE_NOT_FOUND) };

            UserInTableDetails.cardArray = [];

            UserInTableDetails.lastPickCard = '';
            UserInTableDetails.lastThrowCard = '';

            UserInTableDetails.isUnoClick = false;

            await SetUserInTable(TableDetails.tableId, UserInTableDetails.userId, UserInTableDetails);

        };

        TableDetails.numberOfCardToPick = 0;

        TableDetails.activeCard = '';
        TableDetails.activeCardType = '';
        TableDetails.activeCardColor = '';

        TableDetails.closeCardDeck = [];
        TableDetails.openCardDeck = [];

        TableDetails.currentRound += 1;

        TableDetails.isScoreScreen = false;

        await SetTable(TableDetails.tableId, TableDetails);

        await GAME_ACTIONS.DistributeCards(TableDetails.tableId);

    } catch (error: any) {

        await ErrorLogger('NextRoundProcessAction Error : ', error);

    } finally {

        await RemoveLock(Path, Tablelock);

    };
};

export { NextRoundProcessAction };
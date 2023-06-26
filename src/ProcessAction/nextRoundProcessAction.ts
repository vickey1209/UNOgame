import { ApplyLock, RemoveLock } from "../Connection/redlock";
import { CONSTANTS } from "../Constants";
import { GAME_ACTIONS } from "../GameActions";
import { GetTable, GetUserInTable, SetTable, SetUserInTable } from "../GameRedisOperations/gameRedisOperations";
import { TableInterface } from "../Interface/Table/TableInterface";
import { UserInTableInterface } from "../Interface/UserInTable/UserInTableInterface";
import { Logger } from "../Logger/logger";

const NextRoundProcessAction = async (Data: any) => {

    const Path = 'NextRoundProcessAction';

    const { LOCK, TABLES } = CONSTANTS.REDIS_COLLECTION;

    const TablelockId = `${LOCK}:${TABLES}:${Data?.tableId}`;

    const Tablelock = await ApplyLock(Path, TablelockId);

    try {

        Logger("NextRoundProcessAction", JSON.stringify(Data));

        const tableId = Data?.tableId;

        if (!tableId) { throw new Error(CONSTANTS.ERROR_MESSAGES.BULL_DATA_NOT_FOUND) };

        let TableDetails: TableInterface = await GetTable(tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        for (let i = 0; i < TableDetails.playersArray.length; i++) {

            let UserInTableDetails: UserInTableInterface = await GetUserInTable(TableDetails.playersArray[i].userId);

            if (!UserInTableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_IN_TABLE_NOT_FOUND) };

            UserInTableDetails.cardArray = [];

            UserInTableDetails.lastPickCard = '';
            UserInTableDetails.lastThrowCard = '';

            UserInTableDetails.isUnoClick = false;

            await SetUserInTable(UserInTableDetails.userId, UserInTableDetails);

        };

        TableDetails.numberOfCardToPick = 0;

        TableDetails.activeCard = '';
        TableDetails.activeCardType = '';
        TableDetails.activeCardColor = '';

        TableDetails.closeCardDeck = [];
        TableDetails.openCardDeck = [];

        TableDetails.isLeaveLock = true;
        TableDetails.isRoundScoreScreen = false;

        await SetTable(TableDetails.tableId, TableDetails);

        await GAME_ACTIONS.DistributeCards(TableDetails.tableId);

    } catch (error: any) {

        Logger('NextRoundProcessAction Error : ', error);

    } finally {

        await RemoveLock(Path, Tablelock);

    };
};

export { NextRoundProcessAction };
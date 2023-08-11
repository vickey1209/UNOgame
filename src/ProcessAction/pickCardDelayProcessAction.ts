import { EventEmitter } from "../Connection/emitter";
import { ApplyLock, RemoveLock } from "../Connection/redlock";
import { CONSTANTS } from "../Constants";
import { GetTable, GetUserInTable, SetUserInTable } from "../GameRedisOperations/gameRedisOperations";
import { TableInterface } from "../Interface/Table/TableInterface";
import { UserInTableInterface } from "../Interface/UserInTable/UserInTableInterface";
import { ErrorLogger, Logger } from "../Logger/logger";

const PickCardDelayProcessAction = async (Data: any) => {

    const Path = 'PickCardDelayProcessAction';

    const { PICK_CARD } = CONSTANTS.EVENTS_NAME;
    const { LOCK, TABLES } = CONSTANTS.REDIS_COLLECTION;

    const TablelockId = `${LOCK}:${TABLES}:${Data?.tableId}`;

    const Tablelock = await ApplyLock(Path, TablelockId);

    try {

        await Logger("PickCardDelayProcessAction", JSON.stringify(Data));

        let TableDetails: TableInterface = await GetTable(Data?.tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        if (TableDetails.isWinning) { throw new Error(CONSTANTS.ERROR_MESSAGES.WINNING_DONE) };

        if (TableDetails.isScoreScreen) { throw new Error(CONSTANTS.ERROR_MESSAGES.ROUND_SCORE_DONE) };

        const PenaltyUser = TableDetails.playersArray.find(player => { player.seatIndex === Data?.PickCardResData?.seatIndex });

        if (!PenaltyUser) { throw new Error(CONSTANTS.ERROR_MESSAGES.ARRAY_FIND_ERROR) };

        let UserInTableDetails: UserInTableInterface = await GetUserInTable(PenaltyUser?.userId);

        // UserInTableDetails.cardArray.push(TableDetails.closeCardDeck[0]);

        Data?.PickCardResData?.pickCards.forEach((card: string) => { UserInTableDetails.cardArray.push(card); });

        await SetUserInTable(UserInTableDetails.userId, UserInTableDetails);

        EventEmitter.emit(PICK_CARD, { en: PICK_CARD, RoomId: TableDetails.tableId, Data: Data?.PickCardResData });

    } catch (error: any) {

        await ErrorLogger('PickCardDelayProcessAction Error : ', error);

    } finally {

        await RemoveLock(Path, Tablelock);

    };
};

export { PickCardDelayProcessAction };
import { AllUserScore } from "../AllUserScore/allUserScore";
import { EventEmitter } from "../Connection/emitter";
import { ApplyLock, RemoveLock } from "../Connection/redlock";
import { CONSTANTS } from "../Constants";
import { GetTable, GetUserInTable, SetUserInTable } from "../GameRedisOperations/gameRedisOperations";
import { ErrorLogger, Logger } from "../Logger/logger";

const PickCardDelayProcessAction = async (Data: any) => {

    const Path = 'PickCardDelayProcessAction';

    const { PICK_CARD, UNO_HIGHLIGHT } = CONSTANTS.EVENTS_NAME;
    const { LOCK, TABLES } = CONSTANTS.REDIS_COLLECTION;

    const TablelockId = `${LOCK}:${TABLES}:${Data?.tableId}`;

    const Tablelock = await ApplyLock(Path, TablelockId);

    try {

        await Logger("PickCardDelayProcessAction", JSON.stringify(Data));

        let TableDetails = await GetTable(Data?.tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        if (TableDetails.isWinning) { throw new Error(CONSTANTS.ERROR_MESSAGES.WINNING_DONE) };

        if (TableDetails.isScoreScreen) { throw new Error(CONSTANTS.ERROR_MESSAGES.ROUND_SCORE_DONE) };

        const PenaltyUser = TableDetails.playersArray.find(player => { return player.seatIndex === Data?.PickCardResData?.seatIndex });

        if (!PenaltyUser) { throw new Error(CONSTANTS.ERROR_MESSAGES.ARRAY_FIND_ERROR) };

        let UserInTableDetails = await GetUserInTable(TableDetails.tableId, PenaltyUser?.userId);

        if (!UserInTableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_IN_TABLE_NOT_FOUND) };

        // UserInTableDetails.cardArray.push(TableDetails.closeCardDeck[0]);

        Data?.PickCardResData?.pickCards.forEach((card: string) => { UserInTableDetails.cardArray.push(card); });

        await SetUserInTable(TableDetails.tableId, UserInTableDetails.userId, UserInTableDetails);

        if (UserInTableDetails.cardArray.length === 2 && Data?.PickCardResData?.isPlayableCard) {

            const UnoHighlightResData = {

                userId: UserInTableDetails.userId,
                tableId: UserInTableDetails.tableId,
                seatIndex: UserInTableDetails.seatIndex,

            };

            EventEmitter.emit(UNO_HIGHLIGHT, { en: UNO_HIGHLIGHT, RoomId: TableDetails.tableId, Data: UnoHighlightResData });
        };

        EventEmitter.emit(PICK_CARD, { en: PICK_CARD, RoomId: TableDetails.tableId, Data: Data?.PickCardResData });

        if (Data?.PickCardResData?.isPlayableCard) { await AllUserScore(TableDetails.tableId); };

    } catch (error: any) {

        await ErrorLogger('PickCardDelayProcessAction Error : ', error);

    } finally {

        await RemoveLock(Path, Tablelock);

    };
};

export { PickCardDelayProcessAction };
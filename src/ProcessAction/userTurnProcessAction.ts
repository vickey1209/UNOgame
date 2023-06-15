import { ChangeUserTurn } from "../ChangeUserTurn/changeUserTurn";
import { EventEmitter } from "../Connection/emitter";
import { ApplyLock, RemoveLock } from "../Connection/redlock";
import { CONSTANTS } from "../Constants";
import { GetTable, GetUserInTable, SetTable, SetUserInTable } from "../GameRedisOperations/gameRedisOperations";
import { TableInterface } from "../Interface/Table/TableInterface";
import { UserInTableInterface } from "../Interface/UserInTable/UserInTableInterface";
import { Logger } from "../Logger/logger";

const UserTurnProcessAction = async (Data: any) => {

    const Path = 'UserTurnProcessAction';

    const { LOCK, TABLES } = CONSTANTS.REDIS_COLLECTION;
    const { PICK_CARD } = CONSTANTS.EVENTS_NAME;

    const TablelockId = `${LOCK}:${TABLES}:${Data?.tableId}`;

    const Tablelock = await ApplyLock(Path, TablelockId);

    try {

        Logger("UserTurnProcessAction", JSON.stringify(Data));

        const tableId = Data?.tableId;
        const currentTurn = Data?.currentTurn;

        let TableDetails: TableInterface = await GetTable(tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        if (TableDetails.currentTurn !== currentTurn) { throw new Error(CONSTANTS.ERROR_MESSAGES.WRONG_CURRENT_TURN_AT_PROCESS) };

        const CurrentTurnUser = TableDetails.playersArray.find(e => { return e.seatIndex === TableDetails.currentTurn });

        if (!CurrentTurnUser) { throw new Error(CONSTANTS.ERROR_MESSAGES.ARRAY_FIND_ERROR) };

        let UserInTableDetails: UserInTableInterface = await GetUserInTable(CurrentTurnUser?.userId);

        if (!UserInTableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_IN_TABLE_NOT_FOUND) };

        if (UserInTableDetails.lastPickCard !== '' && UserInTableDetails.cardArray.includes(UserInTableDetails.lastPickCard)) {

            UserInTableDetails.lastPickCard = '';

        } else {

            if (TableDetails.closeCardDeck.length < 1) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_IN_TABLE_NOT_FOUND) };

            const PickCardsFromCloseDeck = TableDetails.closeCardDeck[0];

            TableDetails.closeCardDeck.splice(0, 1);

            UserInTableDetails.cardArray.push(PickCardsFromCloseDeck);

            await SetTable(TableDetails.tableId, TableDetails);

            const ResData = {

                userId: UserInTableDetails.userId,
                tableId: UserInTableDetails.tableId,
                seatIndex: UserInTableDetails.seatIndex,
                pickCard: [PickCardsFromCloseDeck],
                isPlayableCard: false

            };

            EventEmitter.emit(PICK_CARD, { en: PICK_CARD, RoomId: TableDetails.tableId, Data: ResData });

        };

        await SetUserInTable(UserInTableDetails.userId, UserInTableDetails);

        await ChangeUserTurn(TableDetails.tableId);

    } catch (error: any) {

        Logger('UserTurnProcessAction Error : ', error);

    } finally {

        await RemoveLock(Path, Tablelock);

    }
};

export { UserTurnProcessAction };
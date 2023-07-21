import { Logger } from "../Logger/logger";
import { CONSTANTS } from "../Constants";
import { ApplyLock, RemoveLock } from "../Connection/redlock";
import { ThrowCardInterface } from "../Interface/ThrowCard/ThrowCardInterface";
import { GetTable, GetUserInTable, SetTable, SetUserInTable } from "../GameRedisOperations/gameRedisOperations";
import { TableInterface } from "../Interface/Table/TableInterface";
import { EventEmitter } from "../Connection/emitter";
import { BullTimer } from "../BullTimer";
import { UserInTableInterface } from "../Interface/UserInTable/UserInTableInterface";
import { ChangeUserTurn } from "../ChangeUserTurn/changeUserTurn";
import { GAME_ACTIONS } from "../GameActions";
import { Uno } from "../Uno/uno";

const ThrowCard = async (en: string, socket: any, Data: ThrowCardInterface) => {

    const Path = 'ThrowCard';

    const { ERROR_POPUP, THROW_CARD } = CONSTANTS.EVENTS_NAME;
    const { LOCK, TABLES } = CONSTANTS.REDIS_COLLECTION;

    const TablelockId = `${LOCK}:${TABLES}:${Data?.tableId}`;

    const Tablelock = await ApplyLock(Path, TablelockId);

    try {

        Logger("ThrowCard", JSON.stringify({ Data }));

        let TableDetails: TableInterface = await GetTable(Data?.tableId);

        let isWrongCard = true;

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        if (TableDetails.isTurnLock) {
            return EventEmitter.emit(ERROR_POPUP, { en: ERROR_POPUP, SocketId: socket.id, Data: { Message: CONSTANTS.ERROR_MESSAGES.WAIT_FOR_TURN_INFO } });
        };

        if (TableDetails.currentTurn !== Data?.seatIndex) {
            return EventEmitter.emit(ERROR_POPUP, { en: ERROR_POPUP, SocketId: socket.id, Data: { Message: CONSTANTS.ERROR_MESSAGES.NOT_YOUR_TURN } });
        };

        const UserAvailableInTable = TableDetails.playersArray.find(e => { return e.userId === Data?.userId });

        if (!UserAvailableInTable) {
            return EventEmitter.emit(ERROR_POPUP, { en: ERROR_POPUP, SocketId: socket.id, Data: { Message: CONSTANTS.ERROR_MESSAGES.WRONG_TABLE } });
        };

        let UserInTableDetails: UserInTableInterface = await GetUserInTable(Data?.userId);

        if (!UserInTableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_IN_TABLE_NOT_FOUND) };

        if (!UserInTableDetails.cardArray.includes(Data?.card)) {
            return EventEmitter.emit(ERROR_POPUP, { en: ERROR_POPUP, SocketId: socket.id, Data: { Message: CONSTANTS.ERROR_MESSAGES.NOT_YOUR_CARD } });
        };

        if (UserInTableDetails.lastPickCard !== '' && UserInTableDetails.lastPickCard !== Data?.card) {
            return EventEmitter.emit(ERROR_POPUP, { en: ERROR_POPUP, SocketId: socket.id, Data: { Message: CONSTANTS.ERROR_MESSAGES.MUST_THROW_PICK_CARD } });
        };

        if (!CONSTANTS.UNO_CARDS.CARDS_COLOR.includes(Data?.cardColor)) {
            return EventEmitter.emit(ERROR_POPUP, { en: ERROR_POPUP, SocketId: socket.id, Data: { Message: CONSTANTS.ERROR_MESSAGES.INVALID_CARD_COLOR } });
        };

        if (Data?.card.split("-")[0] === CONSTANTS.UNO_CARDS.CARDS_TYPE.WILD_CARD && Data?.cardType === CONSTANTS.UNO_CARDS.CARDS_TYPE.PLUS_FOUR) { isWrongCard = false; };

        if (Data?.card.split("-")[0] === CONSTANTS.UNO_CARDS.CARDS_TYPE.WILD_CARD && TableDetails.numberOfCardToPick === 0) { isWrongCard = false; };

        if (TableDetails.numberOfCardToPick === 0) {

            if (TableDetails.activeCardType === Data?.cardType || TableDetails.activeCardColor === Data?.cardColor) { isWrongCard = false; }

        } else {

            if (TableDetails.activeCardType === Data?.cardType) { isWrongCard = false; };

        };

        if (isWrongCard) { return EventEmitter.emit(ERROR_POPUP, { en: ERROR_POPUP, SocketId: socket.id, Data: { Message: CONSTANTS.ERROR_MESSAGES.WRONG_CARD } }); };

        TableDetails.activeCard = Data?.card;
        TableDetails.activeCardType = Data?.cardType;
        TableDetails.activeCardColor = Data?.cardColor;

        TableDetails.openCardDeck.push(Data?.card);

        UserInTableDetails.lastPickCard = '';
        UserInTableDetails.cardArray.splice(UserInTableDetails.cardArray.indexOf(Data?.card), 1);

        await SetUserInTable(UserInTableDetails.userId, UserInTableDetails);

        await SetTable(TableDetails.tableId, TableDetails);

        await BullTimer.CancelJob.CancelUserTurn(TableDetails.tableId, TableDetails.currentTurn);

        EventEmitter.emit(THROW_CARD, { en: THROW_CARD, RoomId: TableDetails.tableId, Data: Data });

        if (UserAvailableInTable.isBot && UserInTableDetails.cardArray.length === 1) {
            await Uno(en, socket, { "userId": UserInTableDetails.userId, "tableId": UserInTableDetails.tableId, "seatIndex": UserInTableDetails.seatIndex })
        }

        await ChangeUserTurn(TableDetails.tableId, true, false, UserInTableDetails.cardArray.length);

        // if (UserInTableDetails.cardArray.length < 1) { await GAME_ACTIONS.EndRound(TableDetails.tableId, false); }
        // else { await ChangeUserTurn(TableDetails.tableId, true, false, UserInTableDetails.cardArray.length); };

    } catch (error: any) {

        Logger('ThrowCard Error : ', error);

    } finally {

        await RemoveLock(Path, Tablelock);

    };
};

export { ThrowCard };
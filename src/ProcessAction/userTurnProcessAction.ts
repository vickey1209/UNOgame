import { BullTimer } from "../BullTimer";
import { ChangeUserTurn } from "../ChangeUserTurn/changeUserTurn";
import { Config } from "../Config";
import { EventEmitter } from "../Connection/emitter";
import { ApplyLock, RemoveLock } from "../Connection/redlock";
import { io } from "../Connection/socket";
import { CONSTANTS } from "../Constants";
import { GetTable, GetTableConfig, GetUser, GetUserInTable, SetTable, SetUserInTable } from "../GameRedisOperations/gameRedisOperations";
import { PickCardResInterface } from "../Interface/PickCardRes/PickCardResInterface";
import { ErrorLogger, Logger } from "../Logger/logger";
import { LeaveRoom } from "../SocketRooms/leaveRoom";
import { RemoveUserFromTable } from "../Table/leaveTable";

const UserTurnProcessAction = async (Data: any) => {

    const Path = 'UserTurnProcessAction';

    const { LOCK, TABLES } = CONSTANTS.REDIS_COLLECTION;
    const { PICK_CARD, TURN_MISSED, ALERT } = CONSTANTS.EVENTS_NAME;

    const TablelockId = `${LOCK}:${TABLES}:${Data?.tableId}`;

    const Tablelock = await ApplyLock(Path, TablelockId);

    try {

        await Logger("UserTurnProcessAction", JSON.stringify(Data));

        const tableId = Data?.tableId;
        const currentTurn = Data?.currentTurn;

        const TableConfigDetails = await GetTableConfig(tableId);

        if (!TableConfigDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_CONFIG_NOT_FOUND) };

        let pickCards: Array<string> = [], isPick = false;

        if (!tableId || currentTurn === undefined) { throw new Error(CONSTANTS.ERROR_MESSAGES.BULL_DATA_NOT_FOUND) };

        let TableDetails = await GetTable(tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        if (TableDetails.isWinning) { throw new Error(CONSTANTS.ERROR_MESSAGES.WINNING_DONE) };

        if (TableDetails.isScoreScreen) { throw new Error(CONSTANTS.ERROR_MESSAGES.ROUND_SCORE_DONE) };

        if (TableDetails.currentTurn !== currentTurn) { throw new Error(CONSTANTS.ERROR_MESSAGES.WRONG_CURRENT_TURN_AT_PROCESS) };

        const CurrentTurnUser = TableDetails.playersArray.find(e => { return e.seatIndex === TableDetails.currentTurn });

        if (!CurrentTurnUser) { throw new Error(CONSTANTS.ERROR_MESSAGES.ARRAY_FIND_ERROR) };

        const UserDetails = await GetUser(CurrentTurnUser?.userId);

        if (!UserDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_NOT_FOUND); };

        let UserInTableDetails = await GetUserInTable(TableDetails.tableId, CurrentTurnUser?.userId);

        if (!UserInTableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_IN_TABLE_NOT_FOUND) };

        if (UserInTableDetails.turnMissCount !== TableConfigDetails?.TURN_TIMEOUT_COUNT) { UserInTableDetails.turnMissCount += 1; };

        if (UserInTableDetails.lastPickCard !== '' && UserInTableDetails.cardArray.includes(UserInTableDetails.lastPickCard)) {

            UserInTableDetails.lastPickCard = '';

        } else if (UserInTableDetails.turnMissCount !== TableConfigDetails?.TURN_TIMEOUT_COUNT) {

            isPick = true;

        } else if (UserInTableDetails.turnMissCount === TableConfigDetails?.TURN_TIMEOUT_COUNT && TableDetails.numberOfCardToPick !== 0) {

            isPick = true;

            TableDetails.disconnectedUsers.push(UserDetails.userId);

        };

        if (isPick) {

            isPick = true;

            if (TableDetails.numberOfCardToPick === 0) {

                if (TableDetails.closeCardDeck.length) {

                    // UserInTableDetails.cardArray.push(TableDetails.closeCardDeck[0]);

                    pickCards.push(TableDetails.closeCardDeck[0]);

                    TableDetails.closeCardDeck.splice(0, 1);

                };

            } else {

                for (let i = 0; i < TableDetails.numberOfCardToPick; i++) {

                    if (TableDetails.closeCardDeck.length) {

                        // UserInTableDetails.cardArray.push(TableDetails.closeCardDeck[0]);

                        pickCards.push(TableDetails.closeCardDeck[0]);

                        TableDetails.closeCardDeck.splice(0, 1);

                    };
                };

            };

            const PickCardResData: PickCardResInterface = {

                userId: UserInTableDetails.userId,
                tableId: UserInTableDetails.tableId,
                seatIndex: UserInTableDetails.seatIndex,
                pickCards,
                isPlayableCard: false

            };

            await BullTimer.AddJob.PickCardDelay(TableDetails.tableId, 0, PickCardResData);

        };

        UserInTableDetails.isUnoClick = false;

        // if (UserInTableDetails.turnMissCount !== CONFIG.GamePlay.TURN_TIMEOUT_COUNT) { UserInTableDetails.turnMissCount += 1; };

        await SetTable(TableDetails.tableId, TableDetails);

        await SetUserInTable(TableDetails.tableId, UserInTableDetails.userId, UserInTableDetails);

        const TurnMissResData = { userId: UserInTableDetails.userId, tableId: UserInTableDetails.tableId, seatIndex: UserInTableDetails.seatIndex, turnMissCount: UserInTableDetails.turnMissCount };

        EventEmitter.emit(TURN_MISSED, { en: TURN_MISSED, Data: TurnMissResData, RoomId: TableDetails.tableId });

        if (UserInTableDetails.turnMissCount === TableConfigDetails?.TURN_TIMEOUT_COUNT) {

            EventEmitter.emit(ALERT, { en: ALERT, SocketId: UserDetails.socketId, Data: { Message: CONSTANTS.ERROR_MESSAGES.TURN_SKIP_LIMIT_REACHED } });

            const socket = io.sockets.sockets.get(UserDetails.socketId); // * Find User Socket

            if (socket) { await LeaveRoom(socket, TableDetails.tableId); };

        };

        if (UserInTableDetails.turnMissCount === TableConfigDetails?.TURN_TIMEOUT_COUNT && TableDetails.numberOfCardToPick === 0) {
            // if (UserInTableDetails.turnMissCount === CONFIG.GamePlay.TURN_TIMEOUT_COUNT) {

            await RemoveUserFromTable(UserInTableDetails.userId, TableDetails.tableId, false);

        } else {

            await ChangeUserTurn(TableDetails.tableId, false, isPick, 0);

        };

    } catch (error: any) {

        await ErrorLogger('UserTurnProcessAction Error : ', error);

    } finally {

        await RemoveLock(Path, Tablelock);

    };
};

export { UserTurnProcessAction };
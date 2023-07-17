import { BullTimer } from "../BullTimer";
import { EventEmitter } from "../Connection/emitter";
import { ApplyLock, RemoveLock } from "../Connection/redlock";
import { CONSTANTS } from "../Constants";
import { GAME_ACTIONS } from "../GameActions";
import { GetTable, GetUser, GetUserInTable, SetUser } from "../GameRedisOperations/gameRedisOperations";
import { SignUpInterface } from "../Interface/SignUp/SignUpInterface";
import { TableInterface } from "../Interface/Table/TableInterface";
import { UserInTableInterface } from "../Interface/UserInTable/UserInTableInterface";
import { Logger } from "../Logger/logger";
import { JoinRoom } from "../SocketRooms/joinRoom";
import { CreateTable } from "./createTable";

const RejoinTable = async (socket: any, Data: SignUpInterface) => {

    const Path = 'RejoinTable';

    let Tablelock;

    const { LOCK, TABLES } = CONSTANTS.REDIS_COLLECTION;
    const { ALERT, JOIN_TABLE, REJOIN } = CONSTANTS.EVENTS_NAME;

    const TablelockId = `${LOCK}:${TABLES}:${Data?.tableId}`;
    if (Data?.tableId !== '') { Tablelock = await ApplyLock(Path, TablelockId); };

    try {

        Logger('RejoinTable', JSON.stringify({ Data }));

        const UserDetails: SignUpInterface = await GetUser(Data?.userId);

        if (!UserDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_NOT_FOUND); };

        if (UserDetails.tableId === '') {

            await CreateTable(socket, Data);
            return;

        };

        let TableDetails: TableInterface = await GetTable(UserDetails.tableId);

        if (!TableDetails) {

            EventEmitter.emit(ALERT, { en: ALERT, SocketId: UserDetails.socketId, Data: { Message: CONSTANTS.ERROR_MESSAGES.LAST_GAME_FINISHED } });

            UserDetails.tableId = '';
            await SetUser(UserDetails.userId, UserDetails);

            return;

        };

        const UserAvailableInTable = TableDetails.playersArray.find(e => { return e.userId === UserDetails.userId });

        let UserInTableDetails: UserInTableInterface = await GetUserInTable(UserDetails.userId);

        if (!UserInTableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_IN_TABLE_NOT_FOUND) };

        if (UserAvailableInTable && UserInTableDetails) {

            if (TableDetails.isGameStart) {

                const { userId, seatIndex, turnMissCount, isBot, isUnoClick, cardArray } = UserInTableDetails;

                const { tableId, bootValue, currentTurn, currentRound, maxPlayers, playersArray, activeCard, activeCardType, activeCardColor, isClockwise, isGameStart } = TableDetails;

                const RoundJob = await BullTimer.CheckJob.CheckRound(TableDetails.tableId);
                const UserTurnJob = await BullTimer.CheckJob.CheckUserTurn(tableId, currentTurn);
                const GameStartJob = await BullTimer.CheckJob.CheckCollectBootValue(TableDetails.tableId);

                let RemainingUserTurnTimer: any = 0, RemainingRoundTimer: any = 0, RemainingGameStartTimer: any = 0;

                if (UserTurnJob) { RemainingUserTurnTimer = await GAME_ACTIONS.RemainTimeCalculation(UserTurnJob); };
                if (GameStartJob) { RemainingGameStartTimer = await GAME_ACTIONS.RemainTimeCalculation(GameStartJob); };
                if (RoundJob) { RemainingRoundTimer = await GAME_ACTIONS.RemainTimeCalculation(RoundJob); };

                const RejoinResData = {

                    table: { tableId, bootValue, currentTurn, currentRound, maxPlayers, playersArray, activeCard, activeCardType, activeCardColor, isClockwise, isGameStart, RemainingRoundTimer, RemainingGameStartTimer },
                    user: { userId, seatIndex, turnMissCount, isBot, isUnoClick, cardArray, RemainingUserTurnTimer }

                };

                await JoinRoom(socket, TableDetails.tableId);

                EventEmitter.emit(REJOIN, { en: REJOIN, SocketId: UserDetails.socketId, Data: RejoinResData });

            } else {

                await JoinRoom(socket, TableDetails.tableId);

                EventEmitter.emit(JOIN_TABLE, { en: JOIN_TABLE, SocketId: UserDetails.socketId, Data: TableDetails });

            };

        } else {

            await CreateTable(socket, Data);
            return;

        };

    } catch (error: any) {

        Logger('RejoinTable Error : ', error);

    } finally {

        if (Data?.tableId !== '') { await RemoveLock(Path, Tablelock); };

    };
};

export { RejoinTable };
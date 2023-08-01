import { AllUserScore } from "../AllUserScore/allUserScore";
import { BullTimer } from "../BullTimer";
import { CardScoring } from "../CardScoring/cardScoring";
import { Config } from "../Config";
import { EventEmitter } from "../Connection/emitter";
import { ApplyLock, RemoveLock } from "../Connection/redlock";
import { CONSTANTS } from "../Constants";
import { GAME_ACTIONS } from "../GameActions";
import { GetRoundHistory, GetTable, GetUser, GetUserInTable, SetUser } from "../GameRedisOperations/gameRedisOperations";
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
    const { ALERT, JOIN_TABLE, REJOIN, WINNER_DECLARE } = CONSTANTS.EVENTS_NAME;

    const TablelockId = `${LOCK}:${TABLES}:${Data?.tableId}`;
    if (Data?.tableId !== '') { Tablelock = await ApplyLock(Path, TablelockId); };

    try {

        Logger('RejoinTable', JSON.stringify({ Data }));

        const CONFIG = Config();

        let UserDetails: SignUpInterface = await GetUser(Data?.userId);

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

        if (TableDetails && TableDetails.isWinning) {

            EventEmitter.emit(WINNER_DECLARE, { en: WINNER_DECLARE, RoomId: UserDetails.socketId, Data: { winningArray: TableDetails.winningArray } });

            UserDetails.tableId = '';
            await SetUser(UserDetails.userId, UserDetails);

            return;

        };

        const UserAvailableInTable = TableDetails.playersArray.find(e => { return e.userId === UserDetails.userId });

        let UserInTableDetails: UserInTableInterface = await GetUserInTable(UserDetails.userId);

        if (!UserInTableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_IN_TABLE_NOT_FOUND) };

        if (UserAvailableInTable && UserInTableDetails) {

            if (TableDetails.isGameStart) {

                const { userId, seatIndex, turnMissCount, isBot, isUnoClick, cardArray }: any = UserInTableDetails;

                let { tableId, bootValue, currentTurn, currentRound, totalRounds, maxPlayers, playersArray, activeCard, activeCardType, activeCardColor, isClockwise, isGameStart, isRoundStart, isScoreScreen, isWinning }: any = TableDetails;

                const totalUserTurnTimer = CONFIG.GamePlay.USER_TURN_TIMER;

                let isThrowPossible = await GAME_ACTIONS.IsThrowPossible(UserInTableDetails, TableDetails);

                if (isThrowPossible === undefined || UserInTableDetails.seatIndex !== TableDetails.currentTurn) { isThrowPossible = false };

                const RoundJob = await BullTimer.CheckJob.CheckRound(TableDetails.tableId);
                const UserTurnJob = await BullTimer.CheckJob.CheckUserTurn(tableId, currentTurn);
                const GameStartJob = await BullTimer.CheckJob.CheckCollectBootValue(TableDetails.tableId);
                const RoundScreenJob = await BullTimer.CheckJob.CheckNextRound(TableDetails.tableId);

                let RemainingUserTurnTimer: any = 0, RemainingRoundTimer: any = 0, RemainingGameStartTimer: any = 0, RemainingScoreScreenTimer: any = 0;

                if (RoundJob) { RemainingRoundTimer = await GAME_ACTIONS.RemainTimeCalculation(RoundJob); };
                if (UserTurnJob) { RemainingUserTurnTimer = await GAME_ACTIONS.RemainTimeCalculation(UserTurnJob); };
                if (GameStartJob) { RemainingGameStartTimer = await GAME_ACTIONS.RemainTimeCalculation(GameStartJob); };
                if (RoundScreenJob) { RemainingScoreScreenTimer = await GAME_ACTIONS.RemainTimeCalculation(RoundScreenJob); };

                if (RemainingScoreScreenTimer < CONFIG.GamePlay.GAME_START_TIMER && RemainingGameStartTimer === 0 && isScoreScreen) { RemainingGameStartTimer = RemainingScoreScreenTimer };

                const SelfUserInTableData = TableDetails.playersArray.find((player) => { return player.userId === UserDetails.userId });

                socket.handshake.auth.tableId = TableDetails?.tableId;
                socket.handshake.auth.seatIndex = SelfUserInTableData?.seatIndex;

                const RoundHistoryDetails = await GetRoundHistory(TableDetails.tableId);

                for (let i = 0; i < TableDetails.playersArray.length; i++) {

                    const SingleUserInTableDetails: UserInTableInterface = await GetUserInTable(TableDetails.playersArray[i].userId);

                    const { turnMissCount, isUnoClick } = SingleUserInTableDetails;

                    playersArray[i] = { ...playersArray[i], turnMissCount, isUnoClick, cardsLength: SingleUserInTableDetails.cardArray.length };

                };

                const RejoinResData = {

                    table: {

                        tableId, bootValue, currentTurn,
                        currentRound, totalRounds, maxPlayers, playersArray,
                        activeCard, activeCardType, activeCardColor,
                        isClockwise, isGameStart, isRoundStart, isWinning, isScoreScreen,
                        RemainingRoundTimer, RemainingGameStartTimer, RemainingScoreScreenTimer, RemainingUserTurnTimer, totalUserTurnTimer,

                    },

                    user: { userId, seatIndex, turnMissCount, isBot, isUnoClick, isThrowPossible, cardArray },

                    allRoundScore: RoundHistoryDetails.length ? RoundHistoryDetails : [],

                };

                EventEmitter.emit(REJOIN, { en: REJOIN, SocketId: UserDetails.socketId, Data: RejoinResData });

                await CardScoring(socket);

                await JoinRoom(socket, TableDetails.tableId);

                await AllUserScore(TableDetails.tableId);

            } else {

                const SelfUserInTableData = TableDetails.playersArray.find((player) => { return player.userId === UserDetails.userId });

                socket.handshake.auth.tableId = TableDetails?.tableId;
                socket.handshake.auth.seatIndex = SelfUserInTableData?.seatIndex;

                await JoinRoom(socket, TableDetails.tableId);

                // EventEmitter.emit(JOIN_TABLE, { en: JOIN_TABLE, SocketId: UserDetails.socketId, Data: TableDetails });

                await CardScoring(socket);

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
import { AllUserScore } from "../AllUserScore/allUserScore";
import { BullTimer } from "../BullTimer";
import { CardScoring } from "../CardScoring/cardScoring";
import { Config } from "../Config";
import { EventEmitter } from "../Connection/emitter";
import { ApplyLock, RemoveLock } from "../Connection/redlock";
import { CONSTANTS } from "../Constants";
import { GAME_ACTIONS } from "../GameActions";
import { GetRoundHistory, GetTable, GetTableConfig, GetUser, GetUserInTable, SetUser } from "../GameRedisOperations/gameRedisOperations";
import { SignUpInterface, UserInterface, WinzoApiDataInterface } from "../Interface/SignUp/SignUpInterface";
import { ErrorLogger, Logger } from "../Logger/logger";
import { JoinRoom } from "../SocketRooms/joinRoom";
import { CreateTable } from "./createTable";

const RejoinTable = async (socket: any, WinZoSignUpData: WinzoApiDataInterface, UserData: UserInterface) => {

    const Path = 'RejoinTable';

    let Tablelock;

    const { LOCK, TABLES } = CONSTANTS.REDIS_COLLECTION;
    const { ALERT, JOIN_TABLE, REJOIN, WINNER_DECLARE } = CONSTANTS.EVENTS_NAME;

    const TablelockId = `${LOCK}:${TABLES}:${UserData?.tableId}`;
    if (UserData?.tableId !== '') { Tablelock = await ApplyLock(Path, TablelockId); };

    try {

        await Logger('RejoinTable', JSON.stringify({ UserData }));

        const CONFIG = Config();

        let UserDetails: UserInterface = await GetUser(UserData?.userId);

        if (!UserDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_NOT_FOUND); };

        if (UserDetails.tableId === '') {

            await CreateTable(socket, WinZoSignUpData, UserData);

            return;
        };

        let TableDetails = await GetTable(UserDetails.tableId);

        // if (!TableDetails) {

        //     EventEmitter.emit(ALERT, { en: ALERT, SocketId: UserDetails.socketId, Data: { Message: CONSTANTS.ERROR_MESSAGES.LAST_GAME_FINISHED } });

        //     return;
        // };

        const TableConfigDetails = await GetTableConfig(UserDetails.tableId);

        if (!TableConfigDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_CONFIG_NOT_FOUND) };

        if (TableDetails && TableDetails.isWinning) {

            EventEmitter.emit(WINNER_DECLARE, { en: WINNER_DECLARE, RoomId: UserDetails.socketId, Data: { winningArray: TableDetails.winningArray } });

            return;
        };

        const UserAvailableInTable = TableDetails.playersArray.find(e => { return e.userId === UserDetails.userId });

        let UserInTableDetails = await GetUserInTable(TableDetails.tableId, UserDetails.userId);

        if (!UserInTableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_IN_TABLE_NOT_FOUND) };

        if (UserAvailableInTable && UserInTableDetails) {

            if (TableDetails.isGameStart) {

                const { userId, seatIndex, turnMissCount, isBot, isUnoClick, cardArray, lastPickCard }: any = UserInTableDetails;

                let { tableId, bootValue, currentTurn, currentRound, totalRounds, maxPlayers, playersArray, activeCard, activeCardType, activeCardColor, isClockwise, isGameStart, isRoundStart, isScoreScreen, isWinning, isTurnLock }: any = TableDetails;

                const totalUserTurnTimer = TableConfigDetails.USER_TURN_TIMER;
                // const totalUserTurnTimer = CONFIG.GamePlay.USER_TURN_TIMER;

                let isThrowPossible: boolean = false, throwPossibleCards: Array<string> = [], isUno: boolean = false;

                let isThrowPossibleData = await GAME_ACTIONS.IsThrowPossible(UserInTableDetails, TableDetails);

                if (isThrowPossibleData && isThrowPossibleData?.isThrowPossible && UserInTableDetails.seatIndex === TableDetails.currentTurn) {
                    isThrowPossible = isThrowPossibleData.isThrowPossible, throwPossibleCards = isThrowPossibleData.throwPossibleCards
                };

                if (

                    ((cardArray.length === 1) || (cardArray.length === 2 && isThrowPossibleData?.isThrowPossible)) &&
                    (TableDetails.currentTurn === UserInTableDetails.seatIndex) &&
                    (UserInTableDetails.isUnoClick === false)

                ) {
                    isUno = true;
                };

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

                    const SingleUserInTableDetails = await GetUserInTable(TableDetails.tableId, TableDetails.playersArray[i].userId);

                    const { turnMissCount, isUnoClick } = SingleUserInTableDetails;

                    playersArray[i] = { ...playersArray[i], turnMissCount, isUnoClick, cardsLength: SingleUserInTableDetails.cardArray.length };

                };

                const RejoinResData = {

                    table: {

                        tableId, bootValue, currentTurn,
                        currentRound, totalRounds, maxPlayers, playersArray,
                        activeCard, activeCardType, activeCardColor,
                        isClockwise, isGameStart, isRoundStart, isWinning, isScoreScreen, isTurnLock,
                        RemainingRoundTimer, RemainingGameStartTimer, RemainingScoreScreenTimer, RemainingUserTurnTimer, totalUserTurnTimer,

                    },

                    user: { userId, seatIndex, turnMissCount, isBot, isUnoClick, isThrowPossible, cardArray, lastPickCard, isUno, throwPossibleCards },

                    allRoundScore: RoundHistoryDetails.length ? RoundHistoryDetails : [],

                };

                EventEmitter.emit(REJOIN, { en: REJOIN, SocketId: UserDetails.socketId, Data: RejoinResData });

                await CardScoring(socket, TableDetails.tableId);

                await JoinRoom(socket, TableDetails.tableId);

                if (!TableDetails.isLeaveLock) { await AllUserScore(TableDetails.tableId); };
                // await AllUserScore(TableDetails.tableId);

            } else {

                const SelfUserInTableData = TableDetails.playersArray.find((player) => { return player.userId === UserDetails.userId });

                socket.handshake.auth.tableId = TableDetails?.tableId;
                socket.handshake.auth.seatIndex = SelfUserInTableData?.seatIndex;

                await JoinRoom(socket, TableDetails.tableId);

                // EventEmitter.emit(JOIN_TABLE, { en: JOIN_TABLE, SocketId: UserDetails.socketId, Data: TableDetails });

                await CardScoring(socket, TableDetails.tableId);

            };

        } else {

            await CreateTable(socket, WinZoSignUpData, UserData);
            return;

        };

    } catch (error: any) {

        await ErrorLogger('RejoinTable Error : ', error);

    } finally {

        if (UserData?.tableId !== '') { await RemoveLock(Path, Tablelock); };

    };
};

export { RejoinTable };
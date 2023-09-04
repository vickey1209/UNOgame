import cryptoRandomString from "crypto-random-string";
import { Socket } from "socket.io";
import { SignUpInterface } from "../Interface/SignUp/SignUpInterface";
import { ErrorLogger, Logger } from "../Logger/logger";
import { GetEmptyTable, GetUser, SetEmptyTable, SetTable, SetUser, SetUserInTable } from "../GameRedisOperations/gameRedisOperations";
import { CONSTANTS } from "../Constants";
import { JoinRoom } from "../SocketRooms/joinRoom";
import { EventEmitter } from "../Connection/emitter";
import { JoinTable } from "./joinTable";
import { TableInterface } from "../Interface/Table/TableInterface";
import { UserInTableInterface } from "../Interface/UserInTable/UserInTableInterface";
import { BOT_ACTION } from "../Bot";
import { Config } from "../Config";
import { CardScoring } from "../CardScoring/cardScoring";
import { BullTimer } from "../BullTimer";

const CreateTable = async (socket: Socket, Data: SignUpInterface) => {

    try {

        await Logger('CreateTable', JSON.stringify({ Data }));

        const { JOIN_TABLE } = CONSTANTS.EVENTS_NAME;

        const UserDetails = await GetUser(Data.userId);

        if (!UserDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_NOT_FOUND) };

        const EmptyTableList = await GetEmptyTable(Data?.bootValue, Data?.playerCount);

        if (EmptyTableList) {

            await JoinTable(socket, Data);
            return;

        };

        const Table = await CreateNewTable(socket, UserDetails);

        // setTimeout(async () => { await BOT_ACTION.BotSignUp() }, 2000);

        await BullTimer.AddJob.BotSignup({
            playerCount: Table?.maxPlayers,
            bootValue: Table?.bootValue,
            delayNumber: 4,
            tableId: Table?.tableId
        })

        // EventEmitter.emit(JOIN_TABLE, { en: JOIN_TABLE, SocketId: socket.id, Data: Table });

        await CardScoring(socket);

    } catch (error: any) {
        await ErrorLogger('CreateTable Error : ', error);
    };
};

const CreateNewTable = async (socket: Socket, UserDetails: SignUpInterface) => {

    try {

        await Logger('CreateNewTable', JSON.stringify({ UserDetails }));

        const CONFIG = Config();

        const Table: TableInterface = {

            // tableId: 'TABLE',
            tableId: cryptoRandomString({ length: 24, type: 'hex' }),
            bootValue: UserDetails.bootValue,
            currentTurn: -1,
            currentRound: 1,
            totalRounds: CONFIG.GamePlay.TOTAL_ROUND_NUMBER,
            maxPlayers: UserDetails.playerCount,
            botPriority: CONSTANTS.BOT_PRIORITY.HARD,
            playersArray: [

                {
                    userId: UserDetails.userId,
                    userName: UserDetails.userId.slice(0, 6),
                    // userName: UserDetails.userName,
                    userProfile: UserDetails.userProfile,
                    seatIndex: 0,
                    isLeave: false,
                    isBot: UserDetails.isBot,
                }
            ],

            numberOfCardToPick: 0,

            activeCard: '',
            activeCardType: '',
            activeCardColor: '',
            closeCardDeck: [],
            openCardDeck: [],

            isClockwise: true,

            isGameStart: false,
            isRoundStart: false,
            isScoreScreen: false,

            isLeaveLock: false,
            isTurnLock: false,

            isWinning: false,

            disconnectedUsers: [],
            winningArray: []

        };

        const UserInTable: UserInTableInterface = {

            userId: UserDetails.userId,
            tableId: Table.tableId,
            seatIndex: 0,
            userScore: 0,
            turnMissCount: 0,
            isBot: false,
            isUnoClick: false,
            lastPickCard: '',
            lastThrowCard: '',
            cardArray: [],

        };

        socket.handshake.auth.tableId = Table?.tableId;
        socket.handshake.auth.seatIndex = 0;

        await JoinRoom(socket, Table.tableId);

        UserDetails.tableId = Table.tableId;
        await SetUser(UserDetails.userId, UserDetails);

        await SetTable(Table.tableId, Table);

        await SetUserInTable(Table.tableId, UserDetails.userId, UserInTable);

        await SetEmptyTable(UserDetails.bootValue, UserDetails.playerCount, Table.tableId);

        return Table;

    } catch (error: any) {
        await ErrorLogger('CreateNewTable Error : ', error);
    };
};

export { CreateTable };
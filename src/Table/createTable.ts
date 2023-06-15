import cryptoRandomString from "crypto-random-string";
import { Socket } from "socket.io";
import { SignUpInterface } from "../Interface/SignUp/SignUpInterface";
import { Logger } from "../Logger/logger";
import { GetEmptyTable, GetUser, SetEmptyTable, SetTable, SetUser, SetUserInTable } from "../GameRedisOperations/gameRedisOperations";
import { CONSTANTS } from "../Constants";
import { JoinRoom } from "../SocketRooms/joinRoom";
import { EventEmitter } from "../Connection/emitter";
import { JoinTable } from "./joinTable";
import { TableInterface } from "../Interface/Table/TableInterface";
import { UserInTableInterface } from "../Interface/UserInTable/UserInTableInterface";

const CreateTable = async (socket: Socket, Data: SignUpInterface) => {

    try {

        Logger('CreateTable', JSON.stringify({ Data }));

        const { JOIN_TABLE, ERROR } = CONSTANTS.EVENTS_NAME;

        const UserDetails: SignUpInterface = await GetUser(Data.userId);

        if (!UserDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_NOT_FOUND) };

        if (UserDetails.chips < Data.bootValue) {
            return EventEmitter.emit(ERROR, { en: ERROR, SocketId: socket.id, Data: { Message: CONSTANTS.ERROR_MESSAGES.ENOUGH_CHIPS } });
        }

        const EmptyTableList = await GetEmptyTable(Data?.bootValue, Data?.playerCount);

        if (EmptyTableList) {

            await JoinTable(socket, Data);
            return;

        }

        const Table = await CreateNewTable(socket, UserDetails);

        EventEmitter.emit(JOIN_TABLE, { en: JOIN_TABLE, SocketId: socket.id, Data: Table });

    } catch (error: any) {
        Logger('CreateTable Error : ', error);
    }
};

const CreateNewTable = async (socket: Socket, UserDetails: SignUpInterface) => {

    try {

        Logger('CreateNewTable', JSON.stringify({ UserDetails }));

        const Table: TableInterface = {

            tableId: 'TABLE',
            // tableId: cryptoRandomString({ length: 24, type: 'hex' }),
            bootValue: UserDetails.bootValue,
            currentTurn: -1,
            currentRound: -1,
            maxPlayers: UserDetails.playerCount,

            playersArray: [

                {
                    userId: UserDetails.userId,
                    userName: UserDetails.userName,
                    userProfile: UserDetails.userProfile,
                    seatIndex: 0,
                    isLeave: false,
                    isBot: false,
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
            isWinning: false,
            isLeaveLock: false,

        }

        const UserInTable: UserInTableInterface = {

            userId: UserDetails.userId,
            tableId: Table.tableId,
            seatIndex: 0,
            userScore: 0,
            isBot: false,
            isUnoClick: false,
            lastPickCard: '',
            lastThrowCard: '',
            cardArray: [],

        }

        socket.handshake.auth.tableId = Table?.tableId;
        socket.handshake.auth.seatIndex = 0;

        await JoinRoom(socket, Table.tableId);

        UserDetails.tableId = Table.tableId;
        await SetUser(UserDetails.userId, UserDetails);

        await SetEmptyTable(UserDetails.bootValue, UserDetails.playerCount, Table.tableId);

        await SetTable(Table.tableId, Table);

        await SetUserInTable(UserDetails.userId, UserInTable);

        return Table;

    } catch (error: any) {
        Logger('CreateNewTable Error : ', error);
    }
};

export { CreateTable };
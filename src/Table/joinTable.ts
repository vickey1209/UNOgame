import { Socket } from "socket.io";
import { SignUpInterface } from "../Interface/SignUp/SignUpInterface";
import { Logger } from "../Logger/logger";
import { GetEmptyTable, GetTable, GetUser, DeleteEmptyTable, SetTable, SetUser, SetUserInTable } from "../GameRedisOperations/gameRedisOperations";
import { CreateTable } from "./createTable";
import { EventEmitter } from "../Connection/emitter";
import { CONSTANTS } from "../Constants";
import { JoinRoom } from "../SocketRooms/joinRoom";
import { PlayersArrayInterface, TableInterface } from "../Interface/Table/TableInterface";
import { BullTimer } from "../BullTimer";
import { Config } from "../Config";
import { UserInTableInterface } from "../Interface/UserInTable/UserInTableInterface";

const JoinTable = async (socket: Socket, Data: SignUpInterface) => {

    try {

        Logger('JoinTable', JSON.stringify({ Data }));

        const CONFIG = Config();

        const { JOIN_TABLE, GAME_START } = CONSTANTS.EVENTS_NAME;

        const UserDetails: SignUpInterface = await GetUser(Data.userId);

        if (!UserDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_NOT_FOUND) };

        const EmptyTableList: Array<string> = await GetEmptyTable(Data?.bootValue, Data?.playerCount);

        if (!EmptyTableList) {

            await CreateTable(socket, Data);
            return;

        }

        let isSeatAvalilable = false;

        for (let i = 0; i < EmptyTableList.length; i++) {

            isSeatAvalilable = false;

            const ArrayLength = EmptyTableList[0].split(':').length;

            let TableDetails = await GetTable(EmptyTableList[0].split(':')[ArrayLength - 1]);

            if (TableDetails) {

                isSeatAvalilable = true;

                if (TableDetails.playersArray.length < TableDetails.maxPlayers) { // * Add Player Data In Table

                    TableDetails = await SeatPlayerOnTable(socket, TableDetails, UserDetails);

                };

                // EventEmitter.emit(JOIN_TABLE, { en: JOIN_TABLE, SocketId: socket.id, Data: TableDetails });

                await JoinRoom(socket, TableDetails.tableId);

                if (TableDetails.playersArray.length === TableDetails.maxPlayers) {

                    EventEmitter.emit(JOIN_TABLE, { en: JOIN_TABLE, SocketId: TableDetails.tableId, Data: TableDetails });

                    await DeleteEmptyTable(TableDetails.bootValue, TableDetails.maxPlayers, TableDetails.tableId);

                    const ResData = { timer: CONFIG.GamePlay.GAME_START_TIMER };

                    EventEmitter.emit(GAME_START, { en: GAME_START, Data: ResData, RoomId: TableDetails.tableId });

                    await BullTimer.AddJob.CollectBootValue(TableDetails.tableId);

                }
            }
        }

    } catch (error: any) {
        Logger('JoinTable Error : ', error);
    };
};

const SeatPlayerOnTable = async (socket: Socket, TableDetails: TableInterface, UserDetails: SignUpInterface) => {

    try {

        Logger('SeatPlayerOnTable', JSON.stringify({ TableDetails, UserDetails }));

        const { NEW_USER } = CONSTANTS.EVENTS_NAME;

        const NumberOfSeatAvailable = [];

        for (let i = 0; i < TableDetails.maxPlayers; i++) { NumberOfSeatAvailable.push(i); };

        for (let i = 0; i < TableDetails.playersArray.length; i++) {

            const isSeatAvailable = NumberOfSeatAvailable.indexOf(TableDetails.playersArray[i].seatIndex);

            if (isSeatAvailable !== -1) { NumberOfSeatAvailable.splice(isSeatAvailable, 1); };

        }

        const PlayerForPlayerArray: PlayersArrayInterface = {

            userId: UserDetails.userId,
            userName: UserDetails.userName,
            userProfile: UserDetails.userProfile,
            seatIndex: NumberOfSeatAvailable[0],
            isLeave: false,
            isBot: false,

        }

        const UserInTable: UserInTableInterface = {

            userId: UserDetails.userId,
            tableId: TableDetails.tableId,
            seatIndex: NumberOfSeatAvailable[0],
            userScore: 0,
            isBot: false,
            isUnoClick: false,
            lastPickCard: '',
            lastThrowCard: '',
            cardArray: [],

        }

        socket.handshake.auth.tableId = TableDetails?.tableId;
        socket.handshake.auth.seatIndex = NumberOfSeatAvailable[0];

        TableDetails.playersArray.push(PlayerForPlayerArray);

        if (TableDetails.playersArray.length === TableDetails.maxPlayers) {

            TableDetails.isGameStart = true;
            TableDetails.isLeaveLock = true;

        }

        UserDetails.tableId = TableDetails.tableId;
        await SetUser(UserDetails.userId, UserDetails);

        await SetTable(TableDetails.tableId, TableDetails);

        await SetUserInTable(UserDetails.userId, UserInTable);

        // EventEmitter.emit(NEW_USER, { en: NEW_USER, Data: PlayerForPlayerArray, RoomId: TableDetails.tableId });

        return TableDetails;

    } catch (error: any) {
        Logger('SeatPlayerOnTable Error : ', error);
    };
};

export { JoinTable };
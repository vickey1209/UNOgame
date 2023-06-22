import { Socket } from "socket.io";
import { SignUpInterface } from "../Interface/SignUp/SignUpInterface";
import { Logger } from "../Logger/logger";
import { GetUser, SetUser } from "../GameRedisOperations/gameRedisOperations";
import { EventEmitter } from "../Connection/emitter";
import { ApplyLock, RemoveLock } from "../Connection/redlock";
import { CONSTANTS } from "../Constants";
import { CreateTable } from "../Table/createTable";

const SignUp = async (en: string, socket: Socket, Data: SignUpInterface) => {

    const Path = 'SignUp';

    const { SIGNUP, ERROR } = CONSTANTS.EVENTS_NAME;
    const { LOCK, EMPTY_TABLE } = CONSTANTS.REDIS_COLLECTION;

    const MatchMakingId = `${LOCK}:${EMPTY_TABLE}:${Data?.bootValue}:${Data?.playerCount}`;

    const MatchMakingLock = await ApplyLock(Path, MatchMakingId);

    try {

        Logger('SignUp', JSON.stringify({ Data }));

        if (!Data?.bootValue || !Data?.playerCount || !Data?.userId) {
            return EventEmitter.emit(ERROR, { en: ERROR, SocketId: socket.id, Data: { Message: "Provide Valid Data !" } });
        }

        socket.handshake.auth.userId = Data?.userId;
        socket.handshake.auth.playerCount = Data?.playerCount;
        socket.handshake.auth.bootValue = Data?.bootValue;

        const UserDetails: SignUpInterface = await GetUser(Data.userId);

        if (UserDetails) {

            const UserData = await UpdateUser(socket, Data, UserDetails);
            // EventEmitter.emit(SIGNUP, { en: SIGNUP, SocketId: socket.id, Data: UserData });

            await CreateTable(socket, Data);

        } else {

            const UserData = await NewUser(socket, Data);
            // EventEmitter.emit(SIGNUP, { en: SIGNUP, SocketId: socket.id, Data: UserData });

            await CreateTable(socket, Data);

        };

    } catch (error: any) {

        Logger('SignUp Error : ', error);

    } finally {

        await RemoveLock(Path, MatchMakingLock);

    }
};

const NewUser = async (socket: Socket, Data: SignUpInterface) => {

    try {

        Logger("NewUser", JSON.stringify({ Data }));

        const {

            userId,
            userName,
            userProfile,
            chips,
            bootValue,
            playerCount

        } = Data;

        const NewUserData = {

            userId,
            userName: userName,
            userProfile,
            chips,
            socketId: socket.id,
            tableId: '',
            bootValue: bootValue,
            playerCount

        }

        const User = await SetUser(userId, NewUserData);

        if (User === 'OK') return NewUserData;

    } catch (error: any) {
        Logger('NewUser Error : ', error);
    }
}


const UpdateUser = async (socket: Socket, Data: SignUpInterface, AvailableUser: SignUpInterface) => {

    try {

        Logger("UpdateUser", JSON.stringify({ AvailableUser, Data }));

        const {

            userId,
            userName,
            userProfile,
            chips,
            bootValue,
            playerCount

        } = Data;

        const UpdateUserData = {

            userId,
            userName,
            userProfile,
            chips,
            socketId: socket.id,
            tableId: AvailableUser.tableId,
            bootValue,
            playerCount

        }

        const User = await SetUser(userId, UpdateUserData);

        if (User === 'OK') return UpdateUserData;

    } catch (error: any) {
        Logger('UpdateUser Error : ', error);
    }
}

export { SignUp };
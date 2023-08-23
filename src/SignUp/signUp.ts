import { Socket } from "socket.io";
import { SignUpInterface } from "../Interface/SignUp/SignUpInterface";
import { ErrorLogger, Logger } from "../Logger/logger";
import { GetUser, SetUser } from "../GameRedisOperations/gameRedisOperations";
import { EventEmitter } from "../Connection/emitter";
import { ApplyLock, RemoveLock } from "../Connection/redlock";
import { CONSTANTS } from "../Constants";
import { CreateTable } from "../Table/createTable";
import { RejoinTable } from "../Table/rejoinTable";
import { BullTimer } from "../BullTimer";
import { VALIDATOR } from "../Validation";

const SignUp = async (en: string, socket: any, Data: SignUpInterface) => {

    const Path = 'SignUp';

    const { SIGNUP, ERROR_POPUP } = CONSTANTS.EVENTS_NAME;
    const { LOCK, EMPTY_TABLE } = CONSTANTS.REDIS_COLLECTION;

    const MatchMakingId = `${LOCK}:${EMPTY_TABLE}:${Data?.bootValue}:${Data?.playerCount}`;

    const MatchMakingLock = await ApplyLock(Path, MatchMakingId);

    try {

        await Logger('SignUp', JSON.stringify({ Data }));

        const ValidaionError = await VALIDATOR.SignUpValidation(Data);

        if (ValidaionError) {
            return EventEmitter.emit(ERROR_POPUP, { en: ERROR_POPUP, SocketId: socket.id, Data: { Message: ValidaionError } });
        };

        socket.handshake.auth.userId = Data?.userId;
        socket.handshake.auth.playerCount = Data?.playerCount;
        socket.handshake.auth.bootValue = Data?.bootValue;

        const UserDetails = await GetUser(Data.userId);

        await BullTimer.CancelJob.CancelDisconnectUser(Data.userId);

        if (UserDetails) {

            const UserData = await UpdateUser(socket, Data, UserDetails);
            // EventEmitter.emit(SIGNUP, { en: SIGNUP, SocketId: socket.id, Data: UserData });

            if (!UserData) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_NOT_FOUND); };

            await RejoinTable(socket, UserData);

        } else {

            const UserData = await NewUser(socket, Data);
            // EventEmitter.emit(SIGNUP, { en: SIGNUP, SocketId: socket.id, Data: UserData });

            if (!UserData) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_NOT_FOUND); };

            await CreateTable(socket, UserData);

        };

    } catch (error: any) {

        await ErrorLogger('SignUp Error : ', error);

    } finally {

        await RemoveLock(Path, MatchMakingLock);

    };
};

const NewUser = async (socket: Socket, Data: SignUpInterface) => {

    try {

        await Logger("NewUser", JSON.stringify({ Data }));

        // const {

        //     userId,
        //     userName,
        //     userProfile,
        //     chips,
        //     bootValue,
        //     playerCount,
        //     isBot

        // } = Data;

        const NewUserData: SignUpInterface = {

            userId: Data.userId,
            userName: Data.userName,
            userProfile: Data.userProfile,
            chips: Data.chips,
            socketId: socket.id,
            tableId: '',
            bootValue: Data.bootValue,
            playerCount: Data.playerCount,
            isBot: Data.isBot

        };

        const User = await SetUser(Data.userId, NewUserData);

        if (User === 'OK') return NewUserData;

    } catch (error: any) {
        await ErrorLogger('NewUser Error : ', error);
    };
};


const UpdateUser = async (socket: Socket, Data: SignUpInterface, AvailableUser: SignUpInterface) => {

    try {

        await Logger("UpdateUser", JSON.stringify({ AvailableUser, Data }));

        // const {

        //     userId,
        //     userName,
        //     userProfile,
        //     chips,
        //     bootValue,
        //     playerCount,
        //     isBot,

        // } = Data;

        const UpdateUserData: SignUpInterface = {

            userId: Data.userId,
            userName: Data.userName,
            userProfile: Data.userProfile,
            chips: Data.chips,
            socketId: socket.id,
            tableId: AvailableUser.tableId,
            bootValue: Data.bootValue,
            playerCount: Data.playerCount,
            isBot: Data.isBot

        };

        const User = await SetUser(Data.userId, UpdateUserData);

        if (User === 'OK') return UpdateUserData;

    } catch (error: any) {
        await ErrorLogger('UpdateUser Error : ', error);
    };
};

export { SignUp };
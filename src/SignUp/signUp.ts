import { Socket } from "socket.io";
import { SignUpInterface, UserInterface } from "../Interface/SignUp/SignUpInterface";
import { ErrorLogger, Logger } from "../Logger/logger";
import { GetUser, SetUser } from "../GameRedisOperations/gameRedisOperations";
import { EventEmitter } from "../Connection/emitter";
import { ApplyLock, RemoveLock } from "../Connection/redlock";
import { CONSTANTS } from "../Constants";
import { CreateTable } from "../Table/createTable";
import { RejoinTable } from "../Table/rejoinTable";
import { BullTimer } from "../BullTimer";
import { VALIDATOR } from "../Validation";

const SignUp = async (en: string, socket: any, Data: any) => {

    const Path = 'SignUp';

    const { SIGNUP, ERROR_POPUP } = CONSTANTS.EVENTS_NAME;
    const { LOCK, EMPTY_TABLE } = CONSTANTS.REDIS_COLLECTION;

    const MatchMakingId = `${LOCK}:${EMPTY_TABLE}:${Data?.bootValue}:${Data?.playerCount}`;

    const MatchMakingLock = await ApplyLock(Path, MatchMakingId);

    try {

        await Logger('SignUp', JSON.stringify({ Data }));

        const WinZoSignUpData = Data.winzoApiData;

        // console.log(WinZoSignUpData);

        // const ValidaionError = await VALIDATOR.SignUpValidation(Data);

        // if (ValidaionError) {
        //     return EventEmitter.emit(ERROR_POPUP, { en: ERROR_POPUP, SocketId: socket.id, Data: { Message: ValidaionError } });
        // };

        socket.handshake.auth.userId = WinZoSignUpData?.localPlayerData?.playerId;
        socket.handshake.auth.playerCount = WinZoSignUpData?.localPlayerData?.playerCount;
        socket.handshake.auth.tableId = WinZoSignUpData?.localPlayerData?.tableId;

        const UserDetails = await GetUser(WinZoSignUpData?.localPlayerData?.playerId);

        await BullTimer.CancelJob.CancelDisconnectUser(WinZoSignUpData?.localPlayerData?.playerId);

        if (UserDetails) {

            console.log('Sign User Exist !!!!!!!!!!');

            const UserData = await UpdateUser(socket, WinZoSignUpData, UserDetails);
            // EventEmitter.emit(SIGNUP, { en: SIGNUP, SocketId: socket.id, Data: UserData });

            if (!UserData) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_NOT_FOUND); };

            await RejoinTable(socket, UserData);

        } else {

            console.log('Sign User Not Exist !!!!!!!!!!');

            const UserData = await NewUser(socket, WinZoSignUpData);
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

const NewUser = async (socket: Socket, Data: any) => {

    try {

        await Logger("NewUser", JSON.stringify({ Data }));

        const NewUserData: any = {

            userId: Data?.localPlayerData?.playerId,
            userName: Data?.localPlayerData?.playerName,
            userProfile: Data?.localPlayerData?.playerProfilePic,
            socketId: socket.id,
            tableId: Data?.tableId,
            playerCount: Data?.playerCount,
            isBot: Data?.localPlayerData?.isAI

        };

        const User = await SetUser(NewUserData.userId, NewUserData);

        if (User === 'OK') return NewUserData;

    } catch (error: any) {
        await ErrorLogger('NewUser Error : ', error);
    };
};

const UpdateUser = async (socket: Socket, Data: any, AvailableUser: any) => {

    try {

        await Logger("UpdateUser", JSON.stringify({ AvailableUser, Data }));

        const UpdateUserData: UserInterface = {

            userId: Data?.localPlayerData?.playerId,
            userName: Data?.localPlayerData?.playerName,
            userProfile: Data?.localPlayerData?.playerProfilePic,
            socketId: socket.id,
            tableId: Data?.tableId,
            playerCount: Data?.playerCount,
            isBot: Data?.localPlayerData?.isAI

        };

        const User = await SetUser(UpdateUserData.userId, UpdateUserData);

        if (User === 'OK') return UpdateUserData;

    } catch (error: any) {
        await ErrorLogger('UpdateUser Error : ', error);
    };
};

export { SignUp };
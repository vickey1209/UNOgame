import { Socket } from "socket.io";
import { UserInterface, WinZoSignUpInterface, WinzoApiDataInterface } from "../Interface/SignUp/SignUpInterface";
import { ErrorLogger, Logger } from "../Logger/logger";
import { GetUser, SetUser } from "../GameRedisOperations/gameRedisOperations";
import { EventEmitter } from "../Connection/emitter";
import { ApplyLock, RemoveLock } from "../Connection/redlock";
import { CONSTANTS } from "../Constants";
import { CreateTable } from "../Table/createTable";
import { RejoinTable } from "../Table/rejoinTable";
import { BullTimer } from "../BullTimer";
import { VALIDATOR } from "../Validation";

const SignUp = async (en: string, socket: any, Data: WinZoSignUpInterface) => {
console.log("signnnnnnnnnnnnnnnnnnn");

    const Path = 'SignUp';

    const { SIGNUP, ERROR_POPUP } = CONSTANTS.EVENTS_NAME;
    const { LOCK, EMPTY_TABLE } = CONSTANTS.REDIS_COLLECTION;

    const MatchMakingId = `${LOCK}:${EMPTY_TABLE}:${Data?.winzoApiData?.playerCount}`;

    const MatchMakingLock = await ApplyLock(Path, MatchMakingId);

    try {

        await Logger('SignUp....=>', JSON.stringify({ Data }));

        const WinZoSignUpData = Data?.winzoApiData;

        // const ValidaionError = await VALIDATOR.SignUpValidation(Data);

        // if (ValidaionError) {
        //     return EventEmitter.emit(ERROR_POPUP, { en: ERROR_POPUP, SocketId: socket.id, Data: { Message: ValidaionError } });
        // };

        socket.handshake.auth.tableId = WinZoSignUpData?.tableId;
        socket.handshake.auth.playerCount = WinZoSignUpData?.playerCount;
        socket.handshake.auth.userId = WinZoSignUpData?.localPlayerData?.playerId;

        const UserDetails = await GetUser(WinZoSignUpData?.localPlayerData?.playerId);

        await BullTimer.CancelJob.CancelDisconnectUser(WinZoSignUpData?.localPlayerData?.playerId);

        if (UserDetails) {

            const UserData = await UpdateUser(socket, WinZoSignUpData, UserDetails);
            // EventEmitter.emit(SIGNUP, { en: SIGNUP, SocketId: socket.id, Data: UserData });

            if (!UserData) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_NOT_FOUND); };

            await RejoinTable(socket, WinZoSignUpData, UserData);

        } else {

            const UserData = await NewUser(socket, WinZoSignUpData);
            // EventEmitter.emit(SIGNUP, { en: SIGNUP, SocketId: socket.id, Data: UserData });

            if (!UserData) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_NOT_FOUND); };

            await CreateTable(socket, WinZoSignUpData, UserData);

        };

    } catch (error: any) {

        await ErrorLogger('SignUp Error : ', error);

    } finally {

        await RemoveLock(Path, MatchMakingLock);

    };
};

const NewUser = async (socket: Socket, Data: WinzoApiDataInterface) => {

    try {

        await Logger("NewUser", JSON.stringify({ Data }));

        const NewUserData: UserInterface = {

            userId: Data?.localPlayerData?.playerId,
            userName: Data?.localPlayerData?.playerName,
            userProfile: Data?.localPlayerData?.playerProfilePic,
            socketId: socket.id,
            tableId: '',
            playerCount: Data?.playerCount,
            isBot: Data?.localPlayerData?.isAI

        };

        const User = await SetUser(NewUserData.userId, NewUserData);

        if (User === 'OK') return NewUserData;

    } catch (error: any) {
        await ErrorLogger('NewUser Error : ', error);
    };
};

const UpdateUser = async (socket: Socket, Data: WinzoApiDataInterface, AvailableUser: UserInterface) => {

    try {

        await Logger("UpdateUser", JSON.stringify({ AvailableUser, Data }));

        const UpdateUserData: UserInterface = {

            userId: Data?.localPlayerData?.playerId,
            userName: Data?.localPlayerData?.playerName,
            userProfile: Data?.localPlayerData?.playerProfilePic,
            socketId: socket.id,
            tableId: AvailableUser?.tableId,
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
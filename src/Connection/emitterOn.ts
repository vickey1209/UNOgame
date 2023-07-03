import { io } from './socket';
import { CONSTANTS } from '../Constants';
import { Logger } from '../Logger/logger';
import { EventEmitter } from './emitter';

const SendToSocket = async (EVENT: string, data: any) => {

    try {

        let { en, SocketId, Data } = data;

        Logger("SendToSocket", JSON.stringify({ EVENT, Data }));

        io.to(SocketId).emit(EVENT, JSON.stringify({ en, Data }));

    } catch (error: any) {
        Logger('SendToSocket Error : ', error);
    };
};

const SendToRoom = async (EVENT: string, data: any) => {

    try {

        let { en, RoomId, Data } = data;

        Logger("SendToRoom", JSON.stringify({ EVENT, Data }));

        io.to(RoomId).emit(EVENT, JSON.stringify({ en, Data }));

    } catch (error: any) {
        Logger('SendToRoom Error : ', error);
    };
};

const EmitterON = () => {

    try {

        console.log(`EmitterON Done !`);

        const {

            TEST,
            DEFAULT,
            ERROR,
            SIGNUP,
            JOIN_TABLE,
            NEW_USER,
            GAME_START,
            COLLECT_BOOT,
            MY_CARDS,
            TURN_INFO,
            THROW_CARD,
            PICK_CARD,
            USERS_SCORE,
            ROUND_START,
            ROUND_SCORE,
            LEAVE_TABLE,
            UNO,


        } = CONSTANTS.EVENTS_NAME;

        EventEmitter.on(TEST, async (data) => {
            await SendToSocket(TEST, data);
        });

        EventEmitter.on(DEFAULT, async (data) => {
            await SendToSocket(DEFAULT, data);
        });

        EventEmitter.on(ERROR, async (data) => {
            await SendToSocket(ERROR, data);
        });

        EventEmitter.on(SIGNUP, async (data) => {
            await SendToSocket(SIGNUP, data);
        });

        EventEmitter.on(JOIN_TABLE, async (data) => {
            await SendToSocket(JOIN_TABLE, data);
        });

        EventEmitter.on(NEW_USER, async (data) => {
            await SendToRoom(NEW_USER, data);
        });

        EventEmitter.on(GAME_START, async (data) => {
            await SendToRoom(GAME_START, data);
        });

        EventEmitter.on(COLLECT_BOOT, async (data) => {
            await SendToRoom(COLLECT_BOOT, data);
        });

        EventEmitter.on(MY_CARDS, async (data) => {
            await SendToSocket(MY_CARDS, data);
        });

        EventEmitter.on(TURN_INFO, async (data) => {
            await SendToRoom(TURN_INFO, data);
        });

        EventEmitter.on(THROW_CARD, async (data) => {
            await SendToRoom(THROW_CARD, data);
        });

        EventEmitter.on(PICK_CARD, async (data) => {
            await SendToRoom(PICK_CARD, data);
        });

        EventEmitter.on(USERS_SCORE, async (data) => {
            await SendToRoom(USERS_SCORE, data);
        });

        EventEmitter.on(ROUND_START, async (data) => {
            await SendToRoom(ROUND_START, data);
        });

        EventEmitter.on(ROUND_SCORE, async (data) => {
            await SendToRoom(ROUND_SCORE, data);
        });

        EventEmitter.on(LEAVE_TABLE, async (data) => {
            await SendToRoom(LEAVE_TABLE, data);
        });

        EventEmitter.on(UNO, async (data) => {
            await SendToRoom(UNO, data);
        });

    } catch (error: any) {
        Logger('EmitterON Error', error);
    };
};

export { EmitterON };
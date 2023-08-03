import { io } from './socket';
import { CONSTANTS } from '../Constants';
import { ErrorLogger, Logger } from '../Logger/logger';
import { EventEmitter } from './emitter';

const SendToSocket = async (EVENT: string, data: any) => {

    try {

        const { en, SocketId, Data } = data;

        await Logger("SendToSocket", JSON.stringify({ EVENT, Data }));

        io.to(SocketId).emit(EVENT, JSON.stringify({ en, Data }));

    } catch (error: any) {
        await ErrorLogger('SendToSocket Error : ', error);
    };
};

const SendToRoom = async (EVENT: string, data: any) => {

    try {

        const { en, RoomId, Data } = data;

        await Logger("SendToRoom", JSON.stringify({ EVENT, Data }));

        io.to(RoomId).emit(EVENT, JSON.stringify({ en, Data }));

    } catch (error: any) {
        await ErrorLogger('SendToRoom Error : ', error);
    };
};

const EmitterON = async () => {

    try {

        console.log(`EmitterON Done !`);

        const {

            UNO,
            TEST,
            ALERT,
            SIGNUP,
            REJOIN,
            DEFAULT,
            MY_CARDS,
            NEW_USER,
            TIMES_UP,
            PICK_CARD,
            TURN_INFO,
            HEART_BEAT,
            JOIN_TABLE,
            GAME_START,
            THROW_CARD,
            USERS_SCORE,
            ROUND_START,
            ROUND_SCORE,
            LEAVE_TABLE,
            TURN_MISSED,
            ERROR_POPUP,
            COLLECT_BOOT,
            CARD_SCORING,
            ROUND_HISTORY,
            WINNER_DECLARE,

        } = CONSTANTS.EVENTS_NAME;

        // * SendToSocket ....

        EventEmitter.on(TEST, async (data) => { await SendToSocket(TEST, data); });

        EventEmitter.on(ALERT, async (data) => { await SendToSocket(ALERT, data); });

        EventEmitter.on(REJOIN, async (data) => { await SendToSocket(REJOIN, data); });

        EventEmitter.on(SIGNUP, async (data) => { await SendToSocket(SIGNUP, data); });

        EventEmitter.on(DEFAULT, async (data) => { await SendToSocket(DEFAULT, data); });

        EventEmitter.on(MY_CARDS, async (data) => { await SendToSocket(MY_CARDS, data); });

        EventEmitter.on(JOIN_TABLE, async (data) => { await SendToSocket(JOIN_TABLE, data); });

        EventEmitter.on(HEART_BEAT, async (data) => {

            const { en, SocketId, Data } = data;

            io.to(SocketId).emit(HEART_BEAT, JSON.stringify({ en, Data }));

        });

        // EventEmitter.on(HEART_BEAT, async (data) => { await SendToSocket(HEART_BEAT, data); });

        EventEmitter.on(ERROR_POPUP, async (data) => { await SendToSocket(ERROR_POPUP, data); });

        EventEmitter.on(CARD_SCORING, async (data) => { await SendToSocket(CARD_SCORING, data); });

        EventEmitter.on(ROUND_HISTORY, async (data) => { await SendToSocket(ROUND_HISTORY, data); });

        // * SendToSocket ....


        // * SendToRoom ....

        EventEmitter.on(UNO, async (data) => { await SendToRoom(UNO, data); });

        EventEmitter.on(TIMES_UP, async (data) => { await SendToRoom(TIMES_UP, data); });

        EventEmitter.on(NEW_USER, async (data) => { await SendToRoom(NEW_USER, data); });

        EventEmitter.on(PICK_CARD, async (data) => { await SendToRoom(PICK_CARD, data); });

        EventEmitter.on(TURN_INFO, async (data) => { await SendToRoom(TURN_INFO, data); });

        EventEmitter.on(THROW_CARD, async (data) => { await SendToRoom(THROW_CARD, data); });

        EventEmitter.on(GAME_START, async (data) => { await SendToRoom(GAME_START, data); });

        EventEmitter.on(USERS_SCORE, async (data) => { await SendToRoom(USERS_SCORE, data); });

        EventEmitter.on(ROUND_START, async (data) => { await SendToRoom(ROUND_START, data); });

        EventEmitter.on(ROUND_SCORE, async (data) => { await SendToRoom(ROUND_SCORE, data); });

        EventEmitter.on(LEAVE_TABLE, async (data) => { await SendToRoom(LEAVE_TABLE, data); });

        EventEmitter.on(TURN_MISSED, async (data) => { await SendToRoom(TURN_MISSED, data); });

        EventEmitter.on(COLLECT_BOOT, async (data) => { await SendToRoom(COLLECT_BOOT, data); });

        EventEmitter.on(WINNER_DECLARE, async (data) => { await SendToRoom(WINNER_DECLARE, data); });

        // * SendToRoom ....

    } catch (error: any) {
        await Logger('EmitterON Error', error);
    };
};

export { EmitterON };
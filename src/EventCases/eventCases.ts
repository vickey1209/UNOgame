import { Socket } from "socket.io";
import { Logger } from "../Logger/logger";
import { EventEmitter } from "../Connection/emitter";
import { SignUp } from "../SignUp/signUp";
import { CONSTANTS } from '../Constants';
import { ThrowCard } from "../ThrowCard/throwCard";
import { PickCard } from "../PickCard/pickCard";
import { KeepCard } from "../KeepCard/keepCard";
import { LeaveTable } from "../Table/leaveTable";
import { Uno } from "../Uno/uno";
import { RoundHistory } from "../RoundHistory/roundHistory";
import { WinConfirmation } from "../WinConfirmation/winConfirmation";

const EventCases = async (socket: Socket) => {

    try {

        socket.onAny(async (EventName, Front_Side_Data, ack) => {

            const {

                UNO,
                TEST,
                SIGNUP,
                DEFAULT,
                PICK_CARD,
                KEEP_CARD,
                HEART_BEAT,
                THROW_CARD,
                LEAVE_TABLE,
                ROUND_HISTORY,
                WIN_CONFIRMATION,

            } = CONSTANTS.EVENTS_NAME;

            if (typeof Front_Side_Data === "string") { Front_Side_Data = JSON.parse(Front_Side_Data); };

            const Data = Front_Side_Data.data;

            // await Logger('EventCases SocketData', JSON.stringify({ SocketData: socket.handshake.auth }));

            switch (EventName) {

                case TEST:
                    await Logger('EventCases TEST', JSON.stringify({ Data }));
                    EventEmitter.emit(TEST, { en: EventName, SocketId: socket.id, Data });
                    break;

                case HEART_BEAT:
                    // await Logger('EventCases HEART_BEAT', JSON.stringify({ Data }));
                    EventEmitter.emit(HEART_BEAT, { en: EventName, SocketId: socket.id, Data });
                    break;

                case SIGNUP:
                    await Logger('EventCases SIGNUP...', JSON.stringify({ Data }));
                    await SignUp(EventName, socket, Data);
                    break;

                case THROW_CARD:
                    await Logger('EventCases THROW_CARD', JSON.stringify({ Data }));
                    await ThrowCard(EventName, socket, Data);
                    break;

                case PICK_CARD:
                    await Logger('EventCases PICK_CARD', JSON.stringify({ Data }));
                    await PickCard(EventName, socket, Data);
                    break;

                case KEEP_CARD:
                    await Logger('EventCases KEEP_CARD', JSON.stringify({ Data }));
                    await KeepCard(EventName, socket, Data);
                    break;

                case LEAVE_TABLE:
                    await Logger('EventCases LEAVE_TABLE', JSON.stringify({ Data }));
                    await LeaveTable(EventName, socket, Data);
                    break;

                case UNO:
                    await Logger('EventCases UNO', JSON.stringify({ Data }));
                    await Uno(EventName, socket, Data);
                    break;

                case ROUND_HISTORY:
                    await Logger('EventCases ROUND_HISTORY', JSON.stringify({ Data }));
                    await RoundHistory(EventName, socket, Data);
                    break;

                case WIN_CONFIRMATION:
                    await Logger('EventCases WIN_CONFIRMATION', JSON.stringify({ Data }));
                    await WinConfirmation(EventName, socket, Data);
                    break;

                default:
                    await Logger("EventCases Default", JSON.stringify({ Data }));
                    EventEmitter.emit(DEFAULT, { en: EventName, SocketId: socket.id, Data: { Message: CONSTANTS.COMMON.UNKNOWN_EVENT } });
                    break;

            };

        });

    } catch (error) {
        console.log('EventCases Error : ', error);
    };
};

export { EventCases };
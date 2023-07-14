
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

const EventCases = async (socket: Socket) => {

    try {

        socket.onAny((EventName, Front_Side_Data, ack) => {

            const {

                TEST,
                DEFAULT,
                SIGNUP,
                THROW_CARD,
                PICK_CARD,
                KEEP_CARD,
                LEAVE_TABLE,
                UNO,
                ROUND_HISTORY,

            } = CONSTANTS.EVENTS_NAME;

            if (typeof Front_Side_Data === "string") {
                Front_Side_Data = JSON.parse(Front_Side_Data);
            };

            const Data = Front_Side_Data.data;

            switch (EventName) {

                case TEST:
                    Logger('EventCases TEST', JSON.stringify({ Data }));
                    EventEmitter.emit(TEST, { en: EventName, SocketId: socket.id, Data });
                    break;

                case SIGNUP:
                    Logger('EventCases SIGNUP', JSON.stringify({ Data }));
                    SignUp(EventName, socket, Data);
                    break;

                case THROW_CARD:
                    Logger('EventCases THROW_CARD', JSON.stringify({ Data }));
                    ThrowCard(EventName, socket, Data);
                    break;

                case PICK_CARD:
                    Logger('EventCases PICK_CARD', JSON.stringify({ Data }));
                    PickCard(EventName, socket, Data);
                    break;

                case KEEP_CARD:
                    Logger('EventCases KEEP_CARD', JSON.stringify({ Data }));
                    KeepCard(EventName, socket, Data);
                    break;

                case LEAVE_TABLE:
                    Logger('EventCases LEAVE_TABLE', JSON.stringify({ Data }));
                    LeaveTable(EventName, socket, Data);
                    break;

                case UNO:
                    Logger('EventCases UNO', JSON.stringify({ Data }));
                    Uno(EventName, socket, Data);
                    break;

                case ROUND_HISTORY:
                    Logger('EventCases ROUND_HISTORY', JSON.stringify({ Data }));
                    RoundHistory(EventName, socket, Data);
                    break;

                default:
                    Logger("EventCases Default", JSON.stringify({ Data }));
                    EventEmitter.emit(DEFAULT, { en: EventName, SocketId: socket.id, Data: { "Message": "Unknown Event" } });
                    break;

            };
        });

    } catch (error) {
        console.log('EventCases Error : ', error);
    };
};

export { EventCases };
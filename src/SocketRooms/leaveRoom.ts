import { Socket } from "socket.io"
import { Logger } from "../Logger/logger";

const LeaveRoom = async (socket: Socket, RooId: string) => { // * Leave Socket Room

    try {

        Logger("LeaveRoom", RooId);

        await socket.leave(RooId);

    } catch (error: any) {
        Logger('LeaveRoom Error : ', error);
    };
};

export { LeaveRoom };
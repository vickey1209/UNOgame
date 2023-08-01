import { Socket } from "socket.io"
import { Logger } from "../Logger/logger";
import { CONSTANTS } from "../Constants";

const LeaveRoom = async (socket: Socket, RooId: string) => { // * Leave Socket Room

    try {

        await Logger("LeaveRoom", RooId);

        if (socket && socket?.leave) { await socket.leave(RooId); }
        else { throw new Error(CONSTANTS.ERROR_MESSAGES.SOCKET_ROOM_ERROR) };

    } catch (error: any) {
        await Logger('LeaveRoom Error : ', error);
    };
};

export { LeaveRoom };
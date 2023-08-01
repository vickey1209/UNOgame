import { Socket } from "socket.io"
import { Logger } from "../Logger/logger";
import { CONSTANTS } from "../Constants";

const JoinRoom = async (socket: Socket, RooId: string) => { // * Join Socket Room

    try {

        await Logger("JoinRoom", RooId);

        if (socket && socket?.join) { await socket.join(RooId); }
        else { throw new Error(CONSTANTS.ERROR_MESSAGES.SOCKET_ROOM_ERROR) };

    } catch (error: any) {
        await Logger('JoinRoom Error : ', error);
    };
};

export { JoinRoom };
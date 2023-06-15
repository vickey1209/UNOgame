import { Socket } from "socket.io"
import { Logger } from "../Logger/logger";

const JoinRoom = async (socket: Socket, RooId: string) => { // * Join Socket Room

    try {

        Logger("JoinRoom", RooId);

        await socket.join(RooId);

    } catch (error: any) {
        Logger('JoinRoom Error : ', error);
    }
}

export { JoinRoom };
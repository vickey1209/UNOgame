import { Socket } from "socket.io";
import { Logger } from "../Logger/logger";
import { SignUpInterface } from "../Interface/SignUp/SignUpInterface";
import { GetUser, SetUser } from "../GameRedisOperations/gameRedisOperations";

const WinConfirmation = async (en: string, socket: Socket, Data: any) => {

    try {

        Logger("WinConfirmation", JSON.stringify({ Data, SocketData: socket.handshake.auth }));

        const userId = socket.handshake.auth?.userId;

        let UserDetails: SignUpInterface = await GetUser(userId);

        if (UserDetails) {

            UserDetails.tableId = '';

            await SetUser(userId, UserDetails);

        };

    } catch (error: any) {
        Logger('WinConfirmation Error : ', error);
    };
};

export { WinConfirmation };
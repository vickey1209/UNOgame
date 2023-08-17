import { Socket } from "socket.io";
import { ErrorLogger, Logger } from "../Logger/logger";
import { DeleteUser, GetUser, SetUser } from "../GameRedisOperations/gameRedisOperations";

const WinConfirmation = async (en: string, socket: Socket, Data: any) => {

    try {

        await Logger("WinConfirmation", JSON.stringify({ Data, SocketData: socket.handshake.auth }));

        const userId = socket.handshake.auth?.userId;

        let UserDetails = await GetUser(userId);

        if (UserDetails) {

            UserDetails.tableId = '';

            await SetUser(userId, UserDetails);

            // await DeleteUser(UserDetails.userId);

        };

    } catch (error: any) {
        await ErrorLogger('WinConfirmation Error : ', error);
    };
};

export { WinConfirmation };
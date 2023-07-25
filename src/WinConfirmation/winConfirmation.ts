import { Socket } from "socket.io";
import { Logger } from "../Logger/logger";
import { SignUpInterface } from "../Interface/SignUp/SignUpInterface";
import { GetUser, SetUser } from "../GameRedisOperations/gameRedisOperations";

const WinConfirmation = async (en: string, socket: Socket, Data: any) => {

    try {

        Logger("WinConfirmation", JSON.stringify({ Data }));

        let UserDetails: SignUpInterface = await GetUser(Data.userId);

        if (UserDetails) {

            UserDetails.tableId = '';

            await SetUser(Data.userId, UserDetails);

        };

    } catch (error: any) {
        Logger('WinConfirmation Error : ', error);
    };
};

export { WinConfirmation };
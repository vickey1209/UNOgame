import { Logger } from "../Logger/logger";
import { SignUp } from "../SignUp/signUp";

const BotSignUp = async () => {

    try {

        Logger('BotSignUp', JSON.stringify({}));

        const SignUpData = {

            userId: `${Date.now()}`,
            userName: "Bot",
            userProfile: "No",
            chips: 100,
            bootValue: 1,
            playerCount: 3,
            socketId: '',
            tableId: '',
            isBot: true

        };

        let Fake_Socket = {

            id: 'Fake_SocketId',

            handshake: {

                auth: {

                    userId: '',
                    tableId: '',
                    seatIndex: -1,
                    playerCount: 0,
                    bootValue: 0,

                },
            },
        };

        await SignUp('SIGNUP', Fake_Socket, SignUpData);

    } catch (error: any) {
        Logger('BotSignUp Error : ', error);
    };
};

export { BotSignUp };
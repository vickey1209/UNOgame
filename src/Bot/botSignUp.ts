import { ErrorLogger, Logger } from "../Logger/logger";
import { SignUp } from "../SignUp/signUp";

const BotSignUp = async (data:any) => {

    try {

        await Logger('BotSignUp : ', JSON.stringify(data));



        // const SignUpData = data.WinZoSignUpData.WinZoSignUpData.localPlayerData;
        data.WinZoSignUpData.localPlayerData = 
        {  
            "playerName": "Bot",
            "playerId": `Bot_${Date.now()}`,
            "playerProfilePic": "No",
            "isAI": true
        }
        // {

        //     userId: `Bot_${Date.now()}`,
        //     userName: "Bot",
        //     userProfile: "No",
        //     chips: 100,
        //     bootValue:  data.bootValue,
        //     playerCount: data.playerCount,
        //     socketId: '',
        //     tableId: '',
        //     isBot: true

        // };

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

        await SignUp('SIGNUP', Fake_Socket, {winzoApiData:data.WinZoSignUpData});

    } catch (error: any) {
        await ErrorLogger('BotSignUp Error : ', error);
    };
};

export { BotSignUp };

import EVENT from "../constants/event";
import hearBeat from "./hearBeatHandler";
import Logger from "../logger";
import signUpHandler from "./signupHandler";
import leaveTableHandler from "./leaveTableHandler";
import pickFromExtraCardHandler from "./pickFromExtraCardHandler";
import throwCardHandler from "./throwCardHandler";
import { joinTable } from "../services/playTable/joinTable";
import unoClickHandler from "./unoClickHandler";

async function requestHandler(
    this: any,
    [reqEventName, payload, ack]: Array<any>,
    // @ts-ignore
    next
    // socket:any, body:any
) {
    try {

        const socket: any = this;
        const body = typeof payload == 'string' ? JSON.parse(payload) : payload;
        if (reqEventName !== EVENT.HEART_BEAT_SOCKET_EVENT) {
            Logger.info("EVENT : UNITY-SIDE =>>", reqEventName, body)
        }
        let response: any;
        switch (reqEventName) {

            case EVENT.HEART_BEAT_SOCKET_EVENT:
                response = await hearBeat(socket, body.data);
                break;

            case EVENT.SIGN_UP_SOCKET_EVENT: //User signUp 
                let isRejoinOrNewGame = true;
                response = await signUpHandler(socket, body.data, isRejoinOrNewGame, ack);
                Logger.info("Before Join Table : response :: ===>>", response);

                if (response && response && 'tableId' in response && !response['reconnect'])
                    await joinTable(response, socket, false);
                if (response && response['reconnect']) await joinTable(response, socket, true);
                break;

            case EVENT.LEAVE_TABLE_SOCKET_EVENT:
                response = await leaveTableHandler(socket, body.data);
                break;  
                
            case EVENT.PICK_FROM_EXTRA_CARD:
                body.data.isPanelty=false;
                response = await pickFromExtraCardHandler(socket,body.data);
                break    

            case EVENT.THROW_CARD:
                response = await throwCardHandler(socket,body.data);
                break  

            case EVENT.UNO_CLICK:
                response = await unoClickHandler(socket,body.data);
                break  

            default:
                Logger.info("<<====== Default Event :: Call ========>>");
                break;

        };
    } catch (error) {
        Logger.info('requestHandler ::  :==>>> ', error);

    }
}
export = requestHandler;



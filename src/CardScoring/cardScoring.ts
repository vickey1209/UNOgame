import { Logger } from "../Logger/logger";
import { EventEmitter } from "../Connection/emitter";
import { CONSTANTS } from "../Constants";
import { Config } from "../Config";
import { Socket } from "socket.io";

const CardScoring = async (socket: Socket) => {

    try {

        Logger("CardScoring", JSON.stringify({}));

        const CONFIG = Config();

        const { CARD_SCORING } = CONSTANTS.EVENTS_NAME;

        const ResData = {

            zeroPoints: -Math.abs(CONFIG.GamePlay.ZERO_POINT),
            actionPoints: -Math.abs(CONFIG.GamePlay.SKIP_POINT),
            wildCardPoints: -Math.abs(CONFIG.GamePlay.COLOR_CHANGE_POINT),
            wildPlusFourPoints: -Math.abs(CONFIG.GamePlay.PLUS_FOUR_POINT)

        };

        EventEmitter.emit(CARD_SCORING, { en: CARD_SCORING, SocketId: socket.id, Data: ResData });


    } catch (error: any) {
        Logger('CardScoring Error : ', error);
    };
};

export { CardScoring };
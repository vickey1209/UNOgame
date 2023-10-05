import { ErrorLogger, Logger } from "../Logger/logger";
import { EventEmitter } from "../Connection/emitter";
import { CONSTANTS } from "../Constants";
import { Config } from "../Config";
import { Socket } from "socket.io";
import { GetTableConfig } from "../GameRedisOperations/gameRedisOperations";

const CardScoring = async (socket: Socket, tableId: string) => {

    try {

        await Logger("CardScoring", JSON.stringify({ SocketData: socket.handshake.auth }));

        // const CONFIG = Config();

        const { CARD_SCORING } = CONSTANTS.EVENTS_NAME;

        const TableConfigDetails = await GetTableConfig(tableId);

        if (!TableConfigDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_CONFIG_NOT_FOUND) };

        const CardScoringResData = {

            zeroPoints: -Math.abs(TableConfigDetails.ZERO_POINT),
            actionPoints: -Math.abs(TableConfigDetails.SKIP_POINT),
            wildCardPoints: -Math.abs(TableConfigDetails.COLOR_CHANGE_POINT),
            wildPlusFourPoints: -Math.abs(TableConfigDetails.PLUS_FOUR_POINT)

        };

        // const CardScoringResData = {

        //     zeroPoints: -Math.abs(CONFIG.GamePlay.ZERO_POINT),
        //     actionPoints: -Math.abs(CONFIG.GamePlay.SKIP_POINT),
        //     wildCardPoints: -Math.abs(CONFIG.GamePlay.COLOR_CHANGE_POINT),
        //     wildPlusFourPoints: -Math.abs(CONFIG.GamePlay.PLUS_FOUR_POINT)

        // };

        // EventEmitter.emit(CARD_SCORING, { en: CARD_SCORING, SocketId: socket.id, Data: CardScoringResData });
        EventEmitter.emit(CARD_SCORING, { en: CARD_SCORING, SocketId: socket.id, Data: CardScoringResData });

    } catch (error: any) {
        await ErrorLogger('CardScoring Error : ', error);
    };
};

export { CardScoring };
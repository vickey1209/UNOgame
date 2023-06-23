import { Config } from "../Config";
import { EventEmitter } from "../Connection/emitter";
import { CONSTANTS } from "../Constants";
import { GetTable, GetUserInTable } from "../GameRedisOperations/gameRedisOperations";
import { TableInterface } from "../Interface/Table/TableInterface";
import { UserInTableInterface } from "../Interface/UserInTable/UserInTableInterface";
import { Logger } from "../Logger/logger";

const AllUserScore = async (tableId: string) => {

    try {

        Logger("AllUserScore", JSON.stringify({ tableId }));

        const { USERS_SCORE } = CONSTANTS.EVENTS_NAME;

        let ScoreResData: any = { allUserScore: [] };

        let TableDetails: TableInterface = await GetTable(tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        for (let i = 0; i < TableDetails.playersArray.length; i++) {

            let UserInTableDetails: UserInTableInterface = await GetUserInTable(TableDetails.playersArray[i].userId);

            if (!UserInTableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_IN_TABLE_NOT_FOUND) };

            const Score = await CheckUserScore(UserInTableDetails);

            if (!Score) { throw new Error(CONSTANTS.ERROR_MESSAGES.CHECK_SCORE_ERROR) };

            ScoreResData.allUserScore.push({ userScore: Score.totalScore, seatIndex: UserInTableDetails.seatIndex, cardsLength: UserInTableDetails.cardArray.length });

        };

        EventEmitter.emit(USERS_SCORE, { en: USERS_SCORE, RoomId: TableDetails.tableId, Data: ScoreResData });

    } catch (error: any) {
        Logger('AllUserScore Error : ', error);
    };
};

const CheckUserScore = async (UserInTableDetails: UserInTableInterface) => {

    try {

        Logger("CheckUserScore", JSON.stringify({ UserInTableDetails }));

        const CONFIG = Config();

        let totalScore = 0, simpleCardsScore = 0, specialCardsPoint = 0, simpleCards = [], specialCards = [];

        for (let i = 0; i < UserInTableDetails.cardArray.length; i++) {

            if (UserInTableDetails.cardArray[i].split("-")[1] === CONSTANTS.UNO_CARDS.CARDS_TYPE.PLUS_FOUR) {

                totalScore += CONFIG.GamePlay.PUSE_FOUR_POINT;
                specialCardsPoint += CONFIG.GamePlay.PUSE_FOUR_POINT;

                specialCards.push(UserInTableDetails.cardArray[i]);

            } else if (UserInTableDetails.cardArray[i].split("-")[1] === CONSTANTS.UNO_CARDS.CARDS_TYPE.COLOR_CHANGE) {

                totalScore += CONFIG.GamePlay.COLOR_CHANGE_POINT;
                specialCardsPoint += CONFIG.GamePlay.COLOR_CHANGE_POINT;

                specialCards.push(UserInTableDetails.cardArray[i]);

            } else if (UserInTableDetails.cardArray[i].split("-")[1] === CONSTANTS.UNO_CARDS.CARDS_TYPE.PLUS_TWO) {

                totalScore += CONFIG.GamePlay.PUSE_TWO_POINT;
                specialCardsPoint += CONFIG.GamePlay.PUSE_TWO_POINT;

                specialCards.push(UserInTableDetails.cardArray[i]);

            } else if (UserInTableDetails.cardArray[i].split("-")[1] === CONSTANTS.UNO_CARDS.CARDS_TYPE.REVERS) {

                totalScore += CONFIG.GamePlay.REVERS_POINT;
                specialCardsPoint += CONFIG.GamePlay.REVERS_POINT;

                specialCards.push(UserInTableDetails.cardArray[i]);

            } else if (UserInTableDetails.cardArray[i].split("-")[1] === CONSTANTS.UNO_CARDS.CARDS_TYPE.SKIP) {

                totalScore += CONFIG.GamePlay.SKIP_POINT;
                specialCardsPoint += CONFIG.GamePlay.SKIP_POINT;

                specialCards.push(UserInTableDetails.cardArray[i]);

            } else if (UserInTableDetails.cardArray[i].split("-")[1] === CONSTANTS.UNO_CARDS.CARDS_TYPE.ZERO) {

                totalScore += CONFIG.GamePlay.ZERO_POINT;
                simpleCardsScore += CONFIG.GamePlay.ZERO_POINT;

                simpleCards.push(UserInTableDetails.cardArray[i]);

            } else {

                totalScore += Number(UserInTableDetails.cardArray[i].split("-")[1]);
                simpleCardsScore += Number(UserInTableDetails.cardArray[i].split("-")[1]);

                simpleCards.push(UserInTableDetails.cardArray[i]);

            };
        };

        return { totalScore, simpleCardsScore, specialCardsPoint, simpleCards, specialCards };

    } catch (error: any) {
        Logger('CheckUserScore Error : ', error);
    };
};

export { AllUserScore, CheckUserScore };
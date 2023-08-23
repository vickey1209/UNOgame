import { Config } from "../Config";
import { EventEmitter } from "../Connection/emitter";
import { CONSTANTS } from "../Constants";
import { GetTable, GetUserInTable } from "../GameRedisOperations/gameRedisOperations";
import { UserInTableInterface } from "../Interface/UserInTable/UserInTableInterface";
import { ErrorLogger, Logger } from "../Logger/logger";

const AllUserScore = async (tableId: string) => {

    try {

        await Logger("AllUserScore", JSON.stringify({ tableId }));

        const { USERS_SCORE } = CONSTANTS.EVENTS_NAME;

        // let ScoreResData: any = { allUserScore: [] };

        let allUserScore = [];

        let TableDetails = await GetTable(tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        for (let i = 0; i < TableDetails.playersArray.length; i++) {

            if (TableDetails.playersArray[i].isLeave === false) {

                let UserInTableDetails = await GetUserInTable(TableDetails.tableId, TableDetails.playersArray[i].userId);

                if (!UserInTableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_IN_TABLE_NOT_FOUND) };

                const Score = await CheckUserScore(UserInTableDetails);

                if (!Score) { throw new Error(CONSTANTS.ERROR_MESSAGES.CHECK_SCORE_ERROR) };

                // ScoreResData.allUserScore.push({ userScore: Math.abs(Score.currentRoundScore), seatIndex: UserInTableDetails.seatIndex, cardsLength: UserInTableDetails.cardArray.length });
                allUserScore.push({ userScore: Math.abs(Score.currentRoundScore), seatIndex: UserInTableDetails.seatIndex, cardsLength: UserInTableDetails.cardArray.length });

            };

        };

        // EventEmitter.emit(USERS_SCORE, { en: USERS_SCORE, RoomId: TableDetails.tableId, Data: ScoreResData });
        EventEmitter.emit(USERS_SCORE, { en: USERS_SCORE, RoomId: TableDetails.tableId, Data: { allUserScore } });

    } catch (error: any) {
        await ErrorLogger('AllUserScore Error : ', error);
    };
};

const CheckUserScore = async (UserInTableDetails: UserInTableInterface) => {

    try {

        await Logger("CheckUserScore", JSON.stringify({ UserInTableDetails }));

        const CONFIG = Config();

        let totalScore: any = 0, currentRoundScore: any = 0,
            simple: any = { Cards: [], Score: 0 },
            zero: any = { Cards: [], Score: 0 },
            special: any = { Cards: [], Score: 0 },
            wildColorChange: any = { Cards: [], Score: 0 },
            wildPlusFour: any = { Cards: [], Score: 0 };

        for (let i = 0; i < UserInTableDetails.cardArray.length; i++) {

            if (UserInTableDetails.cardArray[i].split("-")[1] === CONSTANTS.UNO_CARDS.CARDS_TYPE.PLUS_FOUR) {

                currentRoundScore -= CONFIG.GamePlay.PLUS_FOUR_POINT;

                wildPlusFour.Score -= CONFIG.GamePlay.PLUS_FOUR_POINT;

                wildPlusFour.Cards.push(UserInTableDetails.cardArray[i]);

            } else if (UserInTableDetails.cardArray[i].split("-")[1] === CONSTANTS.UNO_CARDS.CARDS_TYPE.COLOR_CHANGE) {

                currentRoundScore -= CONFIG.GamePlay.COLOR_CHANGE_POINT;

                wildColorChange.Score -= CONFIG.GamePlay.COLOR_CHANGE_POINT;

                wildColorChange.Cards.push(UserInTableDetails.cardArray[i]);

            } else if (UserInTableDetails.cardArray[i].split("-")[1] === CONSTANTS.UNO_CARDS.CARDS_TYPE.PLUS_TWO) {

                currentRoundScore -= CONFIG.GamePlay.PLUS_TWO_POINT;

                special.Score -= CONFIG.GamePlay.PLUS_TWO_POINT;

                special.Cards.push(UserInTableDetails.cardArray[i]);

            } else if (UserInTableDetails.cardArray[i].split("-")[1] === CONSTANTS.UNO_CARDS.CARDS_TYPE.REVERS) {

                currentRoundScore -= CONFIG.GamePlay.REVERS_POINT;

                special.Score -= CONFIG.GamePlay.REVERS_POINT;

                special.Cards.push(UserInTableDetails.cardArray[i]);

            } else if (UserInTableDetails.cardArray[i].split("-")[1] === CONSTANTS.UNO_CARDS.CARDS_TYPE.SKIP) {

                currentRoundScore -= CONFIG.GamePlay.SKIP_POINT;

                special.Score -= CONFIG.GamePlay.SKIP_POINT;

                special.Cards.push(UserInTableDetails.cardArray[i]);

            } else if (UserInTableDetails.cardArray[i].split("-")[1] === CONSTANTS.UNO_CARDS.CARDS_TYPE.ZERO) {

                currentRoundScore -= CONFIG.GamePlay.ZERO_POINT;

                zero.Score -= CONFIG.GamePlay.ZERO_POINT;

                zero.Cards.push(UserInTableDetails.cardArray[i]);

            } else {

                currentRoundScore -= Number(UserInTableDetails.cardArray[i].split("-")[1]);

                simple.Score -= Number(UserInTableDetails.cardArray[i].split("-")[1]);

                simple.Cards.push(UserInTableDetails.cardArray[i]);

            };

        };

        // currentRoundScore = (-Math.abs(currentRoundScore));

        totalScore = UserInTableDetails.userScore + currentRoundScore;

        return { totalScore, currentRoundScore, simple, special, zero, wildColorChange, wildPlusFour };

    } catch (error: any) {
        await ErrorLogger('CheckUserScore Error : ', error);
    };
};

const getUserScore = async (cardArray: any) => {
    try {
        await Logger("getUserScore", JSON.stringify({ cardArray }));
        const CONFIG = Config();
        let currentRoundScore: any = 0;
        if (!cardArray || cardArray.length === 0)
            return null;

        for (let i = 0; i < cardArray.length; i++) {
            if (cardArray[i].split("-")[1] === CONSTANTS.UNO_CARDS.CARDS_TYPE.PLUS_FOUR) {
                currentRoundScore += CONFIG.GamePlay.PLUS_FOUR_POINT;
            } else if (cardArray[i].split("-")[1] === CONSTANTS.UNO_CARDS.CARDS_TYPE.COLOR_CHANGE) {
                currentRoundScore += CONFIG.GamePlay.COLOR_CHANGE_POINT;
            } else if (cardArray[i].split("-")[1] === CONSTANTS.UNO_CARDS.CARDS_TYPE.PLUS_TWO) {
                currentRoundScore += CONFIG.GamePlay.PLUS_TWO_POINT;
            } else if (cardArray[i].split("-")[1] === CONSTANTS.UNO_CARDS.CARDS_TYPE.REVERS) {
                currentRoundScore += CONFIG.GamePlay.REVERS_POINT;
            } else if (cardArray[i].split("-")[1] === CONSTANTS.UNO_CARDS.CARDS_TYPE.SKIP) {
                currentRoundScore += CONFIG.GamePlay.SKIP_POINT;
            } else if (cardArray[i].split("-")[1] === CONSTANTS.UNO_CARDS.CARDS_TYPE.ZERO) {
                currentRoundScore += CONFIG.GamePlay.ZERO_POINT;
            } else {
                currentRoundScore += Number(cardArray[i].split("-")[1]);
            };
        };
        // currentRoundScore = (-Math.abs(currentRoundScore));
        return { currentRoundScore };
    } catch (error: any) {
        await ErrorLogger('getUserScore Error : ', error);
    };
};


export { AllUserScore, CheckUserScore, getUserScore };
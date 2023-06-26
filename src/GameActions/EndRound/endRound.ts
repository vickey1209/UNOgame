import { CheckUserScore } from "../../AllUserScore/allUserScore";
import { BullTimer } from "../../BullTimer";
import { Config } from "../../Config";
import { EventEmitter } from "../../Connection/emitter";
import { CONSTANTS } from "../../Constants";
import { GetRoundHistory, GetTable, GetUserInTable, SetRoundHistory, SetUserInTable } from "../../GameRedisOperations/gameRedisOperations";
import { TableInterface } from "../../Interface/Table/TableInterface";
import { UserInTableInterface } from "../../Interface/UserInTable/UserInTableInterface";
import { Logger } from "../../Logger/logger";

const EndRound = async (tableId: string) => {

    try {

        Logger("EndRound", JSON.stringify({ tableId }));

        const CONFIG = Config();

        const { ROUND_SCORE } = CONSTANTS.EVENTS_NAME;

        let TableDetails: TableInterface = await GetTable(tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        await BullTimer.CancelJob.CancelRound(TableDetails.tableId);
        await BullTimer.CancelJob.CancelUserTurn(TableDetails.tableId, TableDetails.currentTurn);

        let RoundScoreArray = [], RoundWiseScore = [];

        const RoundHistoryDetails = await GetRoundHistory(TableDetails.tableId);

        if (RoundHistoryDetails) { RoundWiseScore = RoundHistoryDetails };

        for (let i = 0; i < TableDetails.playersArray.length; i++) {

            const { userId, userName, userProfile, isLeave } = TableDetails.playersArray[i];

            let UserInTableDetails: UserInTableInterface = await GetUserInTable(TableDetails.playersArray[i].userId);

            if (!UserInTableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_IN_TABLE_NOT_FOUND) };

            const Score = await CheckUserScore(UserInTableDetails);

            if (!Score) { throw new Error(CONSTANTS.ERROR_MESSAGES.CHECK_SCORE_ERROR) };

            UserInTableDetails.userScore += (-Math.abs(Score.totalScore));

            const { userScore } = UserInTableDetails;
            // const { cardArray, userScore } = UserInTableDetails;

            RoundScoreArray.push({ userId, userName, userProfile, isLeave, userScore, ...Score });
            // RoundScoreArray.push({ userId, userName, userProfile, isLeave, userScore, cardArray });

            RoundWiseScore.push({ userId, roundScore: (-Math.abs(Score.totalScore)), currentRound: TableDetails.currentRound });

            await SetUserInTable(UserInTableDetails.userId, UserInTableDetails);

        };

        RoundScoreArray = RoundScoreArray.sort((a: any, b: any) => { return b.userScore - a.userScore; });

        await SetRoundHistory(TableDetails.tableId, RoundWiseScore);

        if (TableDetails.currentRound === CONFIG.GamePlay.TOTAL_ROUND_NUMBER) {

            console.log('3 Round Done !!');
            console.log('3 Round Done !!');
            console.log('3 Round Done !!');
            console.log('3 Round Done !!');
            console.log('3 Round Done !!');
            console.log('3 Round Done !!');

        } else {

            await BullTimer.AddJob.NextRound(TableDetails.tableId);

            EventEmitter.emit(ROUND_SCORE, { en: ROUND_SCORE, RoomId: TableDetails.tableId, Data: { roundScore: RoundScoreArray } });

        };

    } catch (error: any) {
        Logger('EndRound Error : ', error);
    };
};

export { EndRound };
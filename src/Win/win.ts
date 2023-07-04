import { CheckUserScore } from "../AllUserScore/allUserScore";
import { BullTimer } from "../BullTimer";
import { CONSTANTS } from "../Constants";
import { GetRoundHistory, GetTable, GetUserInTable } from "../GameRedisOperations/gameRedisOperations";
import { TableInterface } from "../Interface/Table/TableInterface";
import { UserInTableInterface } from "../Interface/UserInTable/UserInTableInterface";
import { Logger } from "../Logger/logger";

const Win = async (tableId: string) => {

    try {

        Logger("Win", JSON.stringify({ tableId }));

        let TableDetails: TableInterface = await GetTable(tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        if (TableDetails.isWinning) { throw new Error(CONSTANTS.ERROR_MESSAGES.WINNING_DONE) };

        await BullTimer.CancelJob.CancelRound(TableDetails.tableId);
        await BullTimer.CancelJob.CancelTurnInfo(TableDetails.tableId);
        await BullTimer.CancelJob.CancelUserTurn(TableDetails.tableId, TableDetails.currentTurn);

        let CurrentRoundScoreArray = [];

        for (let i = 0; i < TableDetails.playersArray.length; i++) {

            const { userId, userName, userProfile, isLeave } = TableDetails.playersArray[i];

            let UserInTableDetails: UserInTableInterface = await GetUserInTable(TableDetails.playersArray[i].userId);

            if (!UserInTableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_IN_TABLE_NOT_FOUND) };

            const Score = await CheckUserScore(UserInTableDetails);

            if (!Score) { throw new Error(CONSTANTS.ERROR_MESSAGES.CHECK_SCORE_ERROR) };

            const { userScore } = UserInTableDetails;

            CurrentRoundScoreArray.push({ userId, userName, userProfile, userScore, isLeave });

        };

        let FinalArray: any = [], rankNumber = 1, lastScore = 0, RoundWiseScoreArray = [];;

        CurrentRoundScoreArray = CurrentRoundScoreArray.sort((a, b) => { return b.userScore - a.userScore; }).sort((a: any, b: any) => { return a.isLeave - b.isLeave; });

        for (let i = 0; i < CurrentRoundScoreArray.length; i++) { // ^ For ...

            if (i === 0) { lastScore = CurrentRoundScoreArray[i].userScore; };

            if (lastScore === CurrentRoundScoreArray[i].userScore && rankNumber <= 2) {
                // if (lastScore === CurrentRoundScoreArray[i].userScore) {

                FinalArray.push({ ...CurrentRoundScoreArray[i], rankNumber });

            } else {

                rankNumber += 1;
                lastScore = CurrentRoundScoreArray[i].userScore;
                FinalArray.push({ ...CurrentRoundScoreArray[i], rankNumber });

            };
        };

        console.log({ FinalArray });

        let RoundHistoryDetails = await GetRoundHistory(TableDetails.tableId);

        if (RoundHistoryDetails) {

            for (let i = (FinalArray.length - 1); i >= 0; i--) {

                for (let k = (RoundHistoryDetails.length - 1); k >= 0; k--) {

                    let UserDetailIndex = -1;

                    const UserDetail = RoundHistoryDetails.find((element: any, index: any) => {
                        UserDetailIndex = index
                        return element.userId === FinalArray[i]?.userId
                    });

                    if (UserDetail && UserDetailIndex !== -1) {
                        RoundHistoryDetails.splice(UserDetailIndex, 1);
                        RoundWiseScoreArray.push(UserDetail);
                    } else {
                        break;
                    };
                };
            };

            // RoundWiseScoreArray = RoundWiseScoreArray.reverse().sort((a: any, b: any) => { return a.currentRound - b.currentRound; });

        };

        console.log({ RoundWiseScoreArray });


    } catch (error: any) {
        Logger('Win Error : ', error);
    };
};

export { Win };
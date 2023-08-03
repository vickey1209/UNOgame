import { CheckUserScore } from "../AllUserScore/allUserScore";
import { BullTimer } from "../BullTimer";
import { EventEmitter } from "../Connection/emitter";
import { CONSTANTS } from "../Constants";
import { DeleteRoundHistory, DeleteTable, DeleteUserInTable, GetRoundHistory, GetTable, GetUser, GetUserInTable, SetTable, SetUser } from "../GameRedisOperations/gameRedisOperations";
import { SignUpInterface } from "../Interface/SignUp/SignUpInterface";
import { TableInterface } from "../Interface/Table/TableInterface";
import { UserInTableInterface } from "../Interface/UserInTable/UserInTableInterface";
import { ErrorLogger, Logger } from "../Logger/logger";

const Win = async (tableId: string) => {

    try {

        await Logger("Win", JSON.stringify({ tableId }));

        const { WINNER_DECLARE } = CONSTANTS.EVENTS_NAME;

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

            UserInTableDetails.userScore = Score.totalScore;

            const { userScore } = UserInTableDetails;

            CurrentRoundScoreArray.push({ userId, userName, userProfile, userScore, isLeave });

        };

        CurrentRoundScoreArray = CurrentRoundScoreArray.sort((a, b) => { return b.userScore - a.userScore; }).sort((a: any, b: any) => { return a.isLeave - b.isLeave; });

        let FinalArray: any = [], rankNumber = 1, lastScore = 0/* , price = 0, RoundWiseScoreArray: any = [], previousScore: any = []; */

        for (let i = 0; i < CurrentRoundScoreArray.length; i++) { // ^ For ...

            if (i === 0) { lastScore = CurrentRoundScoreArray[i].userScore; };

            if (lastScore === CurrentRoundScoreArray[i].userScore && rankNumber <= 2) {
                // if (lastScore === CurrentRoundScoreArray[i].userScore) {

                FinalArray.push({ ...CurrentRoundScoreArray[i], rankNumber, price: 0, previousScore: [] });

            } else {

                rankNumber += 1;
                lastScore = CurrentRoundScoreArray[i].userScore;
                FinalArray.push({ ...CurrentRoundScoreArray[i], rankNumber, price: 0, previousScore: [] });

            };
        };

        let RoundHistoryDetails = await GetRoundHistory(TableDetails.tableId);

        if (RoundHistoryDetails.length) {

            let UserWiseRoundHistory: any = [];

            // for (let i = 0; i < RoundHistoryDetails.length; i++) {

            //     for (let k = 0; k < RoundHistoryDetails[i].roundScore.length; k++) {

            //         UserWiseRoundHistory.push(RoundHistoryDetails[i].roundScore[k]);

            //     };

            // };

            RoundHistoryDetails.forEach((FirstLoopElement: any, FirstLoopIndex: any) => {

                FirstLoopElement.roundScore.forEach((SecondLoopElement: any, SecondLoopIndex: any) => { UserWiseRoundHistory.push(RoundHistoryDetails[FirstLoopIndex].roundScore[SecondLoopIndex]) });

            });

            if (UserWiseRoundHistory.length) {

                // for (let i = 0; i < FinalArray.length; i++) {

                //     const OneUser = UserWiseRoundHistory.filter((e: any) => { return e.userId === FinalArray[i]?.userId });

                //     OneUser.forEach((element: any) => { FinalArray[i]?.previousScore.push(element?.currentRoundScore) });

                // };

                FinalArray.forEach((FirstLoopElement: any, FirstLoopIndex: any) => {

                    const OneUser = UserWiseRoundHistory.filter((e: any) => { return e.userId === FinalArray[FirstLoopIndex]?.userId });

                    OneUser.forEach((element: any) => { FinalArray[FirstLoopIndex]?.previousScore.push(element?.currentRoundScore) });

                });

            };

        };

        TableDetails.isWinning = true;
        TableDetails.winningArray = FinalArray;

        await SetTable(TableDetails.tableId, TableDetails);

        for (let i = 0; i < TableDetails.playersArray.length; i++) { await DeleteUserInTable(TableDetails.playersArray[i].userId) };

        await BullTimer.AddJob.GameEnd(TableDetails.tableId);

        EventEmitter.emit(WINNER_DECLARE, { en: WINNER_DECLARE, RoomId: TableDetails.tableId, Data: { winningArray: FinalArray } });

    } catch (error: any) {
        await ErrorLogger('Win Error : ', error);
    };
};

export { Win };
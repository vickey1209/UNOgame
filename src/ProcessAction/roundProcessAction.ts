import { CheckUserScore } from "../AllUserScore/allUserScore";
import { BullTimer } from "../BullTimer";
import { Config } from "../Config";
import { EventEmitter } from "../Connection/emitter";
import { ApplyLock, RemoveLock } from "../Connection/redlock";
import { CONSTANTS } from "../Constants";
import { GetRoundHistory, GetTable, GetUserInTable, SetRoundHistory, SetUserInTable } from "../GameRedisOperations/gameRedisOperations";
import { TableInterface } from "../Interface/Table/TableInterface";
import { UserInTableInterface } from "../Interface/UserInTable/UserInTableInterface";
import { Logger } from "../Logger/logger";

const RoundProcessAction = async (Data: any) => {

    const Path = 'RoundProcessAction';

    const { LOCK, TABLES } = CONSTANTS.REDIS_COLLECTION;
    const { ROUND_SCORE } = CONSTANTS.EVENTS_NAME;

    const TablelockId = `${LOCK}:${TABLES}:${Data?.tableId}`;

    const Tablelock = await ApplyLock(Path, TablelockId);

    try {

        Logger("RoundProcessAction", JSON.stringify(Data));

        const CONFIG = Config();

        const tableId = Data?.tableId;

        if (!tableId) { throw new Error(CONSTANTS.ERROR_MESSAGES.BULL_DATA_NOT_FOUND) };

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

        } else {

            await BullTimer.AddJob.NextRound(TableDetails.tableId);

            EventEmitter.emit(ROUND_SCORE, { en: ROUND_SCORE, RoomId: TableDetails.tableId, Data: { roundScore: RoundScoreArray } });

        };


    } catch (error: any) {

        Logger('RoundProcessAction Error : ', error);

    } finally {

        await RemoveLock(Path, Tablelock);

    };
};

export { RoundProcessAction };
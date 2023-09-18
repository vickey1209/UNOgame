import { Config } from "../../Config";
import { CONSTANTS } from "../../Constants";
import { GetTableConfig } from "../../GameRedisOperations/gameRedisOperations";
import { ErrorLogger, Logger } from "../../Logger/logger";
import { UserTurnQueue } from "../AllQueues/allQueues";
import { UserTurnProcess } from "../ProcessJob/userTurnProcess";

const UserTurn = async (tableId: string, currentTurn: number) => {

    try {

        await Logger("UserTurn", JSON.stringify({ tableId, currentTurn }));

        const jobId = `${tableId}:${currentTurn}`;

        const TableConfigDetails = await GetTableConfig(tableId);

        if (!TableConfigDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_CONFIG_NOT_FOUND) };

        const options = {
            delay: TableConfigDetails?.USER_TURN_TIMER * 1000,
            jobId,
            removeOnComplete: true
        };

        await UserTurnQueue.add({ tableId, currentTurn }, options);

    } catch (error: any) {
        await ErrorLogger('UserTurn Error : ', error);
    };
};

UserTurnQueue.process(UserTurnProcess);

export { UserTurn };
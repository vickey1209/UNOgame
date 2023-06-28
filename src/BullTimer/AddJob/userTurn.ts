import { Config } from "../../Config";
import { CONSTANTS } from "../../Constants";
import { GetTable } from "../../GameRedisOperations/gameRedisOperations";
import { TableInterface } from "../../Interface/Table/TableInterface";
import { Logger } from "../../Logger/logger";
import { UserTurnQueue } from "../AllQueues/allQueues";
import { UserTurnProcess } from "../ProcessJob/userTurnProcess";

const UserTurn = async (tableId: string) => {

    try {

        Logger("UserTurn", JSON.stringify({ tableId }));

        const CONFIG = Config();

        let TableDetails: TableInterface = await GetTable(tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        const jobId = `${tableId}:${TableDetails.currentTurn}`;

        const options = {
            delay: CONFIG.GamePlay.USER_TURN_TIMER * 1000,
            jobId,
            removeOnComplete: true
        };

        UserTurnQueue.add({ tableId, currentTurn: TableDetails.currentTurn }, options);

    } catch (error: any) {
        Logger('UserTurn Error : ', error);
    }
};

UserTurnQueue.process(UserTurnProcess);

export { UserTurn };
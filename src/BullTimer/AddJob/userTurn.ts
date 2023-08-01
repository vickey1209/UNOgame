import { Config } from "../../Config";
import { Logger } from "../../Logger/logger";
import { UserTurnQueue } from "../AllQueues/allQueues";
import { UserTurnProcess } from "../ProcessJob/userTurnProcess";

const UserTurn = async (tableId: string, currentTurn: number) => {

    try {

        await Logger("UserTurn", JSON.stringify({ tableId }));

        const CONFIG = Config();

        const jobId = `${tableId}:${currentTurn}`;

        const options = {
            delay: CONFIG.GamePlay.USER_TURN_TIMER * 1000,
            jobId,
            removeOnComplete: true
        };

        await UserTurnQueue.add({ tableId, currentTurn }, options);

    } catch (error: any) {
        await Logger('UserTurn Error : ', error);
    };
};

UserTurnQueue.process(UserTurnProcess);

export { UserTurn };
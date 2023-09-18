import { Config } from "../../Config";
import { ErrorLogger, Logger } from "../../Logger/logger";
import { DisconnectUserQueue } from "../AllQueues/allQueues";
import { DisconnectUserProcess } from "../ProcessJob/disconnectUserProcess";

const DisconnectUser = async (userId: string, tableId: string, playerCount: number) => {

    try {

        await Logger("DisconnectUser", JSON.stringify({ userId, tableId, playerCount }));

        const CONFIG = Config();

        const jobId = `${userId}`;

        const options = {
            delay: CONFIG.GamePlay.RETURN_TO_TABLE_TIMER * 1000,
            jobId,
            removeOnComplete: true
        };

        await DisconnectUserQueue.add({ userId, tableId, playerCount }, options);

    } catch (error: any) {
        await ErrorLogger('DisconnectUser Error : ', error);
    };
};

DisconnectUserQueue.process(DisconnectUserProcess);

export { DisconnectUser };
import { Config } from "../../Config";
import { Logger } from "../../Logger/logger";
import { DisconnectUserQueue } from "../AllQueues/allQueues";
import { DisconnectUserProcess } from "../ProcessJob/disconnectUserProcess";

const DisconnectUser = async (userId: string, tableId: string, bootValue: number, playerCount: number) => {

    try {

        await Logger("DisconnectUser", JSON.stringify({ userId, tableId, bootValue, playerCount }));

        const CONFIG = Config();

        const jobId = `${userId}`;

        const options = {
            delay: CONFIG.GamePlay.RETURN_TO_TABLE_TIMER * 1000,
            jobId,
            removeOnComplete: true
        };

        await DisconnectUserQueue.add({ userId, tableId, bootValue, playerCount }, options);

    } catch (error: any) {
        await Logger('DisconnectUser Error : ', error);
    };
};

DisconnectUserQueue.process(DisconnectUserProcess);

export { DisconnectUser };
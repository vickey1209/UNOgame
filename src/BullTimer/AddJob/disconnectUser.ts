import { Config } from "../../Config";
import { Logger } from "../../Logger/logger";
import { DisconnectUserQueue } from "../AllQueues/allQueues";
import { DisconnectUserProcess } from "../ProcessJob/disconnectUserProcess";

const CONFIG = Config();

const DisconnectUser = async (userId: string, tableId: string, bootValue: number, playerCount: number) => {

    try {

        Logger("DisconnectUser", JSON.stringify({ userId }));

        const jobId = `${userId}`;

        const options = {
            delay: CONFIG.GamePlay.RETURN_TO_TABLE_TIMER * 1000,
            jobId,
            removeOnComplete: true
        };

        DisconnectUserQueue.add({ userId, tableId, bootValue, playerCount }, options);

    } catch (error: any) {
        Logger('DisconnectUser Error : ', error);
    };
};

DisconnectUserQueue.process(DisconnectUserProcess);

export { DisconnectUser };
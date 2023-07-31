import { Logger } from "../../Logger/logger";
import { BotTurnQueue  } from "../AllQueues/allQueues";
import { BotTurnProcess } from "../ProcessJob/botTurnProcess";

const BotTurn = async (data:any) => {

    try {

        Logger("BotTurn", JSON.stringify(data));

        const jobId = `${data.tableId}:BotTurn`;
        Logger("BotTurn jobId : ", jobId);
        const options = {
            delay: data.delayNumber * 1000,
            jobId,
            removeOnComplete: true
        };

        await BotTurnQueue.add(data, options);

    } catch (error: any) {
        Logger('BotTurn Error : ', error);
    };
};

BotTurnQueue.process(BotTurnProcess);

export { BotTurn };
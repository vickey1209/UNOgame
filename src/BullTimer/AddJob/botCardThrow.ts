import { ErrorLogger, Logger } from "../../Logger/logger";
import { BotCardThrowQueue } from "../AllQueues/allQueues";
import { BotCardThrowProcess } from "../ProcessJob/botCardThrowProcess";

const BotCardThrow = async (data:any) => {

    try {

        await Logger("BotCardThrow", JSON.stringify(data));

        const jobId = `${data.Fake_Data.tableId}:BotThrow`;
        await Logger("BotCardThrow jobId : ", jobId);
        const options = {
            delay: data.delayNumber * 1000,
            jobId,
            removeOnComplete: true
        };

        await BotCardThrowQueue.add(data, options);

    } catch (error: any) {
        await ErrorLogger('BotCardThrow Error : ', error);
    };
};

BotCardThrowQueue.process(BotCardThrowProcess);

export { BotCardThrow };
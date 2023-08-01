import { Logger } from "../../Logger/logger";
import { BotSignupQueue  } from "../AllQueues/allQueues";
import { BotSignupProcess } from "../ProcessJob/botSignupProcess";

const BotSignup = async (data:any) => {

    try {

        await Logger("BotSignup", JSON.stringify(data));

        const jobId = `${data.tableId}:BotSignup`;
        await Logger("BotSignup jobId : ", jobId);
        const options = {
            delay: data.delayNumber * 1000,
            jobId,
            removeOnComplete: true
        };

        await BotSignupQueue.add(data, options);

    } catch (error: any) {
        await Logger('BotSignup Error : ', error);
    };
};

BotSignupQueue.process(BotSignupProcess);

export { BotSignup };
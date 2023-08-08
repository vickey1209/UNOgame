import { ErrorLogger, Logger } from "../../Logger/logger";
import { WinnerDeclareQueue } from "../AllQueues/allQueues";
import { WinningDelayProcess } from "../ProcessJob/winningDelayProcess";

const WinningDelay = async (tableId: string, delayNumber: number) => {

    try {

        await Logger("WinningDelay", JSON.stringify({ tableId, delayNumber }));

        const jobId = `${tableId}`;

        const options = {
            delay: delayNumber * 1000,
            jobId,
            removeOnComplete: true
        };

        await WinnerDeclareQueue.add({ tableId }, options);

    } catch (error: any) {
        await ErrorLogger('WinningDelay Error : ', error);
    };
};

WinnerDeclareQueue.process(WinningDelayProcess);

export { WinningDelay };
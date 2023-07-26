import { Logger } from "../../Logger/logger";
import { PickCardDelayQueue } from "../AllQueues/allQueues";
import { PickCardResInterface } from "../../Interface/PickCardRes/PickCardResInterface";
import { PickCardDelayProcess } from "../ProcessJob/pickCardDelayProcess";

const PickCardDelay = async (tableId: string, delayNumber: number, PickCardResData: PickCardResInterface) => {

    try {

        Logger("PickCardDelay", JSON.stringify({ tableId, delayNumber, PickCardResData }));

        const jobId = `${tableId}`;

        const options = {
            delay: delayNumber * 1000,
            jobId,
            removeOnComplete: true
        };

        await PickCardDelayQueue.add({ tableId, PickCardResData }, options);

    } catch (error: any) {
        Logger('PickCardDelay Error : ', error);
    };
};

PickCardDelayQueue.process(PickCardDelayProcess);

export { PickCardDelay };
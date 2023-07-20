import { Logger } from "../../Logger/logger";
import { PickCardQueue } from "../AllQueues/allQueues";
import { PickCardResInterface } from "../../Interface/PickCardRes/PickCardResInterface";
import { PickCardDelayProcess } from "../ProcessJob/pickCardProcess";

const PickCardDelay = async (tableId: string, delayNumber: number, PickCardResData: PickCardResInterface) => {

    try {

        Logger("PickCardDelay", JSON.stringify({ tableId, PickCardResData }));

        const jobId = `${tableId}`;

        const options = {
            delay: delayNumber * 1000,
            jobId,
            removeOnComplete: true
        };

        await PickCardQueue.add({ tableId, PickCardResData }, options);

    } catch (error: any) {
        Logger('PickCardDelay Error : ', error);
    };
};

PickCardQueue.process(PickCardDelayProcess);

export { PickCardDelay };
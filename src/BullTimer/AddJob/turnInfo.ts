import { Logger } from "../../Logger/logger";
import { TurnInfoQueue } from "../AllQueues/allQueues";
import { TurnInfoProcess } from "../ProcessJob/turnInfoProcess";

const TurnInfo = async (tableId: string, isSkip: boolean, skipSeatIndex: number, isRevers: boolean, delayNumber: number) => {

    try {

        await Logger("TurnInfo", JSON.stringify({ tableId, isSkip, skipSeatIndex, isRevers }));

        const jobId = `${tableId}`;

        const options = {
            delay: delayNumber * 1000,
            jobId,
            removeOnComplete: true
        };

        await TurnInfoQueue.add({ tableId, isSkip, skipSeatIndex, isRevers }, options);

    } catch (error: any) {
        await Logger('TurnInfo Error : ', error);
    };
};

TurnInfoQueue.process(TurnInfoProcess);

export { TurnInfo };
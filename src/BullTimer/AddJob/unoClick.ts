import { Config } from "../../Config";
import { Logger } from "../../Logger/logger";
import { UnoClickQueue } from "../AllQueues/allQueues";
import { UnoClickProcess } from "../ProcessJob/unoClickProcess";

const UnoClick = async (tableId: string, isSkip: boolean, skipSeatIndex: number, isRevers: boolean, delayNumber: number, unoSeatIndex: number) => {

    try {

        Logger("UnoClick", JSON.stringify({ tableId, isSkip, skipSeatIndex, isRevers, delayNumber, unoSeatIndex }));

        const CONFIG = Config();

        const jobId = `${tableId}`;

        const options = {
            delay: CONFIG.GamePlay.UNO_CLICK_TIMER * 1000,
            jobId,
            removeOnComplete: true
        };

        UnoClickQueue.add({ tableId, isSkip, skipSeatIndex, isRevers, delayNumber, unoSeatIndex }, options);

    } catch (error: any) {
        Logger('UnoClick Error : ', error);
    };
};

UnoClickQueue.process(UnoClickProcess);

export { UnoClick };
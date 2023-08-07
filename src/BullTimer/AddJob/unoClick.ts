import { Config } from "../../Config";
import { ErrorLogger, Logger } from "../../Logger/logger";
import { UnoClickQueue } from "../AllQueues/allQueues";
import { UnoClickProcess } from "../ProcessJob/unoClickProcess";

const UnoClick = async (tableId: string, isSkip: boolean, skipSeatIndex: number, isRevers: boolean, delayNumber: number, unoSeatIndex: number, nextTurn: number) => {

    try {

        await Logger("UnoClick", JSON.stringify({ tableId, isSkip, skipSeatIndex, isRevers, delayNumber, unoSeatIndex, nextTurn }));

        const CONFIG = Config();

        const jobId = `${tableId}`;

        const options = {
            delay: (delayNumber + CONFIG.GamePlay.DELAY_FOR_UNO) * 1000,
            jobId,
            removeOnComplete: true
        };

        await UnoClickQueue.add({ tableId, isSkip, skipSeatIndex, isRevers, delayNumber, unoSeatIndex, nextTurn }, options);

    } catch (error: any) {
        await ErrorLogger('UnoClick Error : ', error);
    };
};

UnoClickQueue.process(UnoClickProcess);

export { UnoClick };
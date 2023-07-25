import { Config } from "../../Config";
import { Logger } from "../../Logger/logger";
import { GameEndQueue } from "../AllQueues/allQueues";
import { GameEndProcess } from "../ProcessJob/gameEndProcess";

const GameEnd = async (tableId: string) => {

    try {

        Logger("GameEnd", JSON.stringify({ tableId }));

        const CONFIG = Config();

        const jobId = `${tableId}`;

        const options = {
            delay: CONFIG.GamePlay.END_GAME_TIMER * 1000,
            jobId,
            removeOnComplete: true
        };

        await GameEndQueue.add({ tableId }, options);

    } catch (error: any) {
        Logger('GameEnd Error : ', error);
    };
};

GameEndQueue.process(GameEndProcess);

export { GameEnd };
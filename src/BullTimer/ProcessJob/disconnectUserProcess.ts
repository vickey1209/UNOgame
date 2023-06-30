import { Logger } from "../../Logger/logger";
import { PROCESS_ACTION } from "../../ProcessAction";

const DisconnectUserProcess = async (job: any, done: any) => {

    try {

        Logger("DisconnectUserProcess", JSON.stringify(job.data));

        done();

        await PROCESS_ACTION.DisconnectUserProcessAction(job.data);

    } catch (error: any) {
        Logger('DisconnectUserProcess Error : ', error);
    };
};

export { DisconnectUserProcess };
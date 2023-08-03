import { ApplyLock, RemoveLock } from "../Connection/redlock";
import { CONSTANTS } from "../Constants";
import { GAME_ACTIONS } from "../GameActions";
import { ErrorLogger, Logger } from "../Logger/logger";

const RoundProcessAction = async (Data: any) => {

    const Path = 'RoundProcessAction';

    const { LOCK, TABLES } = CONSTANTS.REDIS_COLLECTION;

    const TablelockId = `${LOCK}:${TABLES}:${Data?.tableId}`;

    const Tablelock = await ApplyLock(Path, TablelockId);

    try {

        await Logger("RoundProcessAction", JSON.stringify(Data));

        const tableId = Data?.tableId;

        if (!tableId) { throw new Error(CONSTANTS.ERROR_MESSAGES.BULL_DATA_NOT_FOUND) };

        await GAME_ACTIONS.EndRound(tableId, true, 0);

    } catch (error: any) {

        await ErrorLogger('RoundProcessAction Error : ', error);

    } finally {

        await RemoveLock(Path, Tablelock);

    };
};

export { RoundProcessAction };
import { CONSTANTS } from "../../Constants";
import { GetTable, SetTable } from "../../GameRedisOperations/gameRedisOperations";
import { ErrorLogger, Logger } from "../../Logger/logger";
import { RemoveUserFromTable } from "../../Table/leaveTable";

const RemoveDisconnectedUsers = async (tableId: string) => {

    try {

        await Logger("RemoveDisconnectedUsers", JSON.stringify({ tableId }));

        let TableDetails = await GetTable(tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        for (let i = 0; i < TableDetails.disconnectedUsers.length; i++) {

            await RemoveUserFromTable(TableDetails.disconnectedUsers[i], TableDetails.tableId, false);

        };

        // TableDetails.disconnectedUsers = [];

        // await SetTable(TableDetails.tableId, TableDetails);

    } catch (error: any) {
        await ErrorLogger('RemoveDisconnectedUsers Error : ', error);
    };
};

export { RemoveDisconnectedUsers };
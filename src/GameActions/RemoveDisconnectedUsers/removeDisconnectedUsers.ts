import { CONSTANTS } from "../../Constants";
import { GetTable, SetTable } from "../../GameRedisOperations/gameRedisOperations";
import { TableInterface } from "../../Interface/Table/TableInterface";
import { Logger } from "../../Logger/logger";
import { RemoveUserFromTable } from "../../Table/leaveTable";

const RemoveDisconnectedUsers = async (tableId: string) => {

    try {

        Logger("RemoveDisconnectedUsers", JSON.stringify({ tableId }));

        let TableDetails: TableInterface = await GetTable(tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        for (let i = 0; i < TableDetails.disconnectedUsers.length; i++) {

            await RemoveUserFromTable(TableDetails.playersArray[i].userId, TableDetails.tableId, false);

        };

        TableDetails.disconnectedUsers = [];

        await SetTable(TableDetails.tableId, TableDetails);

    } catch (error: any) {
        Logger('RemoveDisconnectedUsers Error : ', error);
    };
};

export { RemoveDisconnectedUsers };
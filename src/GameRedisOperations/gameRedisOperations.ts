import { CONSTANTS } from "../Constants";
import { SignUpInterface, UserInterface, WinZoConfigDataInterface } from "../Interface/SignUp/SignUpInterface";
import { TableInterface } from "../Interface/Table/TableInterface";
import { UserInTableInterface } from "../Interface/UserInTable/UserInTableInterface";
import { Logger } from "../Logger/logger";
import { AllKeys, DeleteData, GetData, SetData } from "../RedisOperations/redisOperations";

const { USERS, TABLES_CONFIG, TABLES, USER_IN_TABLE, ROUND_HISTORY } = CONSTANTS.REDIS_COLLECTION;

// ^ User ...

const UserKeySet = async (UserKey: string) => {

    await Logger('UserKeySet', JSON.stringify({ UserKey }));

    const key = `${USERS}:${UserKey}`;

    return key;

};

const SetUser = async (UserKey: string, UserData: UserInterface) => {

    await Logger('SetUser', JSON.stringify({ UserKey, UserData }));

    const key = await UserKeySet(UserKey);

    const UserSet = await SetData(key, UserData);

    return UserSet;

};

const GetUser = async (UserKey: string): Promise<UserInterface> => {

    await Logger('GetUser......', JSON.stringify({ UserKey }));

    const key = await UserKeySet(UserKey);

    const User = await GetData(key);

    await Logger('GetUser Return : ', JSON.stringify({ User }));

    return User;

};

const DeleteUser = async (UserKey: string) => {

    await Logger('DeleteUser', JSON.stringify({ UserKey }));

    const key = await UserKeySet(UserKey);

    await DeleteData(key);

};

// ^ User ...


// ^ Empty Table ...

// const GetEmptyTable = async (BootValue: number, PlayerCount: number) => {

//     await Logger('GetEmptyTable', JSON.stringify({ BootValue, PlayerCount }));

//     const key = `${EMPTY_TABLE}:${BootValue}:${PlayerCount}:*`;

//     const EmptyTable: Array<string> = await AllKeys(key);

//     await Logger('GetEmptyTable Return : ', JSON.stringify({ EmptyTable }));

//     return EmptyTable;

// };

// const SetEmptyTable = async (BootValue: number, PlayerCount: number, TableId: string) => {

//     await Logger('SetEmptyTable', JSON.stringify({ BootValue, PlayerCount, TableId }));

//     const key = `${EMPTY_TABLE}:${BootValue}:${PlayerCount}:${TableId}`;

//     const EmptyTable: string = await SetData(key, { tableId: TableId });

//     return EmptyTable;

// };

// const DeleteEmptyTable = async (BootValue: number, PlayerCount: number, TableId: string) => {

//     await Logger('DeleteEmptyTable', JSON.stringify({ BootValue, PlayerCount, TableId }));

//     const key = `${EMPTY_TABLE}:${BootValue}:${PlayerCount}:${TableId}`;

//     await DeleteData(key);

// };

// ^ Empty Table ...


// ^ Table ...

const TableKeySet = async (TableId: string) => {

    await Logger('TableKeySet', JSON.stringify({ TableId }));

    const key = `${TABLES}:${TableId}`;

    return key;

};

const SetTable = async (TableId: string, TableData: TableInterface) => {

    await Logger('SetTable', JSON.stringify({ TableId, TableData }));

    const key = await TableKeySet(TableId);

    const TableSet = await SetData(key, TableData);

    return TableSet;

};

const GetTable = async (TableId: string): Promise<TableInterface> => {

    await Logger('GetTable', JSON.stringify({ TableId }));

    const key = await TableKeySet(TableId);

    const Table = await GetData(key);

    await Logger('GetTable Return : ', JSON.stringify({ Table }));

    return Table;

};

const DeleteTable = async (TableId: string) => {

    await Logger('DeleteTable', JSON.stringify({ TableId }));

    const key = await TableKeySet(TableId);

    await DeleteData(key);

};

// ^ Table ...


// ^ User In Table ...

const UserInTableKeySet = async (TableId: string, UserInTableId: string) => {

    await Logger('UserInTableKeySet', JSON.stringify({ TableId, UserInTableId }));

    const key = `${USER_IN_TABLE}:${TableId}:${UserInTableId}`;

    return key;

};

const SetUserInTable = async (TableId: string, UserInTableId: string, UserInTableData: UserInTableInterface) => {

    await Logger('SetUserInTable', JSON.stringify({ TableId, UserInTableId, UserInTableData }));

    const key = await UserInTableKeySet(TableId, UserInTableId);

    const UserInTableSet = await SetData(key, UserInTableData);

    return UserInTableSet;

};

const GetUserInTable = async (TableId: string, UserInTableId: string): Promise<UserInTableInterface> => {

    await Logger('GetUserInTable', JSON.stringify({ TableId, UserInTableId }));

    const key = await UserInTableKeySet(TableId, UserInTableId);

    const UserInTableGet = await GetData(key);

    await Logger('GetUserInTable Return : ', JSON.stringify({ UserInTableGet })); 

    return UserInTableGet;

};

const DeleteUserInTable = async (TableId: string, UserInTableId: string) => {

    await Logger('DeleteUserInTable', JSON.stringify({ TableId, UserInTableId }));

    const key = await UserInTableKeySet(TableId, UserInTableId);

    await DeleteData(key);

};

// ^ User In Table ...


// ^ Round History ...

const RoundHistoryKeySet = async (RoundId: string) => {

    await Logger('RoundHistoryKeySet', JSON.stringify({ RoundId }));

    const key = `${ROUND_HISTORY}:${RoundId}`;

    return key;

};

const SetRoundHistory = async (RoundId: string, RoundHistoryData: any) => {

    await Logger('SetRoundHistory', JSON.stringify({ RoundId, RoundHistoryData }));

    const key = await RoundHistoryKeySet(RoundId);

    const RoundHistorySet = await SetData(key, RoundHistoryData);

    return RoundHistorySet;

};

const GetRoundHistory = async (RoundId: string) => {

    await Logger('GetRoundHistory', JSON.stringify({ RoundId }));

    const key = await RoundHistoryKeySet(RoundId);

    const RoundHistoryGet = await GetData(key);

    await Logger('GetRoundHistory Return : ', JSON.stringify({ GetRoundHistory }));

    return RoundHistoryGet;

};

const DeleteRoundHistory = async (RoundId: string) => {

    await Logger('DeleteRoundHistory', JSON.stringify({ RoundId }));

    const key = await RoundHistoryKeySet(RoundId);

    await DeleteData(key);

};

// ^ Round History ...


// ^ Table Config ...

const TableConfigKeySet = async (TableId: string) => {

    await Logger('TableConfigKeySet', JSON.stringify({ TableId }));

    const key = `${TABLES_CONFIG}:${TableId}`;

    return key;

};

const SetTableConfig = async (TableId: string, TableConfigData: WinZoConfigDataInterface) => {

    await Logger('SetTableConfig', JSON.stringify({ TableId, TableConfigData }));

    const key = await TableConfigKeySet(TableId);

    const TableConfigSet = await SetData(key, TableConfigData);

    return TableConfigSet;

};

const GetTableConfig = async (TableId: string): Promise<WinZoConfigDataInterface> => {

    await Logger('GetTableConfig', JSON.stringify({ TableId }));

    const key = await TableConfigKeySet(TableId);

    const TableConfig = await GetData(key);

    await Logger('GetTableConfig Return : ', JSON.stringify({ TableConfig }));

    return TableConfig;

};

const DeleteTableConfig = async (TableId: string) => {

    await Logger('DeleteTableConfig', JSON.stringify({ TableId }));

    const key = await TableConfigKeySet(TableId);

    await DeleteData(key);

};

// ^ Table Config ...

export {

    SetUser,
    GetUser,
    DeleteUser,

    // GetEmptyTable,
    // SetEmptyTable,
    // DeleteEmptyTable,

    SetTable,
    GetTable,
    DeleteTable,

    SetUserInTable,
    GetUserInTable,
    DeleteUserInTable,

    SetRoundHistory,
    GetRoundHistory,
    DeleteRoundHistory,

    SetTableConfig,
    GetTableConfig,
    DeleteTableConfig,
 
 
};
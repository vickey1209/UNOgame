import { CONSTANTS } from "../Constants";
import { SignUpInterface } from "../Interface/SignUp/SignUpInterface";
import { Logger } from "../Logger/logger";
import { AllKeys, DeleteData, GetData, SetData } from "../RedisOperations/redisOperations";

const { USERS, EMPTY_TABLE, TABLES, USER_IN_TABLE, ROUND_HISTORY } = CONSTANTS.REDIS_COLLECTION;

// ^ User ...

const UserKeySet = async (UserKey: string) => {

    Logger('UserKeySet', JSON.stringify({}));

    const key = `${USERS}:${UserKey}`;

    return key;

};

const SetUser = async (UserKey: string, UserData: SignUpInterface) => {

    Logger('SetUser', JSON.stringify({ UserData }));

    const key = await UserKeySet(UserKey);

    const UserSet = await SetData(key, UserData);

    return UserSet;

};

const GetUser = async (UserKey: string) => {

    Logger('GetUser', JSON.stringify({}));

    const key = await UserKeySet(UserKey);

    const User = await GetData(key);

    Logger('GetUser return : ', JSON.stringify({ User }));

    return User;

};

// ^ User ...


// ^ Empty Table ...

const GetEmptyTable = async (BootValue: number, PlayerCount: number) => {

    Logger('GetEmptyTable', JSON.stringify({}));

    const key = `${EMPTY_TABLE}:${BootValue}:${PlayerCount}:*`;

    const EmptyTable: Array<string> = await AllKeys(key);

    Logger('GetEmptyTable return : ', JSON.stringify({ EmptyTable }));

    return EmptyTable;

};

const SetEmptyTable = async (BootValue: number, PlayerCount: number, TableId: string) => {

    Logger('SetEmptyTable', JSON.stringify({}));

    const key = `${EMPTY_TABLE}:${BootValue}:${PlayerCount}:${TableId}`;

    const EmptyTable: string = await SetData(key, { tableId: TableId });

    return EmptyTable;

};

const DeleteEmptyTable = async (BootValue: number, PlayerCount: number, TableId: string) => {

    Logger('SetEmptyTable', JSON.stringify({}));

    const key = `${EMPTY_TABLE}:${BootValue}:${PlayerCount}:${TableId}`;

    await DeleteData(key);

};

// ^ Empty Table ...


// ^ Table ...

const TableKeySet = async (TableId: string) => {

    Logger('TableKeySet', JSON.stringify({}));

    const key = `${TABLES}:${TableId}`;

    return key;

};

const SetTable = async (TableId: string, TableData: any) => {

    Logger('SetTable', JSON.stringify({ TableData }));

    const key = await TableKeySet(TableId);

    const TableSet = await SetData(key, TableData);

    return TableSet;

};

const GetTable = async (TableId: string) => {

    Logger('GetTable', JSON.stringify({}));

    const key = await TableKeySet(TableId);

    const Table = await GetData(key);

    Logger('GetTable return : ', JSON.stringify({ Table }));

    return Table;

};

const DeleteTable = async (TableId: string) => {

    Logger('DeleteTable', JSON.stringify({}));

    const key = await TableKeySet(TableId);

    await DeleteData(key);

};

// ^ Table ...


// ^ User In Table ...

const UserInTableKeySet = async (UserInTableId: string) => {

    Logger('UserInTableKeySet', JSON.stringify({ UserInTableId }));

    const key = `${USER_IN_TABLE}:${UserInTableId}`;

    return key;

};

const SetUserInTable = async (UserInTableId: string, UserInTableData: any) => {

    Logger('SetUserInTable', JSON.stringify({ UserInTableData }));

    const key = await UserInTableKeySet(UserInTableId);

    const UserInTableSet = await SetData(key, UserInTableData);

    return UserInTableSet;

};

const GetUserInTable = async (UserInTableId: string) => {

    Logger('GetUserInTable', JSON.stringify({}));

    const key = await UserInTableKeySet(UserInTableId);

    const UserInTableGet = await GetData(key);

    Logger('GetUserInTable return : ', JSON.stringify({ UserInTableGet }));

    return UserInTableGet;

};

const DeleteUserInTable = async (UserInTableId: string) => {

    Logger('DeleteUserInTable', JSON.stringify({}));

    const key = await UserInTableKeySet(UserInTableId);

    await DeleteData(key);

};

// ^ User In Table ...


// ^ Round History ...

const RoundHistoryKeySet = async (RoundId: string) => {

    Logger('RoundHistory', JSON.stringify({ RoundId }));

    const key = `${ROUND_HISTORY}:${RoundId}`;

    return key;

};

const SetRoundHistory = async (RoundId: string, RoundHistoryData: any) => {

    Logger('SetRoundHistory', JSON.stringify({ RoundHistoryData }));

    const key = await RoundHistoryKeySet(RoundId);

    const RoundHistorySet = await SetData(key, RoundHistoryData);

    return RoundHistorySet;

};

const GetRoundHistory = async (RoundId: string) => {

    Logger('GetRoundHistory', JSON.stringify({}));

    const key = await RoundHistoryKeySet(RoundId);

    const RoundHistoryGet = await GetData(key);

    Logger('GetRoundHistory return : ', JSON.stringify({ GetRoundHistory }));

    return RoundHistoryGet;

};

const DeleteRoundHistory = async (RoundId: string) => {

    Logger('DeleteRoundHistory', JSON.stringify({}));

    const key = await RoundHistoryKeySet(RoundId);

    await DeleteData(key);

};

// ^ Round History ...


export {

    SetUser,
    GetUser,

    GetEmptyTable,
    SetEmptyTable,
    DeleteEmptyTable,

    SetTable,
    GetTable,
    DeleteTable,

    SetUserInTable,
    GetUserInTable,
    DeleteUserInTable,

    SetRoundHistory,
    GetRoundHistory,
    DeleteRoundHistory,

};
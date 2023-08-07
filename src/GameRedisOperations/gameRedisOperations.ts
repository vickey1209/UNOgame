import { CONSTANTS } from "../Constants";
import { SignUpInterface } from "../Interface/SignUp/SignUpInterface";
import { TableInterface } from "../Interface/Table/TableInterface";
import { UserInTableInterface } from "../Interface/UserInTable/UserInTableInterface";
import { Logger } from "../Logger/logger";
import { AllKeys, DeleteData, GetData, SetData } from "../RedisOperations/redisOperations";

const { USERS, EMPTY_TABLE, TABLES, USER_IN_TABLE, ROUND_HISTORY } = CONSTANTS.REDIS_COLLECTION;

// ^ User ...

const UserKeySet = async (UserKey: string) => {

    await Logger('UserKeySet', JSON.stringify({ UserKey }));

    const key = `${USERS}:${UserKey}`;

    return key;

};

const SetUser = async (UserKey: string, UserData: SignUpInterface) => {

    await Logger('SetUser', JSON.stringify({ UserKey, UserData }));

    const key = await UserKeySet(UserKey);

    const UserSet = await SetData(key, UserData);

    return UserSet;

};

const GetUser = async (UserKey: string) => {

    await Logger('GetUser', JSON.stringify({ UserKey }));

    const key = await UserKeySet(UserKey);

    const User = await GetData(key);

    await Logger('GetUser Return : ', JSON.stringify({ User }));

    return User;

};

// ^ User ...


// ^ Empty Table ...

const GetEmptyTable = async (BootValue: number, PlayerCount: number) => {

    await Logger('GetEmptyTable', JSON.stringify({ BootValue, PlayerCount }));

    const key = `${EMPTY_TABLE}:${BootValue}:${PlayerCount}:*`;

    const EmptyTable: Array<string> = await AllKeys(key);

    await Logger('GetEmptyTable Return : ', JSON.stringify({ EmptyTable }));

    return EmptyTable;

};

const SetEmptyTable = async (BootValue: number, PlayerCount: number, TableId: string) => {

    await Logger('SetEmptyTable', JSON.stringify({ BootValue, PlayerCount, TableId }));

    const key = `${EMPTY_TABLE}:${BootValue}:${PlayerCount}:${TableId}`;

    const EmptyTable: string = await SetData(key, { tableId: TableId });

    return EmptyTable;

};

const DeleteEmptyTable = async (BootValue: number, PlayerCount: number, TableId: string) => {

    await Logger('DeleteEmptyTable', JSON.stringify({ BootValue, PlayerCount, TableId }));

    const key = `${EMPTY_TABLE}:${BootValue}:${PlayerCount}:${TableId}`;

    await DeleteData(key);

};

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

const GetTable = async (TableId: string) => {

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

const UserInTableKeySet = async (UserInTableId: string) => {

    await Logger('UserInTableKeySet', JSON.stringify({ UserInTableId }));

    const key = `${USER_IN_TABLE}:${UserInTableId}`;

    return key;

};

const SetUserInTable = async (UserInTableId: string, UserInTableData: UserInTableInterface) => {

    await Logger('SetUserInTable', JSON.stringify({ UserInTableId, UserInTableData }));

    const key = await UserInTableKeySet(UserInTableId);

    const UserInTableSet = await SetData(key, UserInTableData);

    return UserInTableSet;

};

const GetUserInTable = async (UserInTableId: string) => {

    await Logger('GetUserInTable', JSON.stringify({ UserInTableId }));

    const key = await UserInTableKeySet(UserInTableId);

    const UserInTableGet = await GetData(key);

    await Logger('GetUserInTable Return : ', JSON.stringify({ UserInTableGet }));

    return UserInTableGet;

};

const DeleteUserInTable = async (UserInTableId: string) => {

    await Logger('DeleteUserInTable', JSON.stringify({ UserInTableId }));

    const key = await UserInTableKeySet(UserInTableId);

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
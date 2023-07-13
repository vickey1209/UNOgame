"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteRoundHistory = exports.GetRoundHistory = exports.SetRoundHistory = exports.DeleteUserInTable = exports.GetUserInTable = exports.SetUserInTable = exports.DeleteTable = exports.GetTable = exports.SetTable = exports.DeleteEmptyTable = exports.SetEmptyTable = exports.GetEmptyTable = exports.GetUser = exports.SetUser = void 0;
const Constants_1 = require("../Constants");
const logger_1 = require("../Logger/logger");
const redisOperations_1 = require("../RedisOperations/redisOperations");
const { USERS, EMPTY_TABLE, TABLES, USER_IN_TABLE, ROUND_HISTORY } = Constants_1.CONSTANTS.REDIS_COLLECTION;
// ^ User ...
const UserKeySet = (UserKey) => __awaiter(void 0, void 0, void 0, function* () {
    (0, logger_1.Logger)('UserKeySet', JSON.stringify({}));
    const key = `${USERS}:${UserKey}`;
    return key;
});
const SetUser = (UserKey, UserData) => __awaiter(void 0, void 0, void 0, function* () {
    (0, logger_1.Logger)('SetUser', JSON.stringify({ UserData }));
    const key = yield UserKeySet(UserKey);
    const UserSet = yield (0, redisOperations_1.SetData)(key, UserData);
    return UserSet;
});
exports.SetUser = SetUser;
const GetUser = (UserKey) => __awaiter(void 0, void 0, void 0, function* () {
    (0, logger_1.Logger)('GetUser', JSON.stringify({}));
    const key = yield UserKeySet(UserKey);
    const User = yield (0, redisOperations_1.GetData)(key);
    return User;
});
exports.GetUser = GetUser;
// ^ User ...
// ^ Empty Table ...
const GetEmptyTable = (BootValue, PlayerCount) => __awaiter(void 0, void 0, void 0, function* () {
    (0, logger_1.Logger)('GetEmptyTable', JSON.stringify({}));
    const key = `${EMPTY_TABLE}:${BootValue}:${PlayerCount}:*`;
    const EmptyTable = yield (0, redisOperations_1.AllKeys)(key);
    return EmptyTable;
});
exports.GetEmptyTable = GetEmptyTable;
const SetEmptyTable = (BootValue, PlayerCount, TableId) => __awaiter(void 0, void 0, void 0, function* () {
    (0, logger_1.Logger)('SetEmptyTable', JSON.stringify({}));
    const key = `${EMPTY_TABLE}:${BootValue}:${PlayerCount}:${TableId}`;
    const EmptyTable = yield (0, redisOperations_1.SetData)(key, { tableId: TableId });
    return EmptyTable;
});
exports.SetEmptyTable = SetEmptyTable;
const DeleteEmptyTable = (BootValue, PlayerCount, TableId) => __awaiter(void 0, void 0, void 0, function* () {
    (0, logger_1.Logger)('SetEmptyTable', JSON.stringify({}));
    const key = `${EMPTY_TABLE}:${BootValue}:${PlayerCount}:${TableId}`;
    yield (0, redisOperations_1.DeleteData)(key);
});
exports.DeleteEmptyTable = DeleteEmptyTable;
// ^ Empty Table ...
// ^ Table ...
const TableKeySet = (TableId) => __awaiter(void 0, void 0, void 0, function* () {
    (0, logger_1.Logger)('TableKeySet', JSON.stringify({}));
    const key = `${TABLES}:${TableId}`;
    return key;
});
const SetTable = (TableId, TableData) => __awaiter(void 0, void 0, void 0, function* () {
    (0, logger_1.Logger)('SetTable', JSON.stringify({ TableData }));
    const key = yield TableKeySet(TableId);
    const TableSet = yield (0, redisOperations_1.SetData)(key, TableData);
    return TableSet;
});
exports.SetTable = SetTable;
const GetTable = (TableId) => __awaiter(void 0, void 0, void 0, function* () {
    (0, logger_1.Logger)('GetTable', JSON.stringify({}));
    const key = yield TableKeySet(TableId);
    const Table = yield (0, redisOperations_1.GetData)(key);
    return Table;
});
exports.GetTable = GetTable;
const DeleteTable = (TableId) => __awaiter(void 0, void 0, void 0, function* () {
    (0, logger_1.Logger)('DeleteTable', JSON.stringify({}));
    const key = yield TableKeySet(TableId);
    yield (0, redisOperations_1.DeleteData)(key);
});
exports.DeleteTable = DeleteTable;
// ^ Table ...
// ^ User In Table ...
const UserInTableKeySet = (UserInTableId) => __awaiter(void 0, void 0, void 0, function* () {
    (0, logger_1.Logger)('UserInTableKeySet', JSON.stringify({ UserInTableId }));
    const key = `${USER_IN_TABLE}:${UserInTableId}`;
    return key;
});
const SetUserInTable = (UserInTableId, UserInTableData) => __awaiter(void 0, void 0, void 0, function* () {
    (0, logger_1.Logger)('SetUserInTable', JSON.stringify({ UserInTableData }));
    const key = yield UserInTableKeySet(UserInTableId);
    const UserInTableSet = yield (0, redisOperations_1.SetData)(key, UserInTableData);
    return UserInTableSet;
});
exports.SetUserInTable = SetUserInTable;
const GetUserInTable = (UserInTableId) => __awaiter(void 0, void 0, void 0, function* () {
    (0, logger_1.Logger)('GetUserInTable', JSON.stringify({}));
    const key = yield UserInTableKeySet(UserInTableId);
    const UserInTableGet = yield (0, redisOperations_1.GetData)(key);
    return UserInTableGet;
});
exports.GetUserInTable = GetUserInTable;
const DeleteUserInTable = (UserInTableId) => __awaiter(void 0, void 0, void 0, function* () {
    (0, logger_1.Logger)('DeleteUserInTable', JSON.stringify({}));
    const key = yield UserInTableKeySet(UserInTableId);
    yield (0, redisOperations_1.DeleteData)(key);
});
exports.DeleteUserInTable = DeleteUserInTable;
// ^ User In Table ...
// ^ Round History ...
const RoundHistoryKeySet = (RoundId) => __awaiter(void 0, void 0, void 0, function* () {
    (0, logger_1.Logger)('RoundHistory', JSON.stringify({ RoundId }));
    const key = `${ROUND_HISTORY}:${RoundId}`;
    return key;
});
const SetRoundHistory = (RoundId, RoundHistoryData) => __awaiter(void 0, void 0, void 0, function* () {
    (0, logger_1.Logger)('SetRoundHistory', JSON.stringify({ RoundHistoryData }));
    const key = yield RoundHistoryKeySet(RoundId);
    const RoundHistorySet = yield (0, redisOperations_1.SetData)(key, RoundHistoryData);
    return RoundHistorySet;
});
exports.SetRoundHistory = SetRoundHistory;
const GetRoundHistory = (RoundId) => __awaiter(void 0, void 0, void 0, function* () {
    (0, logger_1.Logger)('GetRoundHistory', JSON.stringify({}));
    const key = yield RoundHistoryKeySet(RoundId);
    const RoundHistoryGet = yield (0, redisOperations_1.GetData)(key);
    return RoundHistoryGet;
});
exports.GetRoundHistory = GetRoundHistory;
const DeleteRoundHistory = (RoundId) => __awaiter(void 0, void 0, void 0, function* () {
    (0, logger_1.Logger)('DeleteRoundHistory', JSON.stringify({}));
    const key = yield RoundHistoryKeySet(RoundId);
    yield (0, redisOperations_1.DeleteData)(key);
});
exports.DeleteRoundHistory = DeleteRoundHistory;

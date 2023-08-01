import { Logger } from '../Logger/logger';
import { redisClient } from './../Connection/redis';

const SetData = async (key: string, data: object) => {

    try {

        await Logger('SetData', JSON.stringify({ key, data }));

        let Data = await redisClient.set(key, JSON.stringify(data));
        return Data;

    } catch (error: any) {
        await Logger('SetData Error', error);
    };
};

const GetData = async (key: string) => {

    try {

        await Logger('GetData', JSON.stringify({ key }));

        let Data = await redisClient.get(key);
        if (Data) return Data = JSON.parse(Data);

        return '';

    } catch (error: any) {
        await Logger('GetData Error', error);
    };
};

const DeleteData = async (key: string) => {

    try {

        await Logger('DeleteData', JSON.stringify({ key }));
        await redisClient.del(key);

    } catch (error: any) {
        await Logger('DeleteData Error', error);
    };
};

const RPush = async (key: string, data: any) => {

    try {

        await Logger('RPush', JSON.stringify({ key, data }));
        await redisClient.rPush(key, JSON.stringify(data));

    } catch (error: any) {
        await Logger('RPush Error', error);
    };
};

const LRange = async (key: string, start: number, end: number) => {

    try {

        await Logger('LRange', JSON.stringify({ key, start, end }));
        return await redisClient.lRange(key, start, end);

    } catch (error: any) {
        await Logger('LRange Error', error);
    };
};

const AllKeys = async (key: string) => {

    try {

        await Logger('AllKeys', JSON.stringify({ key }));

        let Data = await redisClient.keys(key);
        Data = Data.length ? Data : '';

        return Data;

    } catch (error: any) {
        await Logger('AllKeys Error', error);
    };
};

export { SetData, GetData, DeleteData, RPush, LRange, AllKeys };
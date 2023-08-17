import Redlock from "redlock";
import Redis from 'ioredis';
import { Config } from "../Config";
import { ErrorLogger, Logger } from "../Logger/logger";

let redLock: any;

const RedLockConnction = async () => {

    try {

        const CONFIG = Config();

        const redisDetails: any = {
            host: CONFIG.Redis.REDIS_HOST,
            port: CONFIG.Redis.REDIS_PORT,
            password: CONFIG.Redis.REDIS_PASSWORD,
            db: CONFIG.Redis.REDIS_DATABASE_NUMBER
        };

        const redisClient = new Redis(redisDetails);

        redLock = new Redlock([redisClient as any], {
            driftFactor: 0.01,
            retryCount: -1,
            retryDelay: 25,
            retryJitter: 20,
            // automaticExtensionThreshold: 500
        });

        redLock.on('error', async (error: any) => { await ErrorLogger('RedLock Error : ', error); });

        console.log('RedLock Connected !');

    } catch (error: any) {
        console.log('RedLockConnction Error : ', error);
    };
};

const ApplyLock = async (Path: string, LockId: string) => {

    try {

        await Logger("ApplyLock", JSON.stringify({ Path, LockId }));

        const Lock = await redLock.acquire([LockId], 2 * 1000);

        return Lock;

    } catch (error: any) {
        await ErrorLogger('ApplyLock Error : ', error);
    };
};

const RemoveLock = async (Path: string, Lock: any) => {

    try {

        await Logger("RemoveLock", JSON.stringify({ Path, LockId: Lock?.resources }));

        await Lock.release();

    } catch (error: any) {
        await ErrorLogger('RemoveLock Error : ', error);
    };
};

export { RedLockConnction, ApplyLock, RemoveLock };
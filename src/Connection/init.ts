import 'dotenv/config';
import { HttpConnection } from './http';
import { HttpsConnection } from './https';
import { RedisConnection } from './redis';
import { RedLockConnction } from './redlock';
import { SocketConnection } from './socket';
import { EmitterON } from './emitterOn';
import { Config } from '../Config';

const Initialize = async () => {

    try {

        const { ENVIRONMENT } = process.env;

        const CONFIG = Config();

        console.log(new Date());
        // console.log('CONFIG >', CONFIG);

        if (ENVIRONMENT === 'live') {

            await Promise.all([

                HttpsConnection(),
                RedisConnection(),
                SocketConnection(),
                RedLockConnction(),
                EmitterON(),

            ]);

        } else {

            await Promise.all([

                HttpConnection(),
                RedisConnection(),
                SocketConnection(),
                RedLockConnction(),
                EmitterON(),

            ]);

        };

    } catch (error) {
        console.log('Initialize Error : ', error);
    };
};

export { Initialize };
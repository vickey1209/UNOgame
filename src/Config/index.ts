import 'dotenv/config';
import { LiveConfig } from './liveConfig';
import { DevConfig } from './devConfig';

const Config = () => {

    if (process.env.ENVIRONMENT === 'live') {

        return LiveConfig();

    } else {

        return DevConfig();

    }
};

export { Config };
import winston from "winston";

import { Config } from "../Config";

const logger = winston.createLogger({

    format: winston.format.combine(

        winston.format.simple(),
        // winston.format.colorize({ all: true }),
        winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss.SSS' }),
        winston.format.printf(info => `${info.timestamp} : ${info.level} >> ${info.message}`)

    ),
    transports: [new winston.transports.Console()]

});

const Logger = async (Path: string, Data: string) => {

    try {

        const CONFIG = Config();

        if (CONFIG.GamePlay.LOG) {

            // const CountryTime = new Date().toLocaleString("en-US", { timeZone: 'Asia/Calcutta' });
            // console.log(new Date(CountryTime));

            // console.log(`Path : ${Path} >> Data : ${Data}`);
            // console.log(new Date());
            // console.log('.');

            // console.log(typeof Data === "string");

            // if (typeof Data === "string") { Data = JSON.parse(Data) }

            // if (typeof Path !== "string") { console.log('Path'); }

            // if (typeof Data !== "string") { console.log('Data'); }

            // const ErrorRezex = /Error/g;

            // if (Path.match(ErrorRezex)) {

            //     logger.error(`${Path}${Data}`);
            //     // logger.error(JSON.stringify({ Path, Data }));

            // } else {

            //     logger.info(JSON.stringify({ Path, Data }));

            // };

            logger.info(`Path : ${Path} >> Data : ${Data}`);
            logger.info('.');
            // logger.info(JSON.stringify({ Path, Data }));

        };

    } catch (error) {
        console.log('Logger Error : ', error);
    };
};

const ErrorLogger = async (Path: string, Data: string) => {

    try {

        logger.error({ Path, Data });
        // logger.error(`${Path}${Data}`);

    } catch (error) {
        console.log('ErrorLogger Error : ', error);
    };
};

export { Logger, ErrorLogger };
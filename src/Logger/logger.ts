import { Config } from "../Config";

const Logger = async (Path: string, Data: string) => {

    const CONFIG = Config();

    if (CONFIG.GamePlay.LOG) {

        // const CountryTime = new Date().toLocaleString("en-US", { timeZone: 'Asia/Calcutta' });
        // console.log(new Date(CountryTime));

        console.log(`Path : ${Path} >> Data : ${Data}`);
        console.log(new Date());
        console.log('.');
    };
};

export { Logger };
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const Config_1 = require("../Config");
const Logger = (Path, Data) => {
    const CONFIG = (0, Config_1.Config)();
    if (CONFIG.GamePlay.LOG) {
        const CountryTime = new Date().toLocaleString("en-US", { timeZone: 'Asia/Calcutta' });
        console.log(`Path : ${Path} >> Data : ${Data}`);
        console.log(new Date(CountryTime));
        console.log('.');
    }
    ;
};
exports.Logger = Logger;

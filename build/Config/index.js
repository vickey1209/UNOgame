"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
require("dotenv/config");
const liveConfig_1 = require("./liveConfig");
const devConfig_1 = require("./devConfig");
const Config = () => {
    if (process.env.ENVIRONMENT === 'live') {
        return (0, liveConfig_1.LiveConfig)();
    }
    else {
        return (0, devConfig_1.DevConfig)();
    }
    ;
};
exports.Config = Config;

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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpsServer = exports.HttpsConnection = void 0;
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = require("fs");
const Config_1 = require("../Config");
let httpsServer;
exports.httpsServer = httpsServer;
const HttpsConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const CONFIG = (0, Config_1.Config)();
        const KeyPath = CONFIG.KeyPath ? CONFIG.KeyPath : '';
        const CertPath = CONFIG.CertPath ? CONFIG.CertPath : '';
        const app = (0, express_1.default)();
        app.use((0, cors_1.default)());
        app.use(express_1.default.json());
        if ((0, fs_1.existsSync)(CertPath) && (0, fs_1.existsSync)(KeyPath)) {
            const KeyData = (0, fs_1.readFileSync)(KeyPath, 'utf-8');
            const CertData = (0, fs_1.readFileSync)(CertPath, 'utf-8');
            const ServerOptions = { key: KeyData, cert: CertData };
            exports.httpsServer = httpsServer = https_1.default.createServer(ServerOptions, app);
            httpsServer.listen(CONFIG.ServerPort, () => { console.log(`Server listening on port ${CONFIG.ServerPort} !`); });
        }
        else {
            exports.httpsServer = httpsServer = http_1.default.createServer(app);
            httpsServer.listen(CONFIG.ServerPort, () => { console.log(`Server listening on port ${CONFIG.ServerPort} !`); });
            console.log('Alert : Certificate Files Not Found');
        }
        ;
        app.get('/', (req, res) => { res.send('Oops !!!'); });
        app.get('/test', (req, res) => { res.send('UNO !!!'); });
    }
    catch (error) {
        console.log('HttpsConnection Error : ', error);
    }
});
exports.HttpsConnection = HttpsConnection;

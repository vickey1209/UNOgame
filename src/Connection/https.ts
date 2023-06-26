import http from 'http';
import https from 'https';
import express from 'express';
import cors from 'cors';
import { existsSync, readFileSync } from 'fs';
import { Config } from '../Config';

let httpsServer: any;

const HttpsConnection = async () => {

    try {

        const CONFIG = Config();
        const KeyPath = CONFIG.KeyPath ? CONFIG.KeyPath : '';
        const CertPath = CONFIG.CertPath ? CONFIG.CertPath : '';

        const app = express();

        app.use(cors());
        app.use(express.json());

        if (existsSync(CertPath) && existsSync(KeyPath)) {

            const KeyData = readFileSync(KeyPath, 'utf-8');
            const CertData = readFileSync(CertPath, 'utf-8');

            const ServerOptions = { key: KeyData, cert: CertData };

            httpsServer = https.createServer(ServerOptions, app);
            httpsServer.listen(CONFIG.ServerPort, () => { console.log(`Server listening on port ${CONFIG.ServerPort} !`); });

        } else {

            httpsServer = http.createServer(app);
            httpsServer.listen(CONFIG.ServerPort, () => { console.log(`Server listening on port ${CONFIG.ServerPort} !`); });

            console.log('Alert : Certificate Files Not Found');

        };

        app.get('/test', (req, res) => { res.send('UNO !!!'); });

    } catch (error) {
        console.log('HttpsConnection Error : ', error);
    }
}

export { HttpsConnection, httpsServer };
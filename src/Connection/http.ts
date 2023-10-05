import http from 'http';
import { Config } from '../Config';
import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

const httpServer: any = http.createServer(app);

const HttpConnection = async () => {

    const CONFIG = Config();

    const PORT = CONFIG.ServerPort;
    httpServer.listen(PORT, () => { console.log(`Server listening on port ${PORT} !`); });

    app.get('/', (req, res) => { res.send('UNO !!!'); });
    app.get('/test', (req, res) => { res.send('UNO !!!'); });
};

export { HttpConnection, httpServer };
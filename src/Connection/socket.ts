import 'dotenv/config';
import { Server } from 'socket.io';
import { httpServer } from './http';
import { httpsServer } from './https';
import { createAdapter } from '@socket.io/redis-adapter';
import { pubClient, subClient } from './redis';
import { Logger } from '../Logger/logger';
import { EventCases } from '../EventCases/eventCases';
import { DisconnectHandler } from '../DisconnectHandler/disconnectHandler';

let io: any;

const SocketConnection = async () => {

    try {

        const { ENVIRONMENT } = process.env;

        const server = ENVIRONMENT === 'live' ? httpsServer : httpServer;

        io = new Server(server);

        io.adapter(createAdapter(pubClient, subClient));

        console.log(`Socket IO Done !`);

        io.on('connection', async (socket: any) => {

            Logger("SocketConnection", JSON.stringify(socket.id));

            EventCases(socket);

            socket.on('disconnect', async (reason: any) => {

                await socket.disconnect();

                Logger("Disconnect", JSON.stringify(socket.id));

                Logger("Disconnect Reason.", JSON.stringify(reason));

                await DisconnectHandler(socket);
                
            });
        });

    } catch (error) {
        console.log('SocketConnection Error : ', error);
    }
};

export { SocketConnection, io };
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

        // let NumberOfSocketsOnServer = 0, NumberOfSocketsOnRoom = 0;

        io.on('connection', async (socket: any) => {

            // NumberOfSocketsOnServer = io.of("/").sockets.size;
            // NumberOfSocketsOnRoom = io.sockets.adapter.rooms.get('TABLE')?.size ? io.sockets.adapter.rooms.get('TABLE')?.size : 0;

            await Logger("SocketConnection....", JSON.stringify(socket.id));

            await EventCases(socket);

            socket.on('disconnect', async (reason: any) => {

                // NumberOfSocketsOnServer = io.of("/").sockets.size;

                await socket.disconnect();

                await Logger("Disconnect", JSON.stringify(socket.id));

                await Logger("Disconnect Reason.", JSON.stringify(reason));

                await DisconnectHandler(socket);

            });
        });

    } catch (error) {
        console.log('SocketConnection Error : ', error);
    };
};

export { SocketConnection, io };
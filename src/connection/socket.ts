import requestHandler from "../requestHandlers/index";
import { MESSAGES, NUMERICAL, REDIS, SOCKET } from "../constants";
import global from "../global";
// import disconnectHandler from "../requestHandlers/disconnectHandler";
import Logger from "../logger";
import redis from "./redis"
import server from "./server";
import { decrCounter, getOnliPlayerCount, incrCounter, setCounterIntialValue } from "../cache/onlinePlayer";
const SocketIO = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');

let socketClient: any;

async function socket(io: any) {
    try {

        const { pubClient, subClient } = await redis.redisconnect();

        if (!pubClient || !subClient) {
            process.exit(1);
        }

        global.IO = io;
        await io.adapter(createAdapter(pubClient, subClient));
        io.on(SOCKET.CONNECTION, async (socket: any) => {

            Logger.info("<<== Socket connect :: SUCCESS ===>> user connection sockrtId ::", socket.id);

            // for all online users 
            let getOnlinePlayerCount = await getOnliPlayerCount(REDIS.ONLINEPLAYER);
            Logger.info("getOnlinePlayerCount :>>", getOnlinePlayerCount);

            if (!getOnlinePlayerCount) {
                const counterIntialValue = await setCounterIntialValue(REDIS.ONLINEPLAYER);
            }

            let count = await incrCounter(REDIS.ONLINEPLAYER)
            Logger.info('insertNewPlayer :: count ::>> ', count);
           
            const token = socket.handshake.auth.token;
            Logger.info('connectionCB token :>> ', token);
            socket.authToken = token;

            
            socket.on(SOCKET.ERROR, function (err: any) {
                Logger.error(" SOCKET ERROR :: ", err);
            });

            socket.on(SOCKET.DISCONNECT, async(disc: any) => {
                await decrCounter(REDIS.ONLINEPLAYER);
                // disconnectHandler({}, socket);
                Logger.warn(" SOCKET DISCONNECT ::", disc, "socketID::", socket.id);
            });

            socket.use(requestHandler.bind(socket));
        });

        return io;

    } catch (error) {
        Logger.error(" SOCKET function ERROR :: ", error);
    }
}

export default { socketconnect: socket }
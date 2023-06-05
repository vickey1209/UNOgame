
import Logger from "../logger";
import global from "../global";
import { responseData } from "../interfaces/responseData";

class SocketOperation {
    async sendEventToClient( socket: any, responseData: responseData, tableId: string) {
        try {
            let socketObj = socket;
            // if(responseData.eventName === "HEART_BEAT") {
            // Logger.info("======== send event heratBeat=========>>", responseData);
            // }
            if (typeof socketObj === 'string') {
                socketObj = await global.IO.sockets.sockets.get(socket);
                // global.IO.to(socket).emit(SOCKET.RESPONSE, JSON.stringify(data));
                global.IO.to(socket).emit(responseData.eventName, JSON.stringify(responseData));
        
            } else {
                socketObj.emit(responseData.eventName, JSON.stringify(responseData));
                return;
            }
    
        } catch (error) {
            Logger.error(tableId,error, ` table ${tableId} function sendEventToClient`);
        }
    }

    async sendEventToRoom(roomId: string, responseData: responseData, socketId?: string,) {
        const tableId = roomId;
        try {

            let getRoom = global.IO.sockets.adapter.rooms.get(roomId);
            console.log('getRoom All socketId:>> ', getRoom);
            if(getRoom){
            const roomeSize = global.IO.sockets.adapter.rooms.get(roomId).size;
            Logger.info(tableId,'roomeSize ::===>> ', roomeSize);
            }
            
            if (typeof socketId == 'string') {
            var socket = await global.IO.sockets.sockets.get(socketId);
            global.IO.to(socket.tableId).emit(responseData.eventName, JSON.stringify(responseData));
            }
            else {
            global.IO.to(roomId).emit(responseData.eventName, JSON.stringify(responseData));
            }
        } catch (error) {
            Logger.error(tableId,error, ` table ${roomId} function sendEventToRoom`);
        }
    }

    async addClientInRoom( socketId: any, roomId: string, userId: string) {
        try {
            let socket: any;
            // Logger.info("addClientInRoom :: socket =>> ", typeof socketId); 
            if (typeof socketId == 'string') {
              socket = await global.IO.sockets.sockets.get(socketId);
              socket.eventData = { tableId: roomId, userId };
              socket.tableId = roomId;
              socket.join(roomId);
            } else if (socket !== 'string') {
              socketId.eventData = { tableId: roomId, userId };
              socket.tableId = roomId;
              socketId.join(roomId);
            }
            return true
        } catch (error) {
            Logger.error(userId,
                error,
                ` table ${roomId} user ${userId} function addClientInRoom`
            );
        }
    }

    async leaveClientInRoom(socket: any, roomId: any): Promise<any> {
        const tableId = roomId;
        try {
            Logger.info(tableId,'leaveClientInRoom :: >>>', roomId);
            if (socket !== 'string' && socket.emit) {
            if (typeof socket != 'undefined' && socket.emit) socket.leave(roomId);
            } else {
            socket = await global.IO.sockets.sockets.get(socket);
            if (typeof socket != 'undefined' && socket.emit) socket.leave(roomId);
            }
        } catch (error) {
            Logger.error(tableId,"LEAVE CLIENT SOCKET ROOM :: ERROR ::", error)
        }
    }

    async getAllSocket(tableId: string): Promise<any> {
        try {
            const sockets = await global.IO.in(tableId).fetchSockets();
            Logger.info(tableId,'sockets ::: getAllSocket :: type nof :: ', typeof sockets)
            return sockets
          } catch (error) {
            Logger.error(tableId,"GET ALL SOCKET FROM ROOM :: EROOR ::", error)
          }
    }

    async getSocketFromSocketId(socketId: string) {
        // return socketConn.socketClient.sockets.sockets.get(socketId);
        const socket = await global.IO.sockets.sockets.get(socketId);;
        return socket;
    }
}

export const socketOperation = new SocketOperation();

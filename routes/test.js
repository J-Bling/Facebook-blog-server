"use strict";
import { Server } from "socket.io";
import { Chat, Message } from '../model/Chat_model.js';
class ChatBoxs {
    constructor(server) {
        this.rooms = {};
        this.socket = null;
        this.cache = [];
        this.custom = null;
        this.chatUpdate = new Map();
        this.cacheTimeId = null;
        this.updateTime = 60 * 60 * 1000;
        this.updateTimeId = null;
        this.createSocket(server);
        this.startClearCache();
    }

    createSocket(server) {
        if (this.socket !== null) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.socket = new Server(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            },
            path: "/chat",
            maxPayload: 1000000
        });
        this.custom = this.socket.of("/custom");
        this.custom.use((socket, next) => this.auth(socket, next));
        this.custom.on("connection", (socket) => this.listening(socket));
    }

    async auth(socket, next) {
        const userId = socket.handshake.auth?.userId;
        const friendId = socket.handshake.query?.friendId;
        if (!userId || !friendId) return next(new Error("错误访问"));
        next();
    }

    listening(socket) {
        const userId = socket.handshake.auth.userId;
        const friendId = socket.handshake.query.friendId;

        socket.on("join-room", (chatId) => this.handleJoinRoom(chatId, socket, userId));
        socket.on("leave-room", (chatId) => this.handleLeaveRoom(chatId, socket, userId));
        socket.on("send-room", ({ chatId, content }) => this.handleSendMessage(chatId, content, socket, userId, friendId));
    }

    handleJoinRoom(chatId, socket, userId) {
        socket.join(chatId);
        if (!this.rooms[chatId]) this.rooms[chatId] = { users: [] };
        if (!this.rooms[chatId].users.includes(userId)) this.rooms[chatId].users.push(userId);
        socket.emit("notices", { value: 1 });
        socket.to(chatId).emit("friendStatus", { message: `you friend had in the room` ,value:1});
    }

    handleLeaveRoom(chatId, socket, userId) {
        socket.leave(chatId);
        if (this.rooms[chatId] && this.rooms[chatId].users.includes(userId))
            this.rooms[chatId].users = this.rooms[chatId].users.filter(item => item !== userId);
        socket.to(chatId).emit("friendStatus", { message: `you friend had in the room` ,value:0});
    }

    async handleSendMessage(chatId, content, socket, userId, friendId) {
        if (!this.rooms[chatId]) this.rooms[chatId] = { users: [userId] };
        if (!this.rooms[chatId].users.includes(userId)) this.rooms[chatId].users.push(userId);
        socket.to(chatId).emit("response", content);
        const status = this.rooms[chatId].users.length === 2;

        const message = await this.createMessage(userId, friendId, content, status);
        if (message) {
            this.cache.push(message.toObject());
            await this.addChatUpdate(chatId, userId, friendId, message._id);
        }
    }

    async createMessage(userId, friendId, content, status) {
        if (content.length > 0) {
            const message = new Message({
                sender: userId,
                receiver: friendId,
                create_time: Date.now(),
                content: content,
                status: status
            });
            return message;
        }
    }

    async addChatUpdate(chatId, userId, friendId, messageId) {
        if (!this.chatUpdate.has(chatId)) {
            const chat = await Chat.findOne({ users: { $all: [userId, friendId] } }).select("_id").lean();
            this.chatUpdate.set(chatId, { chat: chat._id, messages: [], time: "" });
        }
        const update = this.chatUpdate.get(chatId);
        update.messages.push(messageId);
        update.time = Date.now();
    }

    startClearCache() {
        if (this.cacheTimeId !== null) {
            clearInterval(this.cacheTimeId);
            this.cacheTimeId = null;
        }
        this.cacheTimeId = setInterval(async () => {
            if (this.cache.length > 0) {
                await Message.insertMany(this.cache);
                this.cache = [];
                await this.insertChat();
            }
            this.updateChatBox();
        }, 5 * 60 * 1000);
    }

    async insertChat(){
        if(!this.chatUpdate) return ;
        const updates=[];
        for(const [key,value] of this.chatUpdate.entries()){
            if(value.messages.length>0){
                updates.push({
                    updateOne:{
                        filter:{_id:value.chat},
                        update:{$push:{messages:{$each:value.messages}}}
                    }
                });
                this.chatUpdate[key].messages=[];
            }
        }
        if(updates.length>0) await Chat.bulkWrite(updates);
    }
    
    updateChatBox() {
        const now = Date.now();
        for (const [key, value] of this.chatUpdate.entries()) {
            if (now - value.time > this.updateTime) this.chatUpdate.delete(key);
        }
    }

    stopClearCache() {
        if (this.cacheTimeId !== null) clearInterval(this.cacheTimeId);
    }

}

export default ChatBoxs;
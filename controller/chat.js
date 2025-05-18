"use strict";
import { Message,Chat } from "../model/Chat_model";

class ChatBox{
    constructor(){
        this.MessageQueues=[];
        this.ChatCache=new Map();
        this.ChatUpdates={};
        this.timerId=null;
        this.cacheTimeId=null;
        this.MaxMsgQueues=150;
        this.CacheTTl=60*60*1000;

        try{
            this.startProcessQueues();
            this.startCacheClear();
        }catch(error){
            console.error("error",error);
        }
    }
    error_res=function(res,message,status,statu){
        return res.status(status).json({
            message:message,
            status:statu
        });
    }

    succeed_res=function(res,data,message='ok',status=200,statu=2){
        return res.status(status).json({
            message:message,
            status:statu,
            data:data
        });
    }
    clearCache(){
        if(this.ChatCache.size===0) return ;
        const date=Date.now();
        this.ChatCache.forEach((value,key)=>{
            if(date-value.time>=this.CacheTTl){
                this.ChatCache.delete(key);
            }
        });
    }
    
    startProcessQueues(){
        if(this.timerId !==null)
            clearInterval(this.timerId);

        this.timerId=setInterval(async()=>{
            await this.InsertMessage();
            await this.updateChat();
        },5*60*1000);
    }

    stopProcessQueues(){
        if(this.timerId !==null){
            clearInterval(this.timerId);
            this.timerId=null;
        }
    }

    startCacheClear(){
        if(this.cacheTimeId !==null){
            clearInterval(this.cacheTimeId);
        }
        this.cacheTimeId=setInterval(async ()=>{
            this.clearCache();
        },5*60*1000);
    }

    stopCacheClera(){
        if(this.cacheTimeId !==null){
            clearInterval(this.cacheTimeId);
            this.cacheTimeId=null;
        }
    }

    async InsertMessage(){
        try{
            if(this.MessageQueues.length===0) return ;
            await Message.insertMany(this.MessageQueues.map(msg=>msg.toObject()));
            this.MessageQueues=[];
        }catch(error){
            throw error;
        }
    }

    async updateChat(){
        try{
            const updateMessage=[];
            for(const [id,value] of Object.entries(this.ChatUpdates)){
                updateMessage.push({
                    updateOne:{
                        filter:{_id:id},
                        update:{
                            $push:{messages:{$each:value}}
                        }
                    }
                });
            }
            if(updateMessage.length>0){
                await Chat.bulkWrite(updateMessage);
                this.ChatUpdates={};
            }
        }catch(error){
            throw error;
        }
    }

    SendMessage=async (req,res)=>{
        try{
            const user=req.user;
            const data=req.body;
            if(!data || !data.receiverId || !data.content)
                return this.error_res(res,"错误访问",401,4);

            const message=new Message({
                sender:user._id,
                receiver:data.receiverId,
                content:data.content,
                status:data.status || false
            }); 
            this.MessageQueues.push(message);
            
            let chatId=null;
            const Key=JSON.stringify([user._id.toString(),data.receiverId].sort());
            const cacheChat=this.ChatCache.get(Key);
            if(!cacheChat){
                Newchat=await Chat.findOne({users:{$all:[user._id,data.receiverId]}}).select("_id").lean();
                if(Newchat){
                    chatId=Newchat._id;
                    this.ChatCache.set(Key,{id:chatId,time:Date.now()});
                }else return this.error_res(res, "找不到对应的聊天记录", 404, 4);
            }else {
                chatId=cacheChat.id;
                cacheChat.time=Date.now();
            }

            if(!this.ChatUpdates[chatId]) this.ChatUpdates[chatId]={Message:[]};
            this.ChatUpdates[chatId].Message.push(message._id);
            
            if(this.MessageQueues.length>this.MaxMsgQueues)
                await this.InsertMessage();
            return this.succeed_res(res,1);

        }catch(error){
            console.error("error",error);
            return this.error_res(res,"服务器错误",500,5);
        }
    }
}

export default new ChatBox();
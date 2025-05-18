"use strict";
import mongoose from "mongoose";

const MessageSchema=new mongoose.Schema({
    content:String,
    create_time:{type:Date,default:Date.now()},
    status:{type:Boolean,default:false},
    sender:{
        type:mongoose.Types.ObjectId,
        ref:"User"
    },
    receiver:{
        type:mongoose.Types.ObjectId,
        ref:"User"
    }
});
const Message=mongoose.model("Message",MessageSchema);

const ChatSchema =new mongoose.Schema({
    users:[{type:mongoose.Types.ObjectId,ref:"User"}],
    messages:[{
        type:mongoose.Types.ObjectId,
        ref:"Message"
    }],
    create_time:{type:Date,default:Date.now()},
    chatType:{type:Number,default:0},
});
const Chat=mongoose.model("Chat",ChatSchema);

Chat.createMessage=async function(senderId,receiverId,content){
    try{
        const chat=await Chat.exists({users:{$all:[senderId,receiverId]}});
        if(!chat) return null;

        const message =new Message({
            content:content,
            sender:senderId,
            receiver:receiverId
        });
        await message.save();
        chat.messages.push(message._id);
        await chat.save();
        return true;
    }catch(error){
        console.error("error",error);
        return null;
    }
}

export {Chat};
export {Message};
import mongoose from "mongoose";
"use strict";
const userSchema=new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,unique:true,lowercase: true, trim: true },
    password:{type:String,required:true},
    create_time:{type:Date,default:Date.now()},
    last_time:Date,
    image:String,
    admin:{type:Number,default:0},
    posts:[{type:mongoose.Schema.Types.ObjectId,ref:"Post",default: []}],
    comments:[{type:mongoose.Schema.Types.ObjectId,ref:"Comment",default: []}],
    friends:[{type:mongoose.Schema.Types.ObjectId,ref:"User",default:[]}],
    friendapplications:[{type:mongoose.Schema.Types.ObjectId,ref:"User",default:[]}]
});

const codeSchema=new mongoose.Schema({
    email:{type:String,unique:true,required:true,lowercase: true, trim: true },//lowercase 转小写 trim 去空格
    code:String,
    send_time:Date,
    valid_time:{type:Number,default:300 * 1000}// 有效五分钟
});

export const Code=mongoose.model("Code",codeSchema);
export const User=mongoose.model("User",userSchema);
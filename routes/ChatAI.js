"use strict";
import express from 'express';
import ChatKimi from '../controller/kimi_.js'
import ChatQW from '../controller/qianwen.js';
const router=express.Router();

router.post("/kimi_",async (req,res)=>{
    try{
        const data=req.body;
        if(!data || !data.content){
            return res.status(401).json({
                message:"参数错误",
                status:4
            });
        }

        const AI=new ChatKimi();
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');
        for await (var text of AI.post(data.content)){
            res.write(text);
        }
        res.end();
    }catch(error){
        console.log("error_router",error);
        res.status(500).json({
            message:"服务器出错",
            status:5
        });
    }
});

router.post("/qianwen",async (req,res)=>{
    try{
        const data=req.body;
        if(!data || !data.content){
            return res.status(401).json({
                message:"参数错误",
                status:4
            });
        }

        const AI=new ChatQW();
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');

        for await (let text of AI.post(data.content)){
            res.write(text);
        }
        res.end();

    }catch(error){
        console.log("error",error);
        res.status(500).json({
            message:"服务器错误",
            status:5
        });
    }
});

export default router;
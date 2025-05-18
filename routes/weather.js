"use strict";
import express from 'express';
const router=express.Router();

router.get("/test",async function(req,res){
    try{
        const url = 'https://weather.cma.cn/api/now/59287';
        const headers = new Headers({
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
            Connection: 'keep-alive',
            Priority: 'u=0, i',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15'
        });
        const requestConfig = {
            method: 'GET',
            headers: headers,
            cache: 'default',
            redirect: 'follow',
            referrerPolicy: 'strict-origin-when-cross-origin'
        };
        const response = await fetch(url, requestConfig);
        const data=await response.json();
        return res.status(200).json({
            messages:"ok",
            status:2,
            data:data
        });
    }catch(e){
        return res.status(500).json({
            status:5,message:"服务器错误"
        });
    }
});

export default router;
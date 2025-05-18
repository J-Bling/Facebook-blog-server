"use strict";
import {User} from '../model/Auth_model.js';
import jwt from'jsonwebtoken';


class Identify{
    constructor(){
        this.JWT_KEY=process.env.JWT_SECRET;
        this.whiteList=[
            '/test/v1','/api/user/login','/api/user/register','/api/user/send-code',
            '/api/post/postsList','/api/ai/kimi_','/api/ai/qianwen','/test/test','/api/count/views'
        ]
    }
    verify_token= async (req,res,next)=>{
        try{
            const path=req.path;
            console.log(path);
            if(this.whiteList.includes(path) || path.includes('/api/post/postsList')){
                return next();
            }
            const headerAuth=req.headers.authorization;
            if(!headerAuth){
                return this.res_error(res);
            }  
            const token =headerAuth.split(" ")[1];
            const value=this.decode_token(token);
            if(!value)
                return this.res_error(res);
            const user=await User.findOne({_id:value}).select("_id").lean();
            if(!user)
                return this.res_error(res);
            req.user=user;
            next();

        }catch(error){
            console.error('is',error);
            res.status(500).json({
                message:"服务器出错",
                status:5,
                value:null
            });
        }

    }
    decode_token(token){
        try{
            const decode=jwt.verify(token,this.JWT_KEY);
            return decode.id;
        }catch(error){
            console.log("error :",error);
            return null;
        }
    }
    res_error(res){
        res.status(401).json({
            message:"登陆过期，请重新登陆",
            value:"token_die",
            status:5
        });
    }
}

export default new Identify();
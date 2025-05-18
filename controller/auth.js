"use strict";
import {User,Code} from '../model/Auth_model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Email_Code from '../utils/SendCode.js';

class Auth{
    constructor(){
        this.hash_factor=10;
        this.JWT_KEY=process.env.JWT_SECRET;
    }

    login= async (req,res)=>{
        try{
            const data=req.body;
            if(!data.email || !data.password)
                return res.status(401).send({
                    message:"参数错误",
                    status:4
                });
            const user=await User.findOne({email:data.email}).select("_id name image password email").lean();
            if(user && await bcrypt.compare(data.password,user.password)){
                await User.updateOne({_id:user._id},{$set:{last_time:Date.now()}});
                const token=jwt.sign({id:user._id},this.JWT_KEY,{expiresIn: "3d"});
                return res.status(200).json({
                    token:token,
                    user_data:{
                        id:user._id,
                        name:user.name,
                        image:user.image,
                    },
                    message:'登陆成功',
                    status:2
                })
            }else{
                return res.status(400).send({
                    message:"邮箱或者密码错误",
                    status:4
                });
            }

        }catch(error){
            console.log('error',error);
            return res.status(500).send({
                message:"服务器出错",
                status:5
            });
        }
    }

    register= async (req,res)=>{
        let data=req.body;

        if(!data || !data.email || ! data.name || !data.password || !data.code){
            return res.status(401).send({
                message:"无效参数",
                status:401,
                type:"bad request"
            })
        }

        try{
            if(! this.check_email(data.email)){
                return res.status(401).send({
                    message:"邮箱号无效"
                });
            }
            const existeUser=await User.findOne({email:data.email});
            if(existeUser){
                return res.status(400).send({
                    message:"该邮箱已被注册",
                    status:4,
                    type:"bad request"
                })
            }
        
            const code=await Code.findOne({email:data.email});
            if(!code || data.code !==code.code || Date.now()-code.send_time> code.valid_time){
                return res.status(403).send({
                    message:"验证码无效"
                });
            }

            const hash_password=await this.hashPassword(data.password);
            const image_url=random_Image();
            if(!hash_password || !image_url)
                return res.status(500).send({
                    message:"服务器出错",
                    status:5
                });
            
            await User.create({
                name:data.name,
                email:data.email,
                password:hash_password,
                image:image_url
            });
            return res.status(200).json({message:"创建成功",status:2});

        }catch(error){
            console.error("error",error);
            return res.status(500).send({
                message:"服务器出错"
            });
        }

        function random_Image(){
            const image_array=[
                'https://www.keaitupian.cn/cjpic/frombd/2/253/1676065055/2828606542.jpg',
                'https://tse3-mm.cn.bing.net/th/id/OIP-C.yp-D-KHI3e2nN4eMBJcEVAAAAA?w=219&h=219&c=7&r=0&o=5&dpr=2&pid=1.7',
                'https://tse3-mm.cn.bing.net/th/id/OIP-C.y6rdSCGpxbfeb8Rd1CpSuwAAAA?w=218&h=219&c=7&r=0&o=5&dpr=2&pid=1.7',
                'https://tse3-mm.cn.bing.net/th/id/OIP-C.LmYB_V97BlBjfRj8wKX44gAAAA?w=218&h=219&c=7&r=0&o=5&dpr=2&pid=1.7',
                'https://tse4-mm.cn.bing.net/th/id/OIP-C.H9x1BxITI75Tc3IMOKJekwAAAA?w=219&h=219&c=7&r=0&o=5&dpr=2&pid=1.7',
                'https://tse3-mm.cn.bing.net/th/id/OIP-C.7GLMYPqMlt2LgkbPsOnDIAAAAA?w=164&h=180&c=7&r=0&o=5&dpr=2&pid=1.7',
                'https://tse1-mm.cn.bing.net/th/id/OIP-C.vMBtbJZf0WF96_DRvdtHcQAAAA?w=162&h=180&c=7&r=0&o=5&dpr=2&pid=1.7',
                'https://tse4-mm.cn.bing.net/th/id/OIP-C.8NKbqA2JWQif-dYyY0s-xAAAAA?w=203&h=203&c=7&r=0&o=5&dpr=2&pid=1.7',
                'https://tse1-mm.cn.bing.net/th/id/OIP-C.PeMwvx8RUDQspH3Mzax6nQAAAA?w=151&h=166&c=7&r=0&o=5&dpr=2&pid=1.7',
                'https://tse3-mm.cn.bing.net/th/id/OIP-C.9pl_NT5W6pEHDtMD3pM3dwAAAA?w=164&h=180&c=7&r=0&o=5&dpr=2&pid=1.7',
                'https://tse3-mm.cn.bing.net/th/id/OIP-C.VmDJtdkEhuS9Nof3fVGwUgAAAA?w=164&h=180&c=7&r=0&o=5&dpr=2&pid=1.7',
                'https://tse1-mm.cn.bing.net/th/id/OIP-C.OSFH3hIukHqh-qrOvIfUWgAAAA?w=151&h=188&c=7&r=0&o=5&dpr=2&pid=1.7',
                'https://tse4-mm.cn.bing.net/th/id/OIP-C.MoF1-mWdoyjOkCI0gYH9uAAAAA?w=151&h=166&c=7&r=0&o=5&dpr=2&pid=1.7'
            ]
            const long=image_array.length;
            const index=Math.floor(Math.random() * long);
            return image_array[index]
        }
    }

    hashPassword= async (password)=>{
        try{
            const hash_password=await bcrypt.hash(password,this.hash_factor);
            return hash_password;
        }catch(error){
            console.log("error",error);
            return null;
        }
    }

    send_code=async (req,res,next)=>{
        try{
            const data=req.body;

            if(!data || !data.email){
                return res.status(401).json({
                    message:"不能发生空内容",
                    status:4
                });
            }
            if(!this.check_email(data.email)){
                return res.status(400).json({
                    message:"参数错误",
                    status:4
                });
            }
            var code =await Code.findOne({email:data.email});
            var nowTime=Date.now();

            if(!code){
                const number =await Email_Code(data.email);
                if(!number){
                    return res.status(500).json({
                        message:"服务器出错",
                        status:5
                    });
                }
                code =await Code.create({
                    email:data.email,
                    send_time:nowTime,
                    code:number
                });
                return res.status(200).json({
                    message:"验证码已发生,请注意查收",
                    status:2
                });
            }else{
                if(nowTime- code.send_time>120*1000){
                    const number =await Email_Code(data.email);
                    if(!number){
                        return res.status(500).json({
                            message:"服务器出错",
                            status:5
                        });
                    }
                    code.send_time=nowTime;
                    code.code=number;
                    code.save();
                    return res.status(200).json({
                        message:"验证码已发生,请注意查收",
                        status:2
                    });

                }else{
                    return res.status(400).json({
                        message:"距离上次验证码发送不足2分钟",
                        status:4
                    });
                }
            }
        }catch(error){
            console.error("error :",error);
            return res.status(500).json({
                message:"服务器出错",
                status:5
            });
        }
    }

    check_email(email) {
        let re_email = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re_email.test(email);
    }
}

export default new Auth();
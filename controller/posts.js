"use strict";
import { User } from '../model/Auth_model.js';
import Post from '../model/Post_model.js';
import mongoose from 'mongoose';
class PostAPI{
    constructor(){
        this.maxLimit=20;
        this.minLimit=5;
    }

    postList =async (req,res)=>{
        try{
            let skips=req.params.skips;
            skips=skips ? Number(skips) :0;
            const posts=await Post.find({})
            .select('_id title summary views_count create_time')
            .populate({path:"author",select:"_id name image"})
            .limit(skips===0 ? this.maxLimit : this.minLimit)
            .skip(skips===0 ? 0: this.maxLimit+(skips-1)*this.minLimit)
            .lean();
            if(!posts || !posts.length){
                return res.status(200).json({
                    message:"ok",
                    status:2,
                    data:[]
                });
            }
            const data = posts.map(post => ({
                id: post._id,
                title: post.title,
                summary: post.summary,
                views_count: post.views_count,
                create_time: post.create_time,
                author: {
                    id: post.author._id,
                    username: post.author.name,
                    image: post.author.image
                }
            }));
            res.status(200).json({
                message:"ok",
                status:2,
                data:data
            });
        }catch(error){
            console.log('error',error);
            return res.status(500).json({
                message:"服务器错误",
                status:5
            });
        }
    }

    postDetail=async (req,res)=>{
        try{
            const postId =req.params.postId;
            if(!postId)
                return res.status(400).json({
                    message:"参数错误",
                    status:4
                });

            const post=await Post.findOne({_id:postId}).populate({path:"author",select:"_id name image "})
            .select('_id title content create_time views_count comments_status')
            .lean();
            if(!post)
                return res.status(401).json({
                    message:"找不到该索引",
                    status:4
                });
            await Post.updateOne({ _id: postId }, { $inc: { views_count: 1 } });
            const author=post.author;
            return res.status(200).json({
                message:"ok",
                status:2,
                data:{
                    id:postId,
                    title:post.title,
                    content:post.content,
                    create_time:post.create_time,
                    views_count:post.views_count,
                    comments_status:post.comments_status,
                    author:{
                        id:author._id,
                        username:author.name,
                        image:author.image
                    }
                }
            });
        }
        catch(error){
            console.log("error",error);
            return res.status(500).json({
                message:"服务器错误",
                status:5
            });
        }
    }

    createPost=async (req,res)=>{
        try{
            const user=req.user;
            const data =req.body;
            if(!user){
                return res.status(401).json({
                    message:"请先登陆",
                    status:4
                });
            }
            if(!data || ! data.title || !data.content){
                return res.status(400).json({
                    message:"参数不完整",
                    status:4
                });
            }
            var summary =data.summary && data.summary.length>1 ? data.summary : data.content.slice(0,200);
            const created=await Post.createPost(user._id,data.title,summary,data.content);
            if(created)
                return res.status(200).json({
                    message:"create succeed",
                    status:2
                });
            else return res.status(401).json({
                message:"发布失败",
                status:4
            });
        }catch(error){
            console.error("error",error);
            return res.status(500).json({
                message:"服务器错误",
                status:5
            });
        }
    }

    MyPosts=async (req,res)=>{
        try{
            const user=req.user;
            if(!user)
                return res.status(401).json({
                    message:"请登陆",
                    status:4
                });
            const users=await User.findOne({_id:user._id}).populate({
                path:"posts",
                select:"_id title summary views_count create_time"
            }).select("posts").lean();
            const posts=users.posts;
            const data = posts.map(post => ({
                id: post._id,
                title: post.title,
                summary: post.summary,
                views_count: post.views_count,
                create_time: post.create_time
            }));
            return res.status(200).json({
                message:"ok",
                status:2,
                data:data
            });

        }catch(error){
            console.error("error:",error);
            return res.status(500).json({
                message:"服务器错误",
                status:5
            });
        }
    }

    MyAuthorPost=async (req,res)=>{
        try{
            const post_id=req.params.postId;
            const postid=new mongoose.Types.ObjectId(post_id);
            const post=await Post.findOne({_id:postid})
            .select("_id content title summary create_time comments_status views_count").lean();
            if( !post) return res.status(404).json({message:"Not Founted"});

            const data={
                id:post._id,
                title:post.title,
                summary:post.summary,
                content:post.content,
                comments_status:post.comments_status,
                views_count:post.views_count,
                create_time:post.create_time
            }
            return res.status(200).json({
                message:"ok",
                status:2,
                data:data
            });

        }catch(e){
            console.error('error',e);
            return res.status(500).json({
                message:"错误查询",
                status:5
            });
        }
    }

    deletePost=async(req,res)=>{
        try{
            const post_id=req.params.postId;
            const postId=new mongoose.Types.ObjectId(post_id);
            const user=req.user;
            if(!postId || !user)
                return res.status(400).json({
                    message:"错误参数",
                    status:4
                });
            const deleted=await Post.deletePost(postId,user._id);
            if(deleted)
                return res.status(200).json({
                    message:"ok",
                    status:2
                });
            return res.status(401).json({
                message : "删除失败",
                status:4
            });
        }catch(error){
            console.error("error",error);
            return res.status(500).json({
                message:"服务器出错",
                status:5
            });
        }
    }

    updatePost=async (req,res)=>{
        try{
            const data=req.body;
            if(!data || !data.id) return res.status(404).json({message:"Not Founted"});
            const postId=new mongoose.Types.ObjectId(data.id);
            await Post.updateOne({
                _id:postId
            },
            {
                $set:{
                    title:data.title,
                    summary:data.summary,
                    content:data.content,
                    comments_status:data.comments_status,
                }
            }
        );
        return res.status(200).json({
            message:"ok",
            status:2
        });

        }catch(e){
            console.error("error",error);
            return res.status(500).json({
                message:"服务器出错",
                status:5
            });
        }
    }
}

export default new PostAPI();
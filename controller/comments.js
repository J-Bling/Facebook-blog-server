"use strict";
import Comment from '../model/Comment_model.js';
import  Post  from '../model/Post_model.js';
import { User } from '../model/Auth_model.js';
class CommentAPI{
    constructor(){

    }
    error_res(res,message,status=401,statu=4){
        return res.status(status).json({
            message:message,
            status:statu
        });
    }

    succeed_res(res,data,message="ok",status=200,statu=2){
        return res.status(status).json({
            message:message,
            status:statu,
            data:data
        });
    }

    CommentsList=async (req,res)=>{
        try{    
            const postId=req.params.postId;
            const page=Number(req.params.page) || 1;
            const limit=30;
            const skip=(page-1)*limit;
            if(!postId)
                return this.error_res(res,"参数错误",400);
            const post=await Post.findOne({_id:postId}).populate(
                {
                    path:"comments",
                    select:"_id content create_time author comments agree",
                    populate:([
                        {
                            path:"author",
                            select:"_id name image"
                        },
                        {
                            path:"comments",
                            populate:{
                                path:"author",
                                select:"_id name image"
                            },
                            select:"author content create_time agree _id"
                        }
                    ])
                }
            ).select("comments").lean();
            const comments =post.comments;
            const data=[];
            for(const comment of comments){
                const replys=[];
                for(const reply of comment.comments){
                    replys.push({
                        content:reply.content,
                        create_time:reply.create_time,
                        agree:reply.agree,
                        id:reply._id,
                        author:{
                            _id:reply.author._id,
                            name:reply.author.name,
                            image:reply.author.image
                        }
                    });
                }
                data.push({
                    replys:replys,
                    id:comment._id,
                    agree:comment.agree,
                    content:comment.content,
                    create_time:comment.create_time,
                    author:{
                        id:comment.author._id,
                        name:comment.author.name,
                        image:comment.author.image
                    }
                });
            }
            return this.succeed_res(res,data);

        }catch(error){
            console.log("error",error);
            return this.error_res(res,"服务器错误",500,5);
        }
    }

    create_comment=async (req,res)=>{
        try{
            const user=req.user;
            if(!user)
                return this.error_res(res,"你还没有登陆",403,4);
            const {postId} =req.params;
            if(!postId)
                return this.error_res(res,"参数错误",400);
            const data =req.body;
            if(!data || !data.content)
                return this.error_res(res,"不能发送空内容",401);
            const created=await Comment.createComment(data.content,user._id,postId);
            if(created)
                return this.succeed_res(res,1,"发布成功");
            return this.error_res(res,"发布失败",401,4);
        }catch(error){
            console.log("error",error);
            return this.error_res(res,"服务器错误",500,5);
        }
    }

    MyComments=async (req,res)=>{
        try{
            const user=req.user;
            if(!user)
                return this.error_res(res,"请先登陆",400,4);
            const users=await User.findOne({_id:user._id}).populate({
                path:"comments",
                select:"_id content posts create_time",
                populate:{
                    path:"post",
                    select:"_id title"
                }
            }).select("comments").lean();
            const comments=users.comments;
            const data=comments.map(comment=>({
                id:comment._id,
                content:comment.content,
                create_time:comment.create_time,
                post:comment.post ? {
                    id:comment.post._id,
                    title:comment.post.title
                } : null
            }));
            return this.succeed_res(res,data,"ok",200,2);
        }catch(error){
            console.error("error",error);
            return this.error_res(res,"服务器出错",500,5)
        }
    }

    deleteComment=async (req,res)=>{
        try{
            const user=req.user;
            const {commentId,postId} =req.params;
            if(!user || !postId || !commentId)
                return this.error_res(res,"非法访问",400,4);
            const deleted=await Comment.deleteComment(commentId,user._id,postId);
            if(deleted)
                return this.succeed_res(res,1,"ok",200,2);
            return this.error_res(res,"删除失败",401,4);
        }catch(error){
            console.error("error",error);
            return this.error_res(res,"服务器出错",500,5);
        }
    }

    createCommentComments=async(req,res)=>{
        try{
            const data=req.body;
            const commentId=req.params.commentId;
            const user=req.user;
            if(!data || !data.content || !commentId)
                return this.error_res(res,"错误访问",400,4);
            const response= await Comment.createCommentComments(commentId,data.content,user._id);
            return response ? this.succeed_res(res,1,"ok",200,2) : this.error_res(res,"发布失败",401,4);

        }catch(e){
            console.error("error",e);
            return this.error_res(res,"服务器出错",500,5);
        }
    }

    comment_agree=async (req,res)=>{
        try{
            const commentId=req.params.commentId;
            if(!commentId)
                return this.error_res(res,"错误访问",400,4);
            const response= await Comment.updateOne({_id:commentId},{$inc:{agree:1}});
            return response.acknowledged ? this.succeed_res(res,1) : this.error_res(res,"错误",401,4);
        }catch(error){
            console.error("error",error);
            return this.error_res(res,"服务器出错",500,5);
        }
    }
}
export default new CommentAPI();
"use strict";
import mongoose from "mongoose";
import { User } from "./Auth_model.js";
import  Post  from "./Post_model.js";
const CommentSchema=new mongoose.Schema({
    content:String,
    create_time:{type:Date,default:Date.now()},
    agree:{type:Number,default:0},
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    post:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Post"
    },
    comments:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Comment"
    }]
});
const Comment=mongoose.model("Comment",CommentSchema);
Comment.deleteComment=async function (comment_id,author_id,post_id){
    try{
        var ok;
        if(post_id==='1'){
            ok =await User.updateOne({_id:author_id},{$pull:{comments:comment_id}});
            if(ok.acknowledged) ok= await Comment.deleteOne({_id:comment_id});
            return ok.acknowledged && ok.deletedCount>0;
        }
        const isExec= await Promise.all([
            User.updateOne({_id:author_id},{$pull:{comments:comment_id}}),
            Post.updateOne({_id:post_id},{$pull:{comments:comment_id}})
        ]);
        ok=isExec && isExec.length===2;
        if(ok) 
            ok=await Comment.deleteOne({_id:comment_id});
            return ok.acknowledged && ok.deletedCount>0;
    }catch(error){
        console.error("delete_error:",error);
        return null;
    }
};
Comment.createComment=async function(content,author_id,post_id){
    try{
        const comment=new Comment({
            content:content,
            author:author_id,
            post:post_id
        });
        await comment.save();
        await Promise.all([
            User.updateOne({_id:author_id},{$push:{comments:comment._id}}),
            Post.updateOne({_id:post_id},{$push:{comments:comment._id}})
        ]);
        return true;
    }catch(error){
        console.error("create_error".error);
        return null;
    }
}
Comment.createCommentComments=async function(comment_id,content,user_id){
    try{
        const comment=new Comment({
            content:content,
            author:user_id
        });
        await comment.save();
        await Comment.updateOne({_id:comment_id},{$push:{comments:comment._id}});
        return true;
    }catch(error){
        console.error("error",error);
        return null;
    }
}
export default Comment;
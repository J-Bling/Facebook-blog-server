"use strict";
import mongoose from 'mongoose';
import { User } from './Auth_model.js';
const PostSchema=new mongoose.Schema({
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    content:String,
    title:String,
    summary:String,
    comments_status:{type:Boolean,default:true},
    views_count:{type:Number,default:0},
    create_time:{type:Date,default:Date.now()},
    comments:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Comment"
    }]
});
const Post=mongoose.model("Post",PostSchema);
Post.createPost=async function(author_id,title,summary,content,comments_status=true){
    try{
        const post =new Post({
            title:title,
            summary:summary,
            content:content,
            author:author_id,
            comments_status:comments_status
        });
        const _id=post._id;
        await Promise.all([
            post.save(),
            User.updateOne({_id:author_id},{$push:{posts:_id}})
        ]);
        return true;
    }catch(error){
        console.error("error",error);
        return null;
    }
};
Post.deletePost=async function(post_id,author_id){
    try{
        const result=await User.updateOne({_id:author_id},{$pull:{posts:post_id}});
        const ok=result.acknowledged && result.modifiedCount>0;
        if(ok)
            await Post.deleteOne({_id:post_id});
        return ok;
    }catch(error){
        console.error("error",error);
        return null;
    }
}
export default Post;
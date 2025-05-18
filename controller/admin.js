"use strict";
import { User } from "../model/Auth_model.js";
import { Chat,Message} from "../model/Chat_model.js";
import mongoose from "mongoose";
class UserDate{
    constructor(){

    }

    error_red(res,message,status,statu){
        return res.status(status).json({
            message:message,
            status:statu
        });
    }

    UserInformation=async (req,res)=>{
        try{
            const user =await User.findOne({_id:req.user._id}).lean();
            if(!user)
                return this.error_red(res,"错误请求",401,4);
            const data={
                name:user.name,
                id:user._id,
                email:user.email,
                admin:user.admin,
                posts_count:user.posts.length,
                image:user.image,
                create_time:user.create_time,
                last_time:user.last_time,
                comments_count:user.comments.length
            }
            return res.status(200).json({
                data:data,
                status:2,
                message:"ok"
            });

        }catch(error){
            console.error("error",error);
            return this.error_red(res,"服务器出错",500,5);
        }
    }

    deleteFriend=async (req,res)=>{
        try{
            const u=req.user;
            const friendId=req.params.friendId;

            const user=await User.findOne({_id:u._id}).select("friends").lean();
            const friends_str=user.friends.map(fri=>fri.toString());
            if(!friends_str.includes(friendId)){
                return this.error_red(res,"不是你的好友",401,4);
            }
            await Promise.all([
                User.updateOne({_id:u._id},{$pull:{friends:friendId}}),
                User.updateOne({_id:friendId},{$pull:{friends:u._id}})
            ]);
            return res.status(200).json({
                message:"ok",
                status:2
            });

        }catch(error){
            console.error("error",error);
            return this.error_red(res,"服务器错误",500,5);
        }
    }

    AthorUser=async(req,res)=>{
        try{
            const userId=req.params.userId;
            if(!userId) return this.error_red(res,"错误访问",404,4);
            const my=req.user;
            const user=await User.findOne({_id:userId})
            .populate({
                path:"posts",
                select:"_id title summary create_time"
            }).select("_id name image last_time posts friends friendapplications").lean();

            const friendapplications=user.friendapplications.map(f=>f.toString());
            const friends=user.friends.map(f=>f.toString());
            const myId=my._id.toString();
            const data={
                id:user._id,
                name:user.name,
                image:user.image,
                last_time:user.last_time,
                isMyFriends:friends.includes(myId),
                hasApp:friendapplications.includes(myId),
                IamAuthor:user._id.toString()===my._id.toString(),
                posts:user.posts.map(post=>({
                    id:post._id,
                    title:post.title,
                    summary:post.summary,
                    create_time:post.create_time
                }))
            }
            return res.status(200).json({
                message:"ok",
                status:2,
                data:data
            });

        }catch(error){
            console.error("error",error);
            return this.error_red(res,"服务器错误",500,5);
        }
    }


    Semd_FriendApplication=async (req,res)=>{
        try{
            const u=req.user;
            let friendId=req.params.friendId;
            if(!friendId)
                return this.error_red(res,"参数错误",401,4);
            const friendapplicationsCheck=await User.findOne(
                {_id:friendId},
                {friendapplications:1,friends:1}
            ).select("_id").lean();
            if(!friendapplicationsCheck) return this.error_red(res,"该用户不存在",404,4);
            friendId=friendapplicationsCheck._id;
            
            const user=await User.findOne({_id:u._id},{friendapplications:1,friends:1}).select("_id").lean();
            const user_friendapplications=user.friendapplications.map(friAPP=>friAPP.toString());
            if(user_friendapplications.includes(friendId.toString())){
                const user_friends=user.friends.map(fri=>fri.toString());
                if(!user_friends.includes(friendId.toString())){
                    const message=new Message({
                        sender:u._id,
                        receiver:friendapplicationsCheck._id,
                        content:"我们已经是好友了"
                    });

                    const updateChat=await Chat.updateOne({users:{$all:[user._id,friendId]}},{$push:{messages:message._id}});
                    if(updateChat.modifiedCount===0){
                        const chat=new Chat({
                            users:[u._id,friendId],
                            messages:[message._id]
                        });
                        await chat.save();
                    }
                    
                    await Promise.all([
                        User.updateOne({_id:user._id},{$pull:{friendapplications:friendId},$push:{friends:friendId}}),
                        User.updateOne({_id:friendId},{$push:{friends:user._id}}),
                        message.save(),
                    ]);
                    return res.status(200).json({message:"已经添加好友",status:2,value:true});
                }
                else return res.status(200).json({message:"你已经添加该好友",status:2,value:false});
            }
            
            const friendapplicationsCheck_friendapplications=friendapplicationsCheck.friendapplications.map(friApp=>friApp.toString());
            const friendapplicationsCheck_friends=friendapplicationsCheck.friends.map(fris=>fris.toString());
            if(!friendapplicationsCheck_friendapplications.includes(user._id.toString()) &&
               !friendapplicationsCheck_friends.includes(user._id.toString())){
                await User.updateOne({_id:friendapplicationsCheck._id},{$push:{friendapplications:user._id}});
                return res.status(200).json({message:"添加成功",status:2,value:true});
            }
            else return res.status(200).json({message:"不能添加好友",status:2,value:false});

        }catch(error){
            console.error("error",error);
            return this.error_red(res,"服务器出错",500,5);
        }
    }


    Agree_Application=async (req,res)=>{
        try{
            const u=req.user;
            const friend_id=req.params.friendId;
            const friendId=new mongoose.Types.ObjectId(friend_id);
            const user=await User.findOne({_id:u._id},{friendapplications:1,friends:1}).select("_id").lean();
            const user_friends=user.friends.map(fri=>fri.toString());
            if(user_friends.includes(friend_id)) 
                return res.status(200).json({message:"你已经添加该好友",value:false,status:2});

            const user_friendapplications=user.friendapplications.map(app=>app.toString());
            if(user_friendapplications.includes(friend_id)){
                const message=new Message({
                    sender:u._id,
                    receiver:friendId,
                    content:"我们已经是好友了"
                });
                const updated= await Chat.updateOne({users:{$all:[u._id,friendId]}},{$push:{messages:message._id}});
                if(updated.modifiedCount === 0){
                    const chat=new Chat({
                        users:[u._id,friendId],
                        messages:[message._id]
                    });
                    await chat.save();
                }
                
                await Promise.all([
                    User.updateOne({_id:u._id},{$pull:{friendapplications:friendId},$push:{friends:friendId}}),
                    User.updateOne({_id:friendId},{$push:{friends:user._id}}),
                    message.save(),
                ]);

                return res.status(200).json({message:"添加成功",status:2,value:true});
            }
            return this.error_red(res,"错误添加",404,4);

        }catch(error){
            console.error("error",error);
            return this.error_red(res,"服务器出错",500,5);
        }
    }


    FriendsApplications=async (req,res)=>{
        try{
            const user=req.user;
            const users=await User.findOne({_id:user._id}).populate(
                {
                    path:"friendapplications",
                    select:"_id name image"
                }
            )
            .select("friendapplications").lean();
            const data=[];
            for(const friend of users.friendapplications){
                data.push({
                    id:friend._id,
                    name:friend.name,
                    image:friend.image
                });
            }
            return res.status(200).json({
                message:"ok",
                status:2,
                data:data
            });
        }catch(error){
            console.error("error",error);
            return this.error_red(res,"服务器错误",500,5);
        }
    }


    FriendsLists = async (req, res) => {
        function CountNoReadMessages(messages,userId){
            return messages.filter(message=>message.status===false && message.sender.toString()!==userId).length;
        }
        function buildFriendsList(Room,userId,friends){
            const friend=Room.users[0]._id.toString()===userId ? Room.users[1] : Room.users[0];
            if(!friends.includes(friend._id.toString())) return null;
            const count=CountNoReadMessages(Room.messages,userId);
            return {
                id:friend._id,
                name:friend.name,
                image:friend.image,
                count:count
            }
        }
        try {
            const my = req.user;
            const My=await User.findOne({_id:my._id}).select("friends").lean();
            if(My.friends.length===0) return res.status(200).json({message:"ok",status:2,data:[]});
            const chatRooms=await Chat.find({users:{$in:[my._id]}})
            .populate([
                {
                    path:"users",
                    select:"_id name image"
                },
                {
                    path:"messages",
                    select:"status sender"
                }
            ]).select("users messages").lean();;

            const friends=[];
            for(const f of My.friends) friends.push(f.toString());
            const data=[];
            for(const chatRoom of chatRooms){
                const adata=buildFriendsList(chatRoom,my._id.toString(),friends);
                if(adata) data.push(adata);
            }
            return res.status(200).json({
                message: "ok",
                status: 2,
                data: data
            });
        } catch (error) {
            console.error("error", error);
            return this.error_red(res, "服务器错误", 500, 5);
        }
    };


    FriendsDynamic=async (req,res)=>{
        try{
            const user=req.user;
            const data=await User.aggregate([
                {$match:{_id:user._id}},
                {
                    $lookup:{
                        from:"users",
                        localField:"friends",
                        foreignField:"_id",
                        as:"friends"
                    }
                },
                {
                    $unwind:"$friends"
                },
                {
                    $lookup:{
                        from:"posts",
                        let:{friendId:"$friends._id"},
                        pipeline:[
                            {$match:{$expr:{$eq:["$author","$$friendId"]}}},
                            {$lookup:
                                {
                                    from:"users",
                                    localField:"author",
                                    foreignField:"_id",
                                    as:"author"
                                }
                            },
                            {$unwind:"$author"},
                            {$project:{
                                _id:1,title:1,summary:1,views_count:1,create_time:1,
                                author:{_id:"$author._id",name:"$author.name",image:"$author.image"}
                            }},
                        ],
                        as:"posts"
                    }
                },
                {
                    $unwind:"$posts"
                },
                {
                    $replaceRoot:{
                        newRoot:"$posts"
                    }
                }
            ]);

            return res.status(200).json({
                message:"ok",
                status:2,
                data:data
            });

        }catch(error){
            console.error("error",error);
            return this.error_red(res,"服务器错误",500,5);
        }
    }

    HistoryMessage=async (req,res)=>{
        try{
            const user=req.user;
            const friend_id=req.params.friendId;
            const friendId=new mongoose.Types.ObjectId(friend_id);

            const chat=await Chat.findOne({users:{$all:[user._id,friendId]}})
            .populate({
                path:"messages",
                select:"_id create_time content sender receiver status"
            }).select("messages").lean();
            if(!chat) return this.error_red(res,"错误访问",404,4);

            const data=chat.messages.map(message=>({
                content:message.content,
                create_time:message.create_time,
                sender:message.sender,
                receiver:message.receiver,
                status:message.status
            }));

            if(chat.messages.length>0){
                const messageIds=chat.messages.map(message=>message._id);
                await Message.updateMany(
                    {_id:{$in:messageIds},receiver:user._id,status:false},
                    {$set:{status:true}}
                );
            }

            return res.status(200).json({
                messages:"ok",
                status:2,
                data:data
            });

        }catch(error){
            console.error("error",error);
            return this.error_red(res,"服务器出错",500,5);
        }
    }
}

export default new UserDate();
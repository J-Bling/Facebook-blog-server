"use strict";
import UserDate from "../controller/admin.js";
import express from 'express';

const router=express.Router();

router.get("/user",UserDate.UserInformation);
router.get("/send-app/:friendId",UserDate.Semd_FriendApplication);
router.get("/agree-app/:friendId",UserDate.Agree_Application);
router.get("/get-FriendsList",UserDate.FriendsLists);
router.get("/FriendsDynamic",UserDate.FriendsDynamic);
router.get("/FriendsApp",UserDate.FriendsApplications);
router.get("/Athor/:userId",UserDate.AthorUser);
router.get("/delete-friend/:friendId",UserDate.deleteFriend);
router.get("/HistoryMessage/:friendId",UserDate.HistoryMessage);
export default router;
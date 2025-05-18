"use strict";
import express from 'express';
import PostAPI from '../controller/posts.js'
const router= express.Router();

router.get("/postDetail/:postId",PostAPI.postDetail);
router.get("/postsList/:skips",PostAPI.postList);
router.post("/create-post",PostAPI.createPost);
router.get("/userPosts",PostAPI.MyPosts);
router.get("/delete/:postId",PostAPI.deletePost);
router.get("/my-post/:postId",PostAPI.MyAuthorPost);
router.post("/update",PostAPI.updatePost);
export default router;
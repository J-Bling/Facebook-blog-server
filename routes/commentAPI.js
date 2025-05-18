"use strict";
import CommentAPI from '../controller/comments.js';
import express from 'express';

const router=express.Router();


router.get("/comment-list/:postId/:page",CommentAPI.CommentsList);
router.post("/create_comment/:postId",CommentAPI.create_comment);
router.get("/my-comments",CommentAPI.MyComments);
router.get("/deleteComments/:postId/:commentId",CommentAPI.deleteComment);
router.post("/create-commentComments/:commentId",CommentAPI.createCommentComments);
router.get("/comment_agree/:commentId",CommentAPI.comment_agree);
export default router;
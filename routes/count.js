import CountViews from "../controller/CountViews.js";
import express from 'express';
const router=express.Router();
router.get("/views",CountViews.Views);
export default router;
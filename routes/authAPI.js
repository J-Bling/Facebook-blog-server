"use strict";

import Auth from '../controller/auth.js';
import express from 'express';

const router=express.Router();

router.post("/login",Auth.login);
router.post("/register",Auth.register);
router.post("/send-code",Auth.send_code);
 
export default router;
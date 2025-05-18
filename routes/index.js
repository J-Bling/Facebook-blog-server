"use strict";
import auth from './authAPI.js';
import post from './postAPI.js';
import comment from './commentAPI.js';
import ChatAI from './ChatAI.js';
import UserAPI from './UserAPI.js';
import Weather from './weather.js';
import count from './count.js';

export default app=>{
    app.use("/api/user",auth),
    app.use("/api/post",post),
    app.use("/api/comment",comment),
    app.use("/api/ai",ChatAI),
    app.use("/api/users",UserAPI),
    app.use("/api/weather",Weather),
    app.use("/api/count",count)
}
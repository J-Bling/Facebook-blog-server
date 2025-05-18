import createError from 'http-errors';
import express from 'express';
import path from 'path';
import logger from 'morgan';
import cors from 'cors'; 
import mongoose from "mongoose";
import Identify from './Middleware/AuthIdentify.js';
import router from './routes/index.js'; 
import CountViews from './controller/CountViews.js'

const app = express(); 

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join('public')));
app.use(Identify.verify_token);
app.use(CountViews.Count);

router(app);
app.use(function(req, res, next) {
  next(createError(404));
});


(function(){
  mongoose.connect(process.env.DATABASE_URL);
  mongoose.Promise=global.Promise;
  
  const db=mongoose.connection;
  
  db.once("open",function(){
      console.log("数据库连接成功");
  });
  
  db.on("error",function(error){
      console.error("数据库连接失败:",error);
      process.exit(1);
  });
  
  db.on("close",function(){
      console.log("数据库已经断开连接 ");
  });
})();

export default app;
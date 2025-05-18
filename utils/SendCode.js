"use strict";

import nodemailer from 'nodemailer';

function randomCode() {
    const numbers = "1234567890";
    return Array.from({ length: 6 }, () => numbers[Math.floor(Math.random() * numbers.length)]).join('');
}

function emailObject() {
    return nodemailer.createTransport({
        host: 'smtp.163.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.Email_User,
            pass: process.env.Email_Password
        }
    });
}

export default async function sendEmail(email) {
    try {
        const emailObject_ = emailObject();
        const code = randomCode();
        const mailOptions = { 
            from: process.env.Email_User,
            to: email,
            subject: "xxx网络平台注册验证码",
            text: `你好: xxx网络有限公司欢迎你注册新账号;\n验证码为:${code},请务必保管好你的信息,验证码5分钟以内有效`
        };
        await emailObject_.sendMail(mailOptions);
        return code;
    } catch (error) {
        console.error("SendEmail error:", error);
        return null;
    }
}
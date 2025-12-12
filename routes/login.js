var express = require("express");
var router = express.Router();
var db = require("../db");
// var sqlConnection = require('../db')
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const svgCaptcha = require("svg-captcha");
const secretKey = "jkdskahfuifhqaf"; // 里面字符串随意输入

const Redis = require('ioredis')
const redis = new Redis();

// 登录验证
router.post("/login", async function (req, res) {
  let cap = await redis.get("captcha")
  console.log(cap);
  if (req.body.captcha == null) return res.send({ code: -1, msg: "验证码不能为空", data: [] })
  if (cap != req.body.captcha) return res.send({ code: -1, msg: "验证码错误", data: [] })
  if (req.body.username == "") return res.send({ code: -1, msg: "用户名不能为空", data: [] })
  if (req.body.password == "") return res.send({ code: -1, msg: "密码不能为空", data: [] })
  let user = await db.sqlConnection("select * from users where username=?", [req.body.username])
  if (user.length == 0) return res.send({ code: -1, msg: "用户不存在", data: [] })
  if (user[0].state == 1) return res.send({ code: -1, msg: "账号被停用，请联系管理员", data: [] })
  // if(user[0].username != req.body.username) return res.send({ code: -1, msg: "用户名错误", data: [] })
  if (!bcrypt.compareSync(req.body.password, user[0].password)) return res.send({ code: -1, msg: "密码错误", data: [] })
  await redis.set('username', req.body.username);
  res.send({ code: 0, msg: "登录成功", data: { token: jwt.sign({ username: req.body.username }, secretKey, { expiresIn: "24h", }), user: user[0], }, });
});

// 验证码接口
router.get("/captcha", (req, res) => {
  // const cap = svgCaptcha.create({ // 字符验证码
  //   // 翻转颜色
  //   inverse: false,
  //   // 字体大小
  //   fontSize: 36,
  //   // 噪声线条数
  //   noise: 4,
  //   // 宽度
  //   width: 110,
  //   // 高度
  //   height: 40,

  //   background: "#cc9966",
  //   // background: "pink",
  // });
  const cap = svgCaptcha.createMathExpr({
    // 科学计算验证码
    // 翻转颜色
    inverse: false,
    // 字体大小
    fontSize: 36,
    // 噪声线条数
    noise: 4,
    // 宽度
    width: 110,
    // 高度
    height: 40,

    background: "#cc9966",
    // background: "pink",
  });
  // console.log(cap);

  // res.setHeader("content-type", "text/html;charset=utf-8;");
  // res.setHeader("content-type", "image/svg+xml;");

  // 保存到session,永远是小写方法
  // req.session.captcha = cap.text.toLowerCase();
  // console.log(req.session);

  // req.session.captcha = cap.text; // session 存储验证码数值

  // client.set('captcha', cap.text, redis.print)
  redis.set("captcha", cap.text)

  res.type("svg"); // 响应的类型

  res.send({
    code: 200,
    data: cap.data,
    message: "验证码获取成功",
  });
});

module.exports = router;
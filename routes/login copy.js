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

  if (cap == req.body.captcha) {
    let sql = "select * from users where username=? || email=?";
    db.db.query(sql, [req.body.username, req.body.email], function (err, result) {
      // console.log(err);
      // console.log(result);

      if (result.length == 0)
        return res.send({
          code: -1,
          msg: "此账号还没有注册，请注册",
          data: []
        });
      if (req.body.captcha != "") {
        // console.log(req.body.captcha);
        console.log(req.session.captcha);
        if (result.length > 0) {
          // console.log(bcrypt.compareSync(req.body.password, result[0].password));
          if (result[0].username == req.body.username && bcrypt.compareSync(req.body.password, result[0].password)) {
            redis.set('username',req.body.username);
            // 保存会话数据
            res.send({
              code: 1,
              message: "登录成功",
              data: {
                token: jwt.sign({
                  username: req.body.username
                }, secretKey, {
                  expiresIn: "1h",
                }),
              },
            });

            return
          } else {
            return res.send({
              code: -1,
              message: "账号或密码错误",
              data: []
            });
          }
        }
      } else {
        return res.send({
          code: -1,
          message: "验证码错误",
          data: []
        });
      }
    });

  } else {
    res.send({
      code: -1,
      message: "验证码错误",
      data: []
    })
  }



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
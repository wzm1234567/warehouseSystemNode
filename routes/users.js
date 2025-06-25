var express = require("express");
var router = express.Router();
var db = require("../db");
const bcrypt = require("bcryptjs");
/* GET users listing. */

// 注册
router.post("/register", function (req, res, next) {
  let sql = "select * from users where username = ? || email = ?";
  // console.log(req.body);
  db.db.query(sql, [req.body.username, req.body.email], function (err, result) {
    console.log(result);

    if (result.length > 0)
      return res.send({ code: -1, message: "用户名或邮箱已存在", data: [] });

    let salad = "insert into users set ?";
    req.body.password = bcrypt.hashSync(req.body.password, 10);
    db.db.query(salad, [{ ...req.body, role_id: 5 }], function (err, result) {
      console.log(err);
      console.log(result);

      if (err) return res.send({ code: -1, message: "注册失败", data: [] });
      res.send({ code: 0, message: "注册成功", data: [] });
    });
  });
});


// 获取用户列表
router.get('/users', async (req, res) => {
  let sql = 'select * from users'
  let list = await db.sqlConnection(sql)
  console.log(list);
  res.send({ code: 0, msg: '获取用户列表成功', data: list })
})

module.exports = router;

var express = require("express");
var router = express.Router();
var db = require("../db");
const bcrypt = require("bcryptjs");

// 注册
router.post("/register", function (req, res, next) {
  let sql = "select * from users where username = ? || email = ?";
  // console.log(req.body);
  db.pool.query(sql, [req.body.username, req.body.email], function (err, result) {
    console.log(result);

    if (result.length > 0)
      return res.send({ code: -1, message: "用户名或邮箱已存在", data: [] });

    let salad = "insert into users set ?";
    req.body.password = bcrypt.hashSync(req.body.password, 10);
    db.pool.query(salad, [{ ...req.body, role_id: 5 }], function (err, result) {
      console.log(err);
      console.log(result);

      if (err) return res.send({ code: -1, message: "注册失败", data: [] });
      res.send({ code: 0, message: "注册成功", data: [] });
    });
  });
});


// 获取用户列表
router.get('/users', async (req, res) => {
  let list = await db.sqlConnection('select * from users')
  console.log(list);
  list.forEach(ele => {
    delete ele.password
  });
  res.send({ code: 0, msg: '获取用户列表成功', data: list })
})

/**
 * 添加/修改 用户
 * @param {object} req.body
 * @param {string} req.body.id 判断是否是添加或编辑
 * @param {string} req.body.username
 * @param {string} req.body.password
 * @param {string} req.body.nickname 姓名
 * @param {string} req.body.phone 手机号
 * @param {string} req.body.denger 性别 0:男 1:女
 * @param {number} req.body.roleId 分配角色ID
 */
router.post('/addUsers', async (req, res) => {
  let { id, username, password, nickname, phone, denger, roleId } = req.body;
  if (!username || !password || !nickname || !phone  || !roleId) return res.send({ code: -1, msg: '参数错误'});
  if (id) {
    // 修改用户表
    await db.sqlConnection('update users set username=?, nickname=?, phone=?, denger=?, new_role_id=? where id=?',[username,nickname,phone,denger,roleId,id])
    // 删除已有的用户角色表
    await db.sqlConnection('delete from think_user_role where user_id = ?', [id])
    // 添加新的用户角色表
    await db.sqlConnection("insert into think_user_role (role_id, user_id) values(?,?)", [roleId, id])
    res.send({ code: 0, message: "修改用户成功" })
  } else {
    let result = await db.sqlConnection("select * from users where username = ?", [username])
    if (result.length > 0) return res.send({ code: -1, message: "用户名已存在,请更换用户名" });
    // 加密密码
    password = bcrypt.hashSync(req.body.password, 10);
    // 添加用户到表
    let userRes = await db.sqlConnection("insert into users (username, password, nickname, phone, denger, new_role_id) values(?,?,?,?,?,?)", [username, password, nickname, phone, denger, roleId])
    // 当前添加的用户Id
    let userId = userRes.insertId
    // 根据前端传递角色Id和用户Id，分配对应角色权限
    await db.sqlConnection("insert into think_user_role (role_id, user_id) values(?,?)", [roleId, userId])
    res.send({ code: 0, message: "添加用户成功" })
  }
})

/**
 * 删除用户
 * @param {Object} req.query
 * @param {number} req.query.id 用户id
 */
router.get('/deleteUser', async (req, res) => { 
  let { id } = req.query
  if (!id) return res.send({ code: -1, message: '参数错误' })
  await db.sqlConnection('delete from users where id=?', [id])
  await db.sqlConnection('delete from think_user_role where user_id=?', [id])
  res.send({ code: 0, message: '删除用户成功' })
})

/**
 * 重置密码
 * @param {Object} req.query
 * @param {number} req.query.id 用户id
 */
router.get("/resetPard", async (req, res) => { 
  let { id } = req.query
  let password = bcrypt.hashSync('123456', 10);
  await db.sqlConnection('update users set password=? where id=?', [password, id])
  res.send({ code: 0, message: '重置密码成功' })
})
module.exports = router;

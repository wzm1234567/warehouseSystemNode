const express = require("express");
const router = express.Router();
const db = require("../db");
const Redis = require('ioredis');
// const { number } = require("joi");
const redis = new Redis();

// 获取左侧菜单接口
router.get("/menu", async (req, res) => {
  let username = await redis.get('username')
  // console.log(username);
  try {
    let user = await db.sqlConnection("select id from users where username=?", [username])
    let juese = await db.sqlConnection("select * from think_user_role where user_id=?", [user[0].id])
    let menuid = await db.sqlConnection("select * from think_role_menu where role_id=?", [juese[0].role_id])
    let menulist = await db.sqlConnection("SELECT * FROM menu")
    let list = []
    menuid.forEach(item => {
      menulist.forEach(ele => {
        if (item.menu_id == ele.id) {
          list.push(ele)
        }
      })
    });
    console.log(list);
    let newlist = list.filter((item) => {
      return item.pid == 0
    })
    newlist.forEach(item => {
      if (item.pid == 0) {
        item.children = []
        if (item.title == '首页') {
          item.redirect = ''
        }
        list.forEach(item2 => {
          if (item2.pid == item.id) {
            item.children.push(item2)
          }
        });
      }
    });
    console.log(newlist);
    res.send({
      code: 0,
      msg: "获取菜单成功",
      data: newlist
    })
  } catch (error) {
    res.send({
      code: 500,
      msg: "服务器错误"
    })
  }
});


// 添加左侧菜单列表

router.post("/setmenu", async (req, res) => {
  console.log(req.body);
    req.body.region = Number(req.body.region)
  
    try {
      let add = await db.sqlConnection("insert into menu (title,path,pid,icon,component,name) values(?,?,?,?,?,?)", [req.body.title, req.body.path, req.body.region, req.body.icon, req.body.address,req.body.name])
      console.log(add);
      console.log(add.insertId);
      let add1 = await db.sqlConnection("insert into think_role_menu (role_id,menu_id) values(?,?)", [2, add.insertId])
      console.log(add1);
  
      res.send({
        code: 0,
        msg: '添加成功'
      })
    } catch (error) {
      res.send({
        code: -1,
        data: error,
        msg: '添加失败'
      })
    }
  
  





})













module.exports = router;
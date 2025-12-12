const express = require("express");
const router = express.Router();
const db = require("../db");
const Redis = require("ioredis");
const redis = new Redis();

// 获取左侧菜单接口 (包含权限的 菜单)
router.get("/menu", async (req, res) => {
  let username = await redis.get("username");
  try {
    let user = await db.sqlConnection("select id from users where username=?", [username]);
    let juese = await db.sqlConnection("select * from think_user_role where user_id=?", [user[0].id]);
    let menuid = await db.sqlConnection("select * from think_role_menu where role_id=?", [juese[0].role_id]);
    let menulist = await db.sqlConnection("SELECT * FROM menu");
    let list = [];
    // list 在当前角色下的菜单
    menuid.forEach((item) => {
      menulist.forEach((ele) => {
        if (item.menu_id == ele.id) {
          list.push(ele);
        }
      });
    });
    // console.log(list);
    let newlist = list.filter((item) => item.pid == 0 && item.hide === 0);
    newlist.sort((a, b) => (a.sort < b.sort ? -1 : a.sort > b.sort ? 1 : 0));
    // 筛选非隐藏的子菜单
    let newMenulist = list.filter((item) => item.hide === 0 && item.type === 0 && item.pid !== 0)
    // 筛选按钮权限
    let newMenubnt = list.filter((item) => item.hide === 0 && item.type === 1);
    for (let index = 0; index < newMenulist.length; index++) {
      let item = newMenulist[index];
      item.children = [];
      newMenubnt.forEach((ele) => {
        if (ele.pid === item.id) {
          item.children.push(ele);
        }
      });
    }
    for (let index = 0; index < newlist.length; index++) {
      let item = newlist[index];
      item.children = [];
      newMenulist.forEach((ele) => {
        if (ele.pid === item.id) {
          item.children.push(ele);
        }
      });
    }

    for (let index = 0; index < newlist.length; index++) {
      console.log(newlist[index].children);

      newlist[index].children.sort((a, b) => (a.sort < b.sort ? -1 : a.sort > b.sort ? 1 : 0));
    }
    res.send({ code: 0, msg: "获取菜单成功", data: newlist });
  } catch (error) {
    res.send({ code: 500, msg: "服务器错误" });
  }
});

/**
 * 添加/修改 左侧菜单列表
 * @param {Object} req.body 菜单数据
 * @param {Number} req.body.id 判断是编辑还是添加
 * @param {Array} req.body.region 是不是子菜单 直接赋值pid
 * @param {String} req.body.title 菜单名称
 * @param {String} req.body.icon 菜单图标
 * @param {String} req.body.path 菜单路径
 * @param {Number} req.body.sort 菜单排序
 * @param {Number} req.body.type 菜单类型 0:菜单 1:按钮
 * @param {Number} req.body.hide 菜单是否隐藏 0:否 1:是
 * @param {Number} req.body.permission 按钮权限标识 type === 1 时才有值
 * @param {Array} req.body.name 菜单标识
 */
router.post("/setmenu", async (req, res) => {
  let { id, title, icon, path, sort, type, hide, permission, region, name } = req.body;
  let pid = region[region.length - 1];
  if (!title) return res.send({ code: -1, msg: "参数错误" });
  path = path.startsWith("/") ? path : "/" + path;
  if (id) {
    await db.sqlConnection(
      `update menu set title=?,icon=?,path=?,sort=?,type=?,hide=?,permission=?,pid=?,component=?,name=? where id=?`,
      [title, icon, path, sort, type, hide, permission, pid, path, name, id]
    );
    res.send({ code: 0, msg: "修改成功" });
  } else {
    await db.sqlConnection("insert into menu (title, icon, path, component, sort, type, hide, permission, pid, name) values(?,?,?,?,?,?,?,?,?,?)", [title, icon, path, path, sort, type, hide, permission, pid, name]);
    res.send({ code: 0, msg: "添加成功" });
  }
});

/**
 * 获取左侧菜单接口 (不包含权限的 菜单)
 */
router.get("/menuList", async (req, res) => {
  let menulist = await db.sqlConnection("SELECT * FROM menu");
  // 筛选非隐藏的根节点
  let newlist = menulist.filter((item) => item.pid === 0 && item.hide === 0);
  newlist.sort((a, b) => (a.sort < b.sort ? -1 : a.sort > b.sort ? 1 : 0));
  // 筛选非隐藏的子菜单
  let newMenulist = menulist.filter((item) => item.hide === 0 && item.type === 0 && item.pid !== 0);

  // 筛选按钮权限
  let newMenubnt = menulist.filter(
    (item) => item.hide === 0 && item.type === 1
  );

  for (let index = 0; index < newMenulist.length; index++) {
    let item = newMenulist[index];
    item.children = [];
    newMenubnt.forEach((ele) => {
      if (ele.pid === item.id) {
        item.children.push(ele);
      }
    });
  }

  for (let index = 0; index < newlist.length; index++) {
    let item = newlist[index];
    item.children = [];
    newMenulist.forEach((ele) => {
      if (ele.pid === item.id) {
        item.children.push(ele);
      }
    });
  }

  for (let index = 0; index < newlist.length; index++) {
    console.log(newlist[index].children);

    newlist[index].children.sort((a, b) => (a.sort < b.sort ? -1 : a.sort > b.sort ? 1 : 0));
  }
  res.send({ code: 0, msg: "获取菜单成功", data: newlist });
});

/**
 * 删除菜单（永久删除）
 * @param {Object} req.query
 * @param {Number} req.query.id
 */
router.get("/delMenu", async (req, res) => {
  let sql = `delete from menu where id=?`;
  await db.sqlConnection(sql, [req.query.id])
  res.send({ code: 0, msg: "删除成功" });
});
module.exports = router;

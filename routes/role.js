const express = require("express");

const router = express.Router();

const db = require("../db");
/**
 * 查询角色列表
 */
router.get("/search", async (req, res) => {
  let roleData = await db.sqlConnection("select * from think_role");
  res.send({
    code: 0,
    data: roleData,
    message: "操作成功",
  });
});

/**
 * 角色权限列表
 * @param {*} req.query
 * @param {number} req.query.roleId 角色id
 */
router.get("/menuListkey", async (req, res) => {
  // 查询当前角色的权限
  let role_menu = await db.sqlConnection("select menu_id from think_role_menu where role_id = ?",[req.query.roleId]);
  let arr = [];
  role_menu.forEach((item) => {
    arr.push(item.menu_id);
  });
  res.send({
    code: 0,
    data: arr,
    message: "操作成功",
  });
});

/**
 * 覆盖角色与菜单权限列表
 * @param {*} req.body
 * @param {number} req.body.roleId 角色id
 * @param {Array} req.body.menuIds 菜单id
 */
router.post("/addrolemenu", async (req, res) => { 
    let { roleId, menuIds } = req.body;
    if (!roleId || !menuIds) res.send({ code: -1, message: "参数错误" });
    if (menuIds.length === 0) return res.send({ code: -1, message: "menuIds不能为空" });
    await db.sqlConnection("delete from think_role_menu where role_id = ?", [ roleId ]);
    for (let i = 0; i < menuIds.length; i++) {
      await db.sqlConnection("insert into think_role_menu (role_id, menu_id) values (?,?)", [ roleId, menuIds[i] ]);
    }
    res.send({
      code: 0,
      message: "操作成功",
    });
});

/**
 * 添加与编辑角色
 * @param {*} req.body
 * @param {number} req.body.id 
 * @param {number} req.body.name 角色名称 
 * @param {number} req.body.code 角色编码
 * @param {number} req.body.note 角色描述
 */
router.post("/addrole", async (req, res) => { 
  let { id, name, code, note } = req.body;
  if (!name || !code) res.send({ code: -1, message: "参数错误" });
  if (id) { 
    await db.sqlConnection("update think_role set name = ?, code = ?, note = ? where id = ?", [ name, code, note, id ]);
  } else { 
    await db.sqlConnection("insert into think_role (name, code, note) values (?,?,?)", [ name, code, note ]);
  }
  res.send({ code: 0, message: "操作成功" });
});

/**
 * 删除角色
 * @param {*} req.body
 * @param {number} req.body.id 角色id
 */
router.get("/deleterole", async (req, res) => { 
  let { id } = req.query;
  if (!id) res.send({ code: -1, message: "参数错误" });
  await db.sqlConnection("delete from think_role where id = ?", [ id ]);
  res.send({ code: 0, message: "操作成功" });
});
module.exports = router;

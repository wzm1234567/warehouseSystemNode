const express = require("express");

const router = express.Router();

const db = require("../db");

// 获取表格数据
router.get("/getbills", async (req, res) => {
  console.log(req.query);
  let page = Number(req.query.page);
  let pageSize = Number(req.query.pageSize);
  if (page == 1) {
    page = page - 1;
  } else {
    page = (page - 1) * pageSize;
  }

  try {
    let billsList = await db.sqlConnection("select * from bills limit ?,? ", [
      page,
      pageSize,
    ]);
    let total = await db.sqlConnection("select count(*) as total from bills");
    res.send({
      code: 0,
      data: billsList,
      total: total[0].total,
      message: "操作成功",
    });
  } catch (err) {
    res.send({ code: 1, data: [], message: err.message });
  }
});

// 添加表格数据
router.post("/addbills", (req, res) => {
  console.log(req.body);
  let sql = `insert into bills(dakuanqianshu,date,fahoprice,fahuodunshu,fapiaodingdan,pinzhong,plate,remark,shijijiaoyidunshu,shijijiaoyie) values(?,?,?,?,?,?,?,?,?,?)`;
  db.sqlConnection(sql, [
    // new Date().toLocaleString(),
    req.body.dakuanqianshu,
    req.body.date,
    req.body.fahoprice,
    req.body.fahuodunshu,
    req.body.fapiaodingdan || "",
    req.body.pinzhong,
    req.body.plate,
    req.body.remark || "",
    req.body.shijijiaoyidunshu,
    req.body.shijijiaoyie,
  ])
    .then((result) => {
      res.send({ code: 0, data: [], message: "添加成功" });
    })
    .catch((err) => {
      res.send({ code: -1, data: err, message: "添加失败" });
    });
});

// 删除表格数据
router.get("/deletebills", (req, res) => {
  console.log(req, 66666);
  let sql = `delete from bills where id=?`;
  if (req.query.id) {
    db.sqlConnection(sql, [req.query.id])
      .then((result) => {
        res.send({ code: 0, data: [], message: "删除成功" });
      })
      .catch((err) => {
        res.send({ code: 1, data: err, message: "删除失败" });
      });

    return;
  }
  res.send({ code: 1, data: [], message: "参数错误" });
});

// 修改表格数据
router.post("/editbills", (req, res) => {
  let sql = `update bills set create_time=?,tonnage_shipped=?,shipping_price=?,brand=?,plate_number=?,transaction_num=?,transaction_price=?,money=?,profit_and_loss=?,remark=?,update_time=? where id=?`;
  let params = [
    req.body.create_time,
    req.body.tonnage_shipped,
    req.body.shipping_price,
    req.body.brand,
    req.body.plate_number,
    req.body.transaction_num,
    req.body.transaction_price,
    req.body.money,
    req.body.profit_and_loss,
    req.body.remark,
    new Date().toLocaleString(),
    req.body.id,
  ];
  if (req.body.id) {
    db.sqlConnection(sql, params)
      .then((result) => {
        res.send({ code: 0, data: [], message: "修改成功" });
      })
      .catch((err) => {
        res.send({ code: 1, data: err, message: "修改失败" });
      });
  } else {
    res.send({ code: 1, data: [], message: "参数错误" });
  }
});

// 查询表格数据 根据日期事件范围查询

router.post("/searchbills", async (req, res) => {
  let sql = `select * from bills where create_time between ? and ?`;
  console.log(req.body.date);
  if (req.body.date.length == 0)
    return res.send({ code: 1, data: [], message: "参数错误" });

  try {
    let then = await db.sqlConnection(sql, req.body.date);
    let total = await db.sqlConnection("select count(*) as total from bills");
    res.send({
      code: 0,
      data: then,
      total: total[0].total,
      message: "操作成功",
    });
  } catch (error) {
    res.send({ code: -1, data: [], message: "操作失败" });
  }
});

module.exports = router;

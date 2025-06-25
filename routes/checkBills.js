const express = require("express");

const router = express.Router();

const db = require("../db");

// 获取出库信息
router.get("/getissue", async (req, res) => {
  let page = Number(req.query.page);
  let pageSize = Number(req.query.pageSize);

  if (page == 0) {
    page = page - 1;
  } else {
    page = (page - 1) * pageSize;
  }
  console.log(page);
  console.log(pageSize);

  // 搜索
  if (req.query.search != "") {
    try {
      let = data = await db.sqlConnection(
        "select * from issues where consignee_name like ? ORDER BY time DESC",
        ["%" + req.query.search + "%"]
      );
      let total = await db.sqlConnection(
        "select count(*) as total from issues where consignee_name like ?",
        ["%" + req.query.search + "%"]
      );
      res.send({
        code: 0,
        data: data,
        total: total[0].total,
        msg: "获取成功",
      });
    } catch (error) {
      res.send({
        code: 1,
        data: error,
        msg: "获取失败",
      });
    }
    return;
  }

  try {
    let data = await db.sqlConnection(
      "SELECT * FROM issues where song_ling = 0 ORDER BY time DESC limit ?,? ",
      [page, pageSize]
    );
    let total = await db.sqlConnection("select count(*) as total from issues ");
    data = data.filter((item) => item.time_out !== null);
    res.send({
      code: 0,
      data: data,
      total: total[0].total,
      msg: "获取成功",
    });
  } catch (error) {
    res.send({
      code: 1,
      data: error,
      msg: "获取失败",
    });
  }
});
// acprice
router.post("/acprice", async (req, res) => {
  console.log(req.body);
  let totalPrice = req.body.totalPrice
  // let a = await db.sqlConnection("update issues set actual_price = ?,total_price = ? where id = ?", [req.body.price,req.body.totalPrice, req.body.id])
  let data = await db.sqlConnection("select * from issues_price where outid = ?",[req.body.id])
  console.log(data);
  
  if (data.length > 0) {
    let num = 0
    let firstnum  = data[0].receive_price
    data.forEach((item) => {
      num += item.actual_price
    })
    num += req.body.price
    totalPrice = num - firstnum
  }
  await db.sqlConnection(
    "insert into issues_price (outid, actual_price, totalPrice,receive_price, date, time) values(?,?,?,?,?,?)",
    [req.body.id, req.body.price, totalPrice, req.body.receive_price, req.body.date, new Date().getTime()]
  );
  await db.sqlConnection(
    "update issues set duizhang_type = ?, total_price = ?, qiankuan_tyoe = ?,jieqing_type = ?  where id = ?",
    [1, totalPrice, 0, 0, req.body.id]
  );
  res.send({
    code: 0,
    data: [],
    msg: "获取成功",
  });
});

router.get("/getclient", async (req, res) => {
  try {
    let data = await db.sqlConnection(
      "select * from issues_price where outid = ?",
      [req.query.id]
    );
    data.sort((a,b)=>{
      return a.time - b.time; 
    })
    res.send({
      code: 0,
      data: data,
      msg: "获取成功",
    });
  } catch (error) {
    res.send({
      code: 1,
      data: error.message,
      msg: "获取失败",
    });
  }
});

router.post('/settle', async (req, res) => {
  let totalPrice = req.body.totalPrice
  // let a = await db.sqlConnection("update issues set actual_price = ?,total_price = ? where id = ?", [req.body.price,req.body.totalPrice, req.body.id])
  let data = await db.sqlConnection("select * from issues_price where outid = ?",[req.body.id])
  console.log(data);
  
  if (data.length > 0) {
    let num = 0
    let firstnum  = data[0].receive_price
    data.forEach((item) => {
      num += item.actual_price
    })
    num += req.body.price
    totalPrice = num - firstnum
  }
  await db.sqlConnection(
    "insert into issues_price (outid, actual_price, totalPrice,receive_price, date, time) values(?,?,?,?,?,?)",
    [req.body.id, req.body.price, totalPrice, req.body.receive_price, req.body.date, new Date().getTime()]
  );
  await db.sqlConnection(
    "update issues set duizhang_type = ?, total_price = ?, qiankuan_tyoe = ?,jieqing_type = ?  where id = ?",
    [1, totalPrice, 1, 1, req.body.id]
  );
  res.send({
    code: 0,
    data: [],
    msg: "获取成功",
  });
})
module.exports = router;

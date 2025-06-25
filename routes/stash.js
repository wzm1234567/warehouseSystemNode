const express = require("express");

const router = express.Router();

const db = require("../db");

// 获取仓库表格数据
router.post("/getstash", async (req, res) => {
  let arr = null;
  try {
    arr = await db.sqlConnection("select * from stash ORDER BY time ASC")
    res.send({ code: 0, data: arr || stashList, message: "操作成功", });
  } catch (err) {
    res.send({ code: 1, data: err, message: "操作失败" });
  }
});

// 添加仓库
router.post("/addstash", async (req, res) => {
  try {
    let data = await db.sqlConnection("select * from stash where name = ?", [req.body.name])
    if (data.length > 0) return res.send({ code: -1, data: [], message: "仓库已存在" });
    await db.sqlConnection("insert into stash(name,time) values(?,?)", [req.body.name, new Date().getTime()])
    res.send({ code: 0, data: [], message: "添加成功" });
  } catch (error) {
    res.send({ code: -1, data: [], message: error.message });
  }

})

// 删除表格数据
router.get("/deletestash", (req, res) => {
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
router.post("/editstash", (req, res) => {
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
router.post("/searchstash", async (req, res) => {
  // console.log(req.body);
  let timeArray = req.body.timeArray //时间段
  let stashId = req.body.stashId //仓库id
  let name = req.body.name // 物料名称
  console.log(timeArray);

  if (name != '' && timeArray.length == 0) {
    try {
      let data = await db.sqlConnection("select * from stash_info where is_stash_id=? && name like ? ORDER BY time DESC", [stashId, '%' + name + '%'])
      res.send({ code: 0, data: data, msg: '获取成功' })
      console.log(6666, data);
    } catch (error) {
      res.send({ code: -1, data: [], msg: error.message })
    }
  }


  if (name != '' && timeArray.length != 0) {

    try {
      let data = await db.sqlConnection("select * from stash_info where is_stash_id=? && name like ? && time between ? and ? ORDER BY time DESC", [stashId, '%' + name + '%', timeArray[0], timeArray[1]])
      res.send({ code: 0, data: data, msg: '获取成功' })


    } catch (error) {
      res.send({ code: -1, data: [], msg: error.message })
    }
  }

  if (name == '' && timeArray.length != 0) {
    try {
      let data = await db.sqlConnection("select * from stash_info where is_stash_id=? && time between ? and ?  ORDER BY time DESC", [stashId, timeArray[0], timeArray[1]])
      res.send({ code: 0, data: data, msg: '获取成功' })
      console.log(data);
    } catch (error) {
      res.send({ code: -1, data: [], msg: error.message })
    }
  }

});

// 获取仓库详情信息
router.get("/getstashinfo", async (req, res) => {
  console.log(req.query);
  let page = Number(req.query.page);
  let pageSize = Number(req.query.pageSize);

  if (page == 0) {
    page = page - 1;
  } else {
    page = (page - 1) * pageSize;
  }
  console.log(page);
  console.log(pageSize);
  // let data = await db.sqlConnection("select * from stash_info where is_stash_id=?", [req.query.id])
  let data = await db.sqlConnection("SELECT * FROM stash_info where is_stash_id = ?  ORDER BY time DESC  limit ?,?", [req.query.id, page, pageSize]);

  let total = await db.sqlConnection("select count(*) as total from stash_info where is_stash_id=?", [req.query.id]);

  res.send({ code: 0, data: data, total: total[0].total, msg: '获取信息成功' })
})

// 添加仓库详情信息
router.post("/addstashinfo", async (req, res) => {
  console.log(req.body);
  try {
    await db.sqlConnection("insert into stash_info(is_stash_id,name,num,price,pinpai,type,weight,guige,time) values(?,?,?,?,?,?,?,?,?)", [req.body.is_stash_id, req.body.name, req.body.num, req.body.price, req.body.pinpai, req.body.type, req.body.weight, req.body.guige, req.body.time])
    res.send({ code: 0, data: [], msg: '添加成功' })
  } catch (error) {
    res.send({ code: 1, data: [], msg: error.message })
  }


})



module.exports = router;

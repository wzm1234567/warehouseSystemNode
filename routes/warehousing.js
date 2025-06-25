const express = require("express");

const router = express.Router();

const db = require("../db");

// 获取入库表格数据
router.get("/getwarehousing", async (req, res) => {
  console.log(req.query);
  let page = Number(req.query.page);
  let pageSize = Number(req.query.pageSize);
  if (page == 1) {
    page = page - 1;
  } else {
    page = (page - 1) * pageSize;
  }
  if (req.query.search != '') {
    try {
      let stashList = await db.sqlConnection("select * from warehousing ORDER BY time DESC where name=? ", [req.query.search]);
      let total = await db.sqlConnection("select count(*) as total from warehousing where name=?", [req.query.search]);

      res.send({ code: 0, data: stashList, total: total[0].total, message: "操作成功", });
    } catch (err) {
      res.send({ code: 1, data: err, message: "操作失败" });
    }
  } else {
    try {
      let stashList = await db.sqlConnection("select * from warehousing ORDER BY time DESC limit ?,? ", [page, pageSize]);
      let total = await db.sqlConnection("select count(*) as total from warehousing");

      res.send({ code: 0, data: stashList, total: total[0].total, message: "操作成功" });
    } catch (err) {
      res.send({ code: 1, data: err, message: "操作失败" });
    }
  }



});

// 添加入库数据
router.post("/addwarehousing", async (req, res) => {
  console.log(req.body);
  db.db.getConnection(async (err, connection) => {
    connection.beginTransaction(async (err) => {
      try {
        let data = await db.sqlConnection('select * from material where id=?', [req.body.name]) // 通过id获取物料名称数据
        req.body.name = data[0].label;
        let data2 = await db.sqlConnection('select * from material_pinpai where id=?', [req.body.pinpai])// 通过id获取物料品牌数据
        req.body.pinpai = data2[0].pinpai;
        let data3 = await db.sqlConnection('select * from material_guige where id=?', [req.body.guige])// 通过id获取物料规格数据
        req.body.guige = data3[0].guige;
        let dataStash = await db.sqlConnection("select * from stash where id=?", [req.body.is_stash_id])
        if (req.body.num_flag == 1) {   // 物料总重量 转化成千克
          req.body.num = req.body.num * 1000;
        } else if (req.body.num_flag == 3) {
          req.body.num = req.body.num * 2000;
        }

        if (req.body.price_option == 2) req.body.price = req.body.price * 10000

        req.body.number = req.body.num / req.body.guige; // 计算后的总袋数 总重量/每袋重量
        req.body.number = parseFloat(req.body.number)
        req.body.number = Math.round(req.body.number * 100) / 100;

        // 添加到入库详情
        let sql = `insert into warehousing(name,pinpai,num,specifications,number,price,card,time,stash_label) values(?,?,?,?,?,?,?,?,?)`;
        await db.sqlConnection(sql, [req.body.name, req.body.pinpai, req.body.num, req.body.guige, req.body.number, req.body.price, req.body.card, req.body.time, dataStash[0].name])
        // 添加到仓库详情
        await db.sqlConnection("insert into stash_info(is_stash_id,name,pinpai,type,weight,price,guige,num,time) values(?,?,?,?,?,?,?,?,?)", [req.body.is_stash_id, req.body.name, req.body.pinpai, 0, req.body.num, req.body.price, req.body.guige, req.body.number, req.body.time])
        let num = data3[0].surplus; // 获取库存剩余量
        await db.sqlConnection("update material_guige set surplus=? where id=?", [Number(num) + Number(req.body.number), data3[0].id]) // 更新库存剩余量

        connection.commit(err => {
          if (err) {
            connection.rollback(() => {
              res.send({ code: -1, data: [], message: err.message });
            })
          }
        })
        res.send({ code: 0, data: [], message: "添加成功" });
      } catch (error) {
        connection.rollback(() => {
          res.send({ code: -1, data: [], message: error.message });
        })

      }
    })
  })




});

// 删除入库数据
router.get("/deletewarehousing", async (req, res) => {
  // try {

  //   let dataWare = await db.sqlConnection("select * from warehousing where id=?", [req.query.id]);// 获取要删除的入库详情数据 
  //   let data1 = await db.sqlConnection("select * from stash where name=?", [dataWare[0].stash_label]);// 获取删除的这条数据的仓库名称

  //   // 删除仓库数据
  //   await db.sqlConnection("delete from stash_info where  name=? and pinpai=? and price=? and guige=? and time=? and is_stash_id=?", [dataWare[0].name, dataWare[0].pinpai, dataWare[0].price, dataWare[0].specifications, dataWare[0].time, data1[0].id])

  //   /**
  //    * 获取仓库剩余量
  //    *  */
  //   let data2 = await db.sqlConnection("select * from material where stash_id=?&&label=?", [data1[0].id, dataWare[0].name]);// 获取物料数据

  //   let data3 = await db.sqlConnection("select * from material_pinpai where material_id=?&&pinpai=?", [data2[0].id, dataWare[0].pinpai]);// 获取物料品牌数据

  //   // 因为是删除操作，所以需要获取到删除的数量，然后减去
  //   let data4 = await db.sqlConnection("select * from material_guige where material_pinpai_id=?&&guige=?", [data3[0].id, dataWare[0].specifications]);//获取物料规格数据

  //   let number = data4[0].surplus - dataWare[0].number;
  //   await db.sqlConnection("update material_guige set surplus=? where id=? ", [number, data4[0].id]);
  //   await db.sqlConnection("delete from warehousing where id=?", [req.query.id])
  //   res.send({ code: 0, data: [], message: "删除成功" });
  // } catch (error) {
  //   res.send({ code: -1, data: [], message: error.message });
  // }



  try {

    let dataWare = await db.sqlConnection("select * from warehousing where id=?", [req.query.id]);// 获取要删除的入库详情数据 
    let data1 = await db.sqlConnection("select * from stash where name=?", [dataWare[0].stash_label]);// 获取删除的这条数据的仓库名称

    /**
     * 获取仓库剩余量
     *  */
    let data2 = await db.sqlConnection("select * from material where stash_id=?&&label=?", [data1[0].id, dataWare[0].name]);// 获取物料数据

    let data3 = await db.sqlConnection("select * from material_pinpai where material_id=?&&pinpai=?", [data2[0].id, dataWare[0].pinpai]);// 获取物料品牌数据

    // 因为是删除操作，所以需要获取到删除的数量，然后减去
    let data4 = await db.sqlConnection("select * from material_guige where material_pinpai_id=?&&guige=?", [data3[0].id, dataWare[0].specifications]);//获取物料规格数据

    let number = data4[0].surplus - dataWare[0].number;

    // 删除仓库数据
    // await db.sqlConnection("delete from stash_info where name=? and pinpai=? and price=? and guige=? and time=? and is_stash_id=?", [dataWare[0].name, dataWare[0].pinpai, dataWare[0].price, dataWare[0].specifications, dataWare[0].time, data1[0].id])
    // await db.sqlConnection("update material_guige set surplus=? where id=? ", [number, data4[0].id]);
    // await db.sqlConnection("delete from warehousing where id=?", [req.query.id])

    let querys = [
      {
        sql: "delete from stash_info where name=? and pinpai=? and price=? and guige=? and time=? and is_stash_id=?",
        params: [dataWare[0].name, dataWare[0].pinpai, dataWare[0].price, dataWare[0].specifications, dataWare[0].time, data1[0].id]
      },
      {
        sql: "update material_guige set surplus=? where id=? ",
        params: [number, data4[0].id]
      },
      {
        sql: "delete from warehousing where id=?",
        params: [req.query.id]
      },
    ]

    let a = await db.executeTransaction(querys)
    console.log(a, 666666);


    res.send({ code: 0, data: [], message: "删除成功" });
  } catch (error) {
    res.send({ code: -1, data: [], message: error.message });
  }

});

// 修改表格数据
router.post("/updatewarehousing", async (req, res) => {

  if (req.body.num_flag == 2) {
    req.body.num = req.body.num / 1000;
  } else if (req.body.num_flag == 3) {
    req.body.num = req.body.num / 1000 / 2;
  }

  if (req.body.guige_flag == 2) {
    req.body.guige = req.body.guige / 1000;
  } else if (req.body.num_flag == 3) {
    req.body.guige = req.body.guige / 1000 / 2;
  }

  req.body.number = req.body.num / req.body.guige;
  try {
    let sql = "update warehousing set name=?,pinpai=?,num=?,specifications=?,number=?,price=?,card=?,uptime=? where id=?"

    let list = await db.sqlConnection(sql, [req.body.name, req.body.pinpai, req.body.num, req.body.guige, req.body.number, req.body.price, req.body.card, req.body.uptime, req.body.id])

    res.send({ code: 0, msg: '修改成功' })
  } catch (error) {
    res.send({ code: -1, msg: '修改失败' })
  }
})

// 查询表格数据 根据日期事件范围查询

router.post("/searchwarehousing", async (req, res) => {
  let sql = `select * from warehousing where time between ? and ? && name like ?`;
  console.log(req.body.data);

  try {
    let then = await db.sqlConnection(sql, [req.body.data.sta, req.body.data.end, '%' + req.body.data.name + '%']);
    let total = await db.sqlConnection("select count(*) as total from warehousing where time between ? and ? && name like ?", [req.body.data.sta, req.body.data.end, '%' + req.body.data.name + '%']);
    res.send({ code: 0, data: then, total: total[0].total, message: "操作成功", });
  } catch (error) {
    res.send({ code: -1, data: [], message: "操作失败" });
  }

});

module.exports = router;

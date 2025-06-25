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
      "SELECT * FROM issues ORDER BY time DESC limit ?,?",
      [page, pageSize]
    );
    let total = await db.sqlConnection("select count(*) as total from issues ");
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

// 获取出库详情信息
router.get("/issueinfo", async (req, res) => {
  console.log(req.query.id);
  let issues_ling_info = await db.sqlConnection(
    "select * from issues_ling_info where issues_id=?",
    [req.query.id]
  );
  console.log(issues_ling_info);
  res.send({
    code: 0,
    data: issues_ling_info,
    msg: "获取成功",
  });
});

// 添加 运送路由
router.post("/setissue", async (req, res) => {
  let data = req.body;
  console.log(data);
  db.db.getConnection(async (err, connection) => {
    connection.beginTransaction(async (err) => {
      if (err) {
        return res.send({ code: -1, data: [], msg: "系统错误，联系管理员" });
      }
      try {
        // 获取客户信息
        let client = await db.sqlConnection("select * from client where id=?", [
          data[data.length - 1].peple,
        ]);
        console.log(client);
        await db.sqlConnection("update client set order_time=? where id=?", [
          data[data.length - 1].time,
          data[data.length - 1].peple,
        ]); // 添加客户最近订货信息
        // 添加出库信息
        let stashArray = await db.sqlConnection(
          "select * from stash where id=?",
          [data[data.length - 1].is_stash_id]
        );
        let sqlIssues =
          "insert into issues (song_ling , consignee_name , consignee_phone , time , address,stash_label,receive_price,actual_price,duizhang_type) values(?,?,?,?,?,?,?,?,?)";
        let issues = await db.sqlConnection(sqlIssues, [
          data[data.length - 1].song_ling,
          client[0].name,
          client[0].phone,
          data[data.length - 1].time,
          client[0].address,
          stashArray[0].name,
          data[data.length - 1].receive_price,
          data[data.length - 1].actualPrice,
          0
        ]);

        for (let i = 0; i < data.length - 1; i++) {
          // 通过id获取 物料名称、品牌、规格
          let dataInfo1 = await db.sqlConnection(
            "select label from material where id=?",
            [data[i].name]
          );
          data[i].name = dataInfo1[0].label;
          let dataInfo2 = await db.sqlConnection(
            "select * from material_guige where id=?",
            [data[i].netContent]
          );
          data[i].netContent = dataInfo2[0].guige;
          let dataInfo3 = await db.sqlConnection(
            "select * from material_pinpai where id=?",
            [data[i].pinpai]
          );
          data[i].pinpai = dataInfo3[0].pinpai;

          // 添加出库详情
          let issuesInfo =
            "insert into issues_ling_info (issues_id , content , content_num , content_price , pinpai , time , net_content , price_Tons) values(?,?,?,?,?,?,?,?)";
          await db.sqlConnection(issuesInfo, [
            issues.insertId,
            data[i].name,
            data[i].number,
            data[i].price,
            data[i].pinpai,
            data[data.length - 1].time,
            data[i].netContent,
            data[i].priceTons,
          ]);

          // 添加客户详情
          let sqlClientInfo =
            "insert into client_info (client_id, name , num , price_dun , price , time , net_content, pinpai,receive_price,actualPrice) values(?,?,?,?,?,?,?,?,?,?)";
          await db.sqlConnection(sqlClientInfo, [
            data[data.length - 1].peple,
            data[i].name,
            data[i].number,
            data[i].priceTons,
            data[i].price,
            data[data.length - 1].time,
            data[i].netContent,
            data[i].pinpai,
            data[data.length - 1].receive_price,
            data[data.length - 1].actualPrice
          ]);

          // 添加仓库信息
          let price = null;
          let weight = data[i].number * data[i].netContent;
          if (data[i].price == "")
            price =
              (data[i].priceTons / 1000) * data[i].netContent * data[i].number; // 按每吨计算总价
          if (data[i].priceTons == "") price = data[i].price * data[i].number; // 按单价计算总价
          let sqlStash =
            "insert into stash_info (is_stash_id , name , pinpai , type , weight , price , guige , num , time) values(?,?,?,?,?,?,?,?,?)";
          await db.sqlConnection(sqlStash, [
            data[data.length - 1].is_stash_id,
            data[i].name,
            data[i].pinpai,
            1,
            weight,
            price,
            data[i].netContent,
            data[i].number,
            data[data.length - 1].time
            
          ]);    
          // 获取库存剩余量
          let num = dataInfo2[0].surplus; // 获取库存剩余量
          // 更新库存剩余量
          await db.sqlConnection(
            "update material_guige set surplus=? where id=?",
            [Number(num) - Number(data[i].number), dataInfo2[0].id]
          ); // 更新库存剩余量
        }
        connection.commit((err) => {
          if (err) {
            return connection.rollback(() => {
              console.log("事务提交失败，事务回滚成功");
            });
          }
        });

        res.send({ code: 0, data: [], msg: "添加成功" });
      } catch (error) {
        connection.rollback(() => {
          console.log("事务提交失败，事务回滚成功");
          res.send({ code: -1, data: [], msg: "编码错误，事务回滚" });
        });
        res.send({ code: -1, data: [], msg: error.message });
      }
    });
  });
  // console.log(data[data.length - 1]); //客户信息
});

// 添加 零售路由
router.post("/setissueling", async (req, res) => {
  let data = req.body;
  console.log(data[data.length - 1]); //客户信息
  db.db.getConnection(async (err, connection) => {
    connection.beginTransaction(async (err) => {
      // 查找仓库
      try {
        let stashArray = await db.sqlConnection(
          "select * from stash where id=?",
          [data[data.length - 1].is_stash_id]
        );
        console.log(stashArray);

        let sql =
          "insert into issues (song_ling,consignee_name,consignee_phone,time,stash_label,time_out) values(?,?,?,?,?,?)"; // 添加出库表
        let list = [
          data[data.length - 1].song_ling,
          data[data.length - 1].peple,
          data[data.length - 1].phone,
          data[data.length - 1].time,
          stashArray[0].name,
          data[data.length - 1].time,
        ]; // 添加出库表 数据
        let issuesAdd = await db.sqlConnection(sql, list);

        for (let i = 0; i < data.length - 1; i++) {
          //要货信息
          let dataInfo1 = await db.sqlConnection(
            "select label from material where id=?",
            [data[i].name]
          );
          data[i].name = dataInfo1[0].label;
          let dataInfo2 = await db.sqlConnection(
            "select * from material_guige where id=?",
            [data[i].netContent]
          ); // 查询物料规格数据
          data[i].netContent = dataInfo2[0].guige;
          let dataInfo3 = await db.sqlConnection(
            "select * from material_pinpai where id=?",
            [data[i].pinpai]
          );
          data[i].pinpai = dataInfo3[0].pinpai;

          let sqlInfo =
            "insert into issues_ling_info (issues_id,content,content_num,content_price,pinpai,time,net_content) values(?,?,?,?,?,?,?)"; // 添加出库表 数据 详情
          let listInfo = [
            issuesAdd.insertId,
            data[i].name,
            data[i].number,
            data[i].price,
            data[i].pinpai,
            data[data.length - 1].time,
            data[i].netContent,
          ]; // 添加出库表 数据 详情
          await db.sqlConnection(sqlInfo, listInfo);

          // 添加仓库信息
          let price = data[i].price * data[i].number;
          let weight = data[i].number * data[i].netContent;
          let sqlStash =
            "insert into stash_info (is_stash_id,name,pinpai,type,weight,price,guige,num,time) values(?,?,?,?,?,?,?,?,?)";
          await db.sqlConnection(sqlStash, [
            data[data.length - 1].is_stash_id,
            data[i].name,
            data[i].pinpai,
            1,
            weight,
            price,
            data[i].netContent,
            data[i].number,
            data[data.length - 1].time,
          ]);

          // 获取库存剩余量
          let num = dataInfo2[0].surplus; // 获取库存剩余量
          // 更新库存剩余量
          await db.sqlConnection(
            "update material_guige set surplus=? where id=?",
            [Number(num) - Number(data[i].number), dataInfo2[0].id]
          ); // 更新库存剩余量
        }

        connection.commit((err) => {
          if (err) {
            return connection.rollback(() => {
              console.log("事务提交失败，事务回滚成功");
            });
          }
        });
        res.send({ code: 0, data: [], msg: "添加成功" });
      } catch (error) {
        connection.rollback(() => {
          console.log("事务提交失败，事务回滚成功");
          res.send({ code: -1, data: [], msg: "编码错误，事务回滚" });
        });
        res.send({ code: -1, data: [], msg: error.message });
      }
    });
  });
});

// 删除出库信息（连带仓库和仓库库存）
router.get("/delissue", async (req, res) => {
  console.log(req.query);
  db.db.getConnection(async (err, connection) => {
    connection.beginTransaction(async (err) => {
      if (err) {
        return res.send({ code: -1, data: [], msg: "系统错误，联系管理员" });
      }

      try {
        let data1 = await db.sqlConnection("select * from issues where id=?", [
          req.query.id,
        ]); // 获取所出库的仓库
        let data2 = await db.sqlConnection(
          "select * from issues_ling_info where issues_id=?",
          [req.query.id]
        ); // 获取所出库的物料详情信息
        console.log(data1);
        let data3 = await db.sqlConnection("select * from stash where name=?", [
          data1[0].stash_label,
        ]); // 获取仓库信息
        // console.log(data3);

        // console.log(data2);
        // console.log(data3);

        for (let i = 0; i < data2.length; i++) {
          let data4 = await db.sqlConnection(
            "select * from material where stash_id=?&&label=?",
            [data3[0].id, data2[i].content]
          ); // 查询仓库下的所有素材
          // console.log(data4);
          let data5 = await db.sqlConnection(
            "select * from material_pinpai where material_id=?&&pinpai=?",
            [data4[0].id, data2[i].pinpai]
          ); // 查询到品牌获取id
          // console.log(data5);
          let data6 = await db.sqlConnection(
            "select * from material_guige where material_pinpai_id=?&&guige=?",
            [data5[0].id, data2[i].net_content]
          );

          // console.log([data3[0].id, data2[i].content, data2[i].time]);
          // console.log([Number(data6[0].surplus) + Number(data2[i].content_num), data6[0].id]);

          await db.sqlConnection(
            "delete from stash_info where is_stash_id=?&&name=?&&time=?",
            [data3[0].id, data2[i].content, data2[i].time]
          ); // 删除仓库信息
          await db.sqlConnection(
            "update material_guige set surplus=? where id=?",
            [
              Number(data6[0].surplus) + Number(data2[i].content_num),
              data6[0].id,
            ]
          ); // 查询到规格直接修改库存
        }

        await db.sqlConnection("delete from issues where id=?", [req.query.id]);
        await db.sqlConnection(
          "delete from issues_ling_info where issues_id=?",
          [req.query.id]
        );

        connection.commit((err) => {
          if (err) {
            return connection.rollback(() => {
              console.log("事务提交失败，事务回滚成功");
            });
          }
        });
        res.send({ code: 0, data: [], msg: "删除成功" });
      } catch (error) {
        connection.rollback(() => {
          console.log("事务提交失败，事务回滚成功");
          res.send({ code: -1, data: [], msg: "编码错误，事务回滚" });
        });
      }
    });
  });

  // console.log(req.query);
  // try {
  //   let data1 = await db.sqlConnection("select * from issues where id=?", [req.query.id]) // 获取所出库的仓库
  //   let data2 = await db.sqlConnection("select * from issues_ling_info where issues_id=?", [req.query.id]) // 获取所出库的物料详情信息
  //   console.log(data1);
  //   let data3 = await db.sqlConnection("select * from stash where name=?", [data1[0].stash_label]) // 获取仓库信息
  //   // console.log(data3);

  //   // console.log(data2);
  //   // console.log(data3);

  //   for (let i = 0; i < data2.length; i++) {

  //     let data4 = await db.sqlConnection("select * from material where stash_id=?&&label=?", [data3[0].id, data2[i].content])// 查询仓库下的所有素材
  //     // console.log(data4);
  //     let data5 = await db.sqlConnection("select * from material_pinpai where material_id=?&&pinpai=?", [data4[0].id, data2[i].pinpai]) // 查询到品牌获取id
  //     // console.log(data5);
  //     let data6 = await db.sqlConnection("select * from material_guige where material_pinpai_id=?&&guige=?", [data5[0].id, data2[i].net_content])

  //     // console.log([data3[0].id, data2[i].content, data2[i].time]);
  //     // console.log([Number(data6[0].surplus) + Number(data2[i].content_num), data6[0].id]);

  //     await db.sqlConnection("delete from stash_info where is_stash_id=?&&name=?&&time=?", [data3[0].id, data2[i].content, data2[i].time]) // 删除仓库信息
  //     await db.sqlConnection("update material_guige set surplus=? where id=?", [Number(data6[0].surplus) + Number(data2[i].content_num), data6[0].id]) // 查询到规格直接修改库存
  //   }
  //   console.log(arr);

  //   await db.sqlConnection("delete from issues where id=?", [req.query.id])
  //   await db.sqlConnection("delete from issues_ling_info where issues_id=?", [req.query.id])
  //   res.send({ code: 0, data: [], msg: "删除成功" })
  // } catch (error) {
  //   res.send({ code: -1, data: [], msg: error.message })
  // }
});

router.post("/timeout", async (req, res) => {
  try {
    let date = new Date(req.body.date).getTime();
    await db.sqlConnection("update issues set time_out = ? where id = ?;", [
      date,
      req.body.id,
    ]);
    res.send({ code: 0, data: [], msg: "出库成功" });
  } catch (error) {
    res.send({ code: -1, data: [], msg: "出库失败" });
  }
});
module.exports = router;

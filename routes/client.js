const express = require('express');

const router = express.Router();

const db = require('../db');



// 获取客户基本信息

router.get("/getclient", async (req, res) => {
    console.log(req.query);
    if (req.query.name) {
        let data = await db.sqlConnection("select * from client where name like ?", ['%' + req.query.name + '%'])
        console.log(data);

        res.send({ code: 0, data: data, msg: "获取客户信息成功" })
    } else {
        try {
            let list = await db.sqlConnection("select * from client")
            res.send({ code: 0, data: list, msg: "获取客户信息成功" })
        } catch (e) {
            res.send({ code: -1, data: [], msg: e.message })
        }
    }

})

// 添加客户基本信息
router.post("/addclient", async (req, res) => {
    console.log(req.body);
    try {
        await db.sqlConnection("insert into client (name,phone,address,time) values(?,?,?,?)", [req.body.name, req.body.phone, req.body.address, req.body.time])
        res.send({
            code: 0,
            data: [],
            msg: "添加客户信息成功"
        })
    } catch (e) {
        res.send({
            code: -1,
            data: [],
            msg: e
        })
    }
})

// 获取客户详细信息（每次的订货时间）
router.get('/getClientInfo', async (req, res) => {
    // console.log(req.query.id);
    try {
        let infoList = await db.sqlConnection("select * from client_info where client_id=?", [req.query.id])
        // console.log(infoList);

        let arr = []

        infoList.forEach((item) => {
            item.time = new Date(item.time).getTime()
            let index = arr.findIndex(ele => {
                return ele.time == item.time
            })
            if (index == -1) {
                arr.push({ time: item.time })
            }
        })






        arr.forEach((item) => {
            item.children = []
            infoList.forEach(ele => {
                if (item.time == ele.time) {
                    item.children.push(ele)
                }
            })
        })

        console.log(arr);

        res.send({
            code: 0,
            data: arr,
            msg: '获取成功'
        })
    } catch (error) {
        res.send({
            code: -1,
            data: infoList,
            msg: error
        })
    }


})

// 删除客户信息
router.get("/deleteClient", async (req, res) => {
    console.log(req.query);
    try {
        // let dataClient = await db.sqlConnection("select * from client_info where client_id=?", [req.query.id]) // 获取要删除的客户订货信息
        // console.log(dataClient);

        // dataClient.forEach(async (item) => {
        //     await db.sqlConnection("delete from issues where time=?", [item.time]) // 删除出库信息
        //     await db.sqlConnection("delete from issues_ling_info where time=?", [item.time]) // 删除出库详情信息
        //     await db.sqlConnection("delete from stash_info where time=?", [item.time]) // 删除仓库详情信息
        // })


        await db.sqlConnection("delete from client where id=?", [req.query.id])
        await db.sqlConnection("delete from client_info where client_id=?", [req.query.id])
        res.send({ code: 0, data: [], msg: "删除成功" })
    } catch (error) {
        res.send({ code: -1, data: [], msg: error.message })
    }
})
module.exports = router;
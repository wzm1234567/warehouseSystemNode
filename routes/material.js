const express = require('express')

const router = express.Router()

const db = require('../db')
// 获取仓库信息
router.get("/getmaterialstash", async (req, res) => {
    let data = await db.sqlConnection("select * from stash ORDER BY time ASC")
    res.send({ code: 0, data: data, msg: '获取成功' })
})
// 获取物料信息 (获取名称)
router.get("/getmaterial", async (req, res) => {
    try {
        const material = await db.sqlConnection("SELECT * FROM material where stash_id=?", [req.query.stashId])
        res.send({ code: 0, data: material, msg: '获取成功' })
    } catch (error) {
        res.send({ code: -1, data: [], msg: error.message })
    }
})

// 获取物料信息 (获取品牌)
router.get("/getmaterial_pinpai", async (req, res) => {
    console.log(req.query);

    try {
        let data = await db.sqlConnection("SELECT * FROM material_pinpai where material_id=?", [req.query.id])
        res.send({ code: 0, data: data, msg: '获取成功' })
    } catch (error) {
        res.send({ code: -1, data: error.message, msg: '获取失败' })
    }
})
// 获取物料信息 (获取规格)
router.get("/getmaterial_guige", async (req, res) => {
    try {
        let data = await db.sqlConnection("SELECT * FROM material_guige where material_pinpai_id=?", [req.query.id])
        res.send({ code: 0, data: data, msg: '获取成功' })
    } catch (error) {
        res.send({ code: -1, data: [], msg: error.message })
    }
})

// 添加物料信息
router.post("/addmaterial", async (req, res) => {

    console.log(req.body);
    let data = await db.sqlConnection('select * from material where stash_id=?', [req.body.stashId])
    let filData = data.filter((item) => {
        return item.label == req.body.name
    })
    console.log(filData);

    if (filData.length > 0) { // 证明在数据库中存在这个物料
        try {
            let pinpaiid = await db.sqlConnection('select * from material_pinpai where pinpai=? && material_id=?', [req.body.pinpai, filData[0].id])
            console.log(pinpaiid);
            if (pinpaiid.length > 0) {
                console.log(66666);

                let sql2 = "insert into material_guige (material_pinpai_id,guige) values(?,?)"
                let guige = await db.sqlConnection(sql2, [pinpaiid[0].id, req.body.guige])
                res.send({ code: 0, data: [], msg: '添加成功' })

            } else {
                let sql = "insert into material_pinpai (material_id,pinpai) values(?,?)"
                let pinpai = await db.sqlConnection(sql, [filData[0].id, req.body.pinpai])
                let sql2 = "insert into material_guige (material_pinpai_id,guige) values(?,?)"
                let guige = await db.sqlConnection(sql2, [pinpai.insertId, req.body.guige])
                res.send({ code: 0, data: [], msg: '添加成功' })
            }


        } catch (error) {
            res.send({ code: -1, data: [], msg: error.message })
        }
    } else {
        try {
            let sql = "insert into material (label,time,stash_id) values(?,?,?)"
            let data1 = await db.sqlConnection(sql, [req.body.name, req.body.time, req.body.stashId])
            console.log(data1.insertId);
            let data2 = await db.sqlConnection("insert into material_pinpai (material_id,pinpai) values(?,?)", [data1.insertId, req.body.pinpai])
            let data3 = await db.sqlConnection("insert into material_guige (material_pinpai_id,guige) values(?,?)", [data2.insertId, req.body.guige])
            res.send({ code: 0, data: [], msg: '添加成功' })
        } catch (error) {
            res.send({ code: -1, data: [], msg: error.message })
        }
    }


    // res.send({ code: 0, data: [], msg: '添加成功' })
})

router.post("/delmaterial", async (req, res) => {
    console.log(req.body);
    try {
        let data = await db.sqlConnection("select * from material_guige where material_pinpai_id=?", [req.body.material_pinpai_id])
        console.log(data);
        if (data.length > 1) {
            await db.sqlConnection("delete from material_guige where id=?", [req.body.id])
        }else{
            await db.sqlConnection("delete from material_guige where id=?", [req.body.id])
            let data2 = await db.sqlConnection("select * from material_pinpai where id=?", [req.body.material_pinpai_id])
            await db.sqlConnection("delete from material_pinpai where id=?", [req.body.material_pinpai_id])
            await db.sqlConnection("delete from material where id=?", [data2.material_id])
        }
        
        res.send({ code: 0, data: [], msg: '删除成功' })
    } catch (error) {
        res.send({ code: -1, data: [], msg: error.message })
    }
})
module.exports = router
// 字典 通过编码获取字典值
const express = require("express");
const router = express.Router();
const db = require("../db");
const Redis = require("ioredis");
const redis = new Redis();

router.get("/getDict", async (req, res) => {
    let { type_code } = req.query;
    if (!type_code) return res.send({ code: 1, data: null, msg: "参数错误" });
    // 缓存
    let redData = await redis.get(type_code);
    if (redData != null) return res.send({code: 0, data: JSON.parse(redData), msg: '操作成功' })
    try {
        let data = await db.sqlConnection("select * from dict_type where type_code=?",[type_code]);
        let data1 = await db.sqlConnection(`select * from dict_item where type_id=?`,[data[0].id]);
        redis.setex(type_code, 3600, JSON.stringify(data1))
        res.send({ code: 0, data: data1, msg: "获取成功" });
    } catch (error) { }
});
module.exports = router;

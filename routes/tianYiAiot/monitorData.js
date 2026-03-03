const express = require("express");

const router = express.Router();

const db = require("../../db");

// 监听合肥水位设备 数据变化
router.post('/waterDataChange',(req, res) => {
    console.log(req.body, '监听数据');
})

module.exports = router;
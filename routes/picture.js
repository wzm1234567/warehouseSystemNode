const express = require("express");

const router = express.Router();

const db = require("../db");

/**
 * 获取图库列表
 * @param {Object} req.query
 * @param {number} req.query.userId 用户id
 */
router.get("/getGallery", async (req, res) => {
    try {
        let { userId } = req.query;
        let data = await db.sqlConnection("select * from gallery where user_id=?", [userId])
        res.send({ code: 0, data: data, msg: "获取成功" })
    } catch (error) {
        res.send({ code: -1, data: [], msg: "系统错误" })
    }
})

/**
 * 创建/修改图库
 * @param {Object} req.body
 * @param {number} req.body.userId 用户id
 * @param {number} req.body.name 图库名称
 * @param {number} req.body.remark 图库描述
 * @param {number} req.body.id 图库id 判断是否修改
 */
router.post("/addGallery", async (req, res) => {
    try {
        let { userId, name, remark = '', id } = req.body;
        if (id) {
            db.sqlConnection("update gallery set name=?,remark=? where id=?", [name, remark, id])
            res.send({ code: 0, data: [], msg: "操作成功" })
        } else {
            db.sqlConnection("insert into gallery(user_id,name,remark) values(?,?,?)", [userId, name, remark])
            res.send({ code: 0, data: [], msg: "操作成功" })
        }

    } catch (error) {
        res.send({ code: -1, data: [], msg: "系统错误" })
    }
})

/**
 * 删除图库
 * @param {Object} req.query
 * @param {number} req.query.id 图库id
 */
router.get("/deleteGallery", async (req, res) => {
    try {
        let { id } = req.query;
        console.log(id);

        await db.sqlConnection("delete from gallery where id=?", [id])
        res.send({ code: 0, data: [], msg: "操作成功" })
    } catch (error) {
        res.send({ code: -1, data: [], msg: "系统错误" })
    }
})
/**
 * 根据图库获取图片列表
 * @param {Object} req.query
 * @param {number} req.query.galleryId 图库id
 */
router.get("/getPicture", async (req, res) => {
    try {
        let { galleryId } = req.query;
        let data = await db.sqlConnection("select * from picture where gallery_id=?", [galleryId])
        let data2 = await db.sqlConnection("select * from gallery where id=?", [galleryId])
        if (data.length > 0) {
            await db.sqlConnection("update gallery set cover=? where id=?", [data[0].img, galleryId])
        }
        res.send({ code: 0, data: data, msg: "获取成功" })
    } catch (error) {
        res.send({ code: -1, data: [], msg: "系统错误" })
    }
})

/**
 * 添加/修改图片
 * @param {Object} req.body
 * @param {number} req.body.galleryId 图库id
 * @param {number} req.body.name 图片名称
 * @param {number} req.body.img 图片地址
 * @param {number} req.body.id 图片id 判断是否修改
 */
router.post("/addPicture", async (req, res) => {
    try {
        let { galleryId, name, img, id } = req.body;
        if (id) {
            await db.sqlConnection("update picture set name=?,img=? where id=?", [name, img, id])
            res.send({ code: 0, data: [], msg: "操作成功" })
        } else {
            await db.sqlConnection("insert into picture(gallery_id, name, img) values(?,?,?)", [galleryId, name, img])
            res.send({ code: 0, data: [], msg: "操作成功" })
        }
    } catch (error) {
        res.send({ code: -1, data: [], msg: "系统错误" })
    }
})

/**
 * 删除图片
 * @param {Object} req.query
 * @param {number} req.query.id 图片id
 */
router.get("/deletePicture", async (req, res) => {
    try {
        let { id } = req.query;
        await db.sqlConnection("delete from picture where id=?", [id])
        res.send({ code: 0, data: [], msg: "操作成功" })
    } catch (error) {
        res.send({ code: -1, data: [], msg: "系统错误" })
    }
})
module.exports = router;
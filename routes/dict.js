// 字典
const express = require('express');

const router = express.Router();

const db = require('../db');
/**
 * 添加字典类型
 * @param {Object} req.body 
 * @param {number} req.body.id 判断是编辑还是添加
 * @param {string} req.body.type_name
 * @param {string} req.body.type_code
 */
router.post('/addDictType', async (req, res) => {
    let { id, type_name, type_code } = req.body;
    if (!type_name || !type_code) return res.send({ code: -1, msg: '参数错误' });
    if (id) {
        let sql = 'update dict_type set type_name = ?, type_code = ? where id = ?';
        await db.sqlConnection(sql, [type_name, type_code, id]);
        return res.send({ code: 0, msg: '修改成功' });
    } else {
        await db.sqlConnection(`insert into dict_type(type_name, type_code) values(?,?)`, [type_name, type_code])
        res.send({ code: 0, msg: '添加成功' })
    }
})

/**
 * 获取字典类型
 */
router.get('/getDictType', async (req, res) => {
    let data = await db.sqlConnection(`select * from dict_type`)
    res.send({ code: 0, data: data, msg: '操作成功' })
})

/**
 * 删除字典类型
 * @param {Object} req.query
 * @param {Number} req.query.id 字典类型id
 */
router.get('/deleteDictType', async (req, res) => {
    let { id } = req.query
    let data = await db.sqlConnection(`delete from dict_type where id = ?`, [id])
    res.send({ code: 0, msg: '操作成功' })
})



/**
 * 添加与修改字典项
 * @param {Object} req.body 
 * @param {string} req.body.id 字典项id 判断是添加还是修改
 * @param {string} req.body.type_id 字典类型id
 * @param {string} req.body.item_name 字典名称
 * @param {string} req.body.item_code 字典编码
 */
router.post('/addDictItem', async (req, res) => {
    let { id, type_id, item_name, item_code } = req.body;
    if (!type_id || !item_name || !item_code) return res.send({ code: -1, msg: '参数错误' });
    if (id) {
        let sql = `update dict_item set type_id=?,item_name=?,item_code=? where id=?`;
        await db.sqlConnection(sql, [type_id, item_name, item_code, id]);
        res.send({ code: 0, msg: '修改成功' });
    } else {
        await db.sqlConnection(`insert into dict_item(type_id,item_name,item_code) values(?,?,?)`, [type_id, item_name, item_code])
        res.send({ code: 0, msg: '添加成功' })
    }
})

/**
 * 获取字典项
 * @param {Object} req.query
 * @param {number} req.query.type_id 字典类型id
 */
router.get('/getDictItem', async (req, res) => {
    let { type_id } = req.query;
    let data = await db.sqlConnection(`select * from dict_item where type_id=?`, [type_id])
    res.send({ code: 0, data: data, msg: '操作成功' })
})

/**
 * 删除字典项
 * @param {Object} req.query
 * @param {number} req.query.id 字典项id
 */
router.get('/deleteDictItem', async (req, res) => { 
    let { id } = req.query;
    if (!id) return res.send({ code: -1, data: [], msg: '参数错误' })
    await db.sqlConnection(`delete from dict_item where id=?`, [id])
    res.send({ code: 0, data: [], msg: '删除成功' })
})
module.exports = router;
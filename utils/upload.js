const express = require("express");
const router = express.Router();
const multer = require("multer"); // 引入multer中间件处理上传文件的中间件
const path = require("path"); // path获取当前文件的路径
const fs = require("fs");
// const upload = multer({
//     dest: path.resolve(__dirname, '../public', "uploads")
// })
// 创建接收文件夹, 下面这一句放在创建服务器下面(删除这段注释)
// const upload = multer({ dest: path.join(__dirname, 'uploads') })
console.log(path.resolve(__dirname, "../public/upload"), "path获取当前文件的路径");
// 确保目录存在（已确认）
const uploadDir = path.resolve(__dirname, "../public/upload");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 设置存储配置
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 代表当前文件			// 在当前文件下转中的文件夹（即要保存文件的位置）
    cb(null, path.resolve(__dirname, "../public/upload")); // 确保这个文件夹已经存在
  },
  filename: function (req, file, cb) {
    // 给存储的文件起名
    cb(null, file.fieldname + "-" + Date.now() + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // 允许所有文件类型（生产环境应限制）
    cb(null, true);
  },
});
/* 以上固定写法 */

// upload.single('file') 上传file文件 还可以用其他 具体看官网 百度
router.post("/uploadImage", upload.single("file"), async (req, res) => {
  if (!req.file) {
    // 前端要以form-data数据传递，后端要打开解析form-data数据的中间件
    return res.status(400).send("No file uploaded.");
  }
  // 拼接完整URL
  const protocol = req.protocol; // http 或 https
  const host = req.get("host");  // 主机名+端口，如 localhost:3000 或 example.com
  const url = `${protocol}://${host}/upload/${req.file.filename}`; // 拼接好图片路径返回给前端
  console.log(req.file);
  res.send({
    code: 0,
    data: url,
    msg: "上传成功",
  });
});

module.exports = router;

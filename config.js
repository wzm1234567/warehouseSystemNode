// 安装: npm install dotenv
require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env.production" : ".env",
}); // 在应用入口顶部加载一次

const config = {
  port: process.env.PORT,
  nodeEnv: process.env.NODE_ENV,
  // 数据库
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATA,
  },
  // 环境特定配置
  isDev: process.env.NODE_ENV === "development",
  isProd: process.env.NODE_ENV === "production",
};
module.exports = config;

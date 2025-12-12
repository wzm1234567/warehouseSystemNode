const mysql = require("mysql2");
const config = require('./config');
console.log(config);

const db = mysql.createPool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  charset: "utf8mb4", // 或其他适合的字符集
  // 连接池核心配置
  connectionLimit: 10,        // 最大连接数
  queueLimit: 0,              // 排队限制，0=不限
  // TCP Keep-Alive 配置（防断开）
  enableKeepAlive: true,      // ✅ 开启保活
  keepAliveInitialDelay: 0,   // ✅ 立即发送第一个探针
  // keepAliveDelay: 60000,   // 探针间隔（默认即可）
  // 其他有用的选项
  waitForConnections: true,   // 连接耗尽时等待
  maxIdle: 10,                // 最大空闲连接
  idleTimeout: 60000,         // 空闲连接超时（毫秒）
});
// 连接池级错误处理（替代 onerror）
db.on('error', (err) => {
  console.error('连接池错误:', err.code);
  if (err.code === 'ECONNRESET') {
    console.log('检测到连接重置，连接池自动恢复中...');
    // mysql2 会自动清理并重新创建连接，无需手动干预
  }
});
// 数据库封装   sql:sql语句  params:参数 promise:返回promise对象 then方法

const sqlConnection = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.getConnection((err, connection) => {
      if (err) {
        console.log("数据库连接失败", err);
        reject(err);
        return;
      } else {
        console.log("数据库连接成功");
      }

      connection.query(sql, params, (err, result) => {
        if (err) {
          console.log("数据库编码设置失败", err);
          reject(err);
          return;
        } else {
          resolve(result);
          console.log("数据库编码设置成功");
          connection.release();
        }
      });
    });
  });
};



const executeTransaction = (queries) => {
  return new Promise((resolve, reject) => {
    db.getConnection((err, connection) => {
      if (err) {
        console.log("数据库连接失败", err);
        reject(err);
        return;
      } else {
        console.log("数据库连接成功");
        connection.beginTransaction((err) => {
          if (err) {
            return reject("开启事务失败: ", err);
          }

          for (let i = 0; i < queries.length; i++) {
            connection.query(queries[i].sql, queries[i].params, (err, result) => {
              if (err) {
                return connection.rollback(() => {
                  console.log("数据库编码设置失败，事务回滚成功", err);
                  return reject(err);
                });
              } else {
                console.log("数据库编码设置成功");
                connection.release();
                if (i === queries.length - 1) {
                  connection.commit((err) => {
                    if (err) {
                      return connection.rollback(() => {
                        console.log("事务提交失败，事务回滚成功");
                        reject(err);
                      });
                    }
                    console.log("事务提交成功");
                    resolve("事务提交成功");
                  });
                }
              }
            }
            );
          }
        });
      }
    });
  });
};



sqlConnection("select 1").then((res) => console.log(res));

module.exports = { db, sqlConnection, executeTransaction };

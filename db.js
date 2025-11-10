const mysql = require("mysql2");
const config = require('./config');

const db = mysql.createPool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  charset: "utf8mb4", // 或其他适合的字符集
  connectionLimit: 10, // 连接池大小（可选）
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

const mysql = require("mysql2/promise"); // ✅ 改用 promise 版本
const config = require('./config');
console.log(config);
const pool = mysql.createPool({
  host: config.db.host,
  user: config.db.user,
  port: 3306,
  password: config.db.password,
  database: config.db.database,
  charset: "utf8mb4",
  
  // ✅ 正确的连接池配置选项
  connectionLimit: 10,             // 连接池大小
  queueLimit: 0,                   // 无限制排队
  waitForConnections: true,        // 等待可用连接
  
  // ✅ 正确的超时配置（mysql2/promise 版本）
  connectTimeout: 30000,           // 连接超时 30秒
  
  
  // ✅ 连接生命周期管理
  maxIdle: 10000,                  // 最大空闲时间
  idleTimeout: 60000,              // 空闲超时
  
  /**
  // ✅ 连接选项
  multipleStatements: false, // 禁止多语句查询（安全）
  namedPlaceholders: false,  // 不使用命名参数
  decimalNumbers: true,      // 返回 decimal 为数字
  dateStrings: false,        // 返回 Date 对象
  stringifyObjects: false,   // 不字符串化对象
  supportBigNumbers: true,   // 支持大数字
  bigNumberStrings: true,    // 大数字作为字符串返回
  */
});

// 连接池错误监听
pool.on('error', (err) => {
  console.error('连接池错误:', err.code);
  if (err.code === 'ECONNRESET') {
    console.log('检测到连接重置，连接池自动恢复中...');
  }
});

/**
 * 数据库连接健康检查
 */
const checkDatabaseHealth = async () => {
  try {
    const [result] = await pool.execute('SELECT 1 as health_check');
    console.log('✅ 数据库连接健康检查通过');
    return true;
  } catch (error) {
    console.error('❌ 数据库健康检查失败:', error.message);
    return false;
  }
};

/**
 * 获取连接池状态
 */
const getPoolStatus = () => {
  return {
    totalConnections: pool._allConnections.length,
    freeConnections: pool._freeConnections.length,
    waitingAcquires: pool._acquiringConnections.length
  };
};


/**
 * 执行SQL查询（自动管理连接）
 * @param {string} sql - SQL语句
 * @param {Array} params - 参数
 * @returns {Promise}
 */
const sqlConnection = async (sql, params) => {
  try {
    const [rows] = await pool.execute(sql, params);
    console.log("查询成功:", sql.substring(0, 50), "...");
    return rows;
  } catch (error) {
    console.error("查询失败:", error.message);
    throw error;
  }
};

/**
 * 执行事务（自动管理连接）
 * @param {Array} queries - [{sql, params}]
 * @returns {Promise}
 */
const executeTransaction = async (queries) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    console.log("事务开始");

    // ✅ 使用 for...of 保证顺序执行
    for (const query of queries) {
      await connection.execute(query.sql, query.params);
      console.log("执行成功:", query.sql.substring(0, 50), "...");
    }

    await connection.commit();
    console.log("事务提交成功");
    return { success: true };
  } catch (error) {
    await connection.rollback();
    console.error("事务回滚:", error.message);
    throw error;
  } finally {
    // ✅ 确保无论成功失败都会释放连接
    connection.release();
    console.log("连接已释放");
  }
};

checkDatabaseHealth()

module.exports = { pool, sqlConnection, executeTransaction };
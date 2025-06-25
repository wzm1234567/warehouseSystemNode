// const redis = require("redis");

// // 创建全局 redis 客户端实例
// // let client;

// const client = redis.createClient({
//   host: "127.0.0.1", //本地 注意此处不要加http或https
//   port: 6379, //端口号默认6379
// });

// // 监听客户端错误
// client.on("error", (err) => console.log("Redis Client Error", err));


// module.exports = client;





// const initRedis = async () => {
//   // 创建客户端实例
//   client = createClient({
//     socket: {
//       host: '127.0.0.1',
//       port: 6379
//     }
//   })

//   // 监听客户端错误
//   client.on('error', (err) => console.log('Redis Client Error', err))

//   // 连接 redis 服务器
// }

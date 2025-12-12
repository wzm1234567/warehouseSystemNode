var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");

// const redisClient = require('redis').createClient();

const { expressjwt: expressJWT } = require("express-jwt");

const secretKey = "jkdskahfuifhqaf"; // 里面字符串随意输入

// 引入路由配置文件
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var loginRouter = require("./routes/login");
var menuRouter = require("./routes/menu");
var billsRouter = require("./routes/bills");
var stashRouter = require("./routes/stash");
var getwarehousingRouter = require("./routes/warehousing");
var issueRouter = require("./routes/issue");
var materialRouter = require("./routes/material");
var clientRouter = require("./routes/client");
// 实例化对象
var app = express();

// 静态资源目录
app.use('/upload', express.static(path.resolve(__dirname, './public/upload'), { fallthrough: false }));
app.use(express.json());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
// 处理post请求

app.use(express.urlencoded({ extended: false }));


app.use(cors()); // 解决跨域问题

app.use(
  expressJWT({ secret: secretKey, algorithms: ["HS256"] }).unless({
    path: [
      "/login/login", 
      "/users/register", 
      "/login/captcha", 
      "/upload"
    ]
  })
);

app.all("*", (req, res, next) => {
  let origin = req.headers.origin;
  console.log(origin);

  //设置允许任何域访问
  res.header("Access-Control-Allow-Origin", origin ? origin : "*"); // 指定允许访问该资源的外域URL，若设置为 *，则允许所有访问，如下仅支持来自http://127.0.0.1:3000的请求。
  //设置  允许任何 数据类型
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Content-Length, Authorization, Accept, X-Requested-With"
  ); // 如果客户端向服务器发送了额外的请求头信息，则需要在服务器端，通过 Access-Control-Allow-Headers 对额外的请求头进行声明，否则这次请求会失败。
  //设置 允许 使用的HTTP方法
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT"); //默认情况下，CORS仅支持客户端发起 GET、POST、HEAD 请求。如果客户端希望通过 PUT、DELETE 等方式请求服务器的资源，则需要通过 Access-Control-Alow-Methods来指明实际请求所允许使用的 HTTP 方法。若设置为 * ，则允许所有 HTTP 请求方法访问。
  // 兼容前端withCredentials=true的设置
  res.header("Access-Control-Allow-Credentials", "true"); //允许携带cookie
  //过滤预请求
  if (res.methods === "OPTIONS") {
    res.sendStatus(200); //如果是预请求 就不再进行后面的中间件匹配执行了   直接发送回数据
  } else {
    next(); //  进入下一个中间件
  }
});
app.use(cookieParser());

// 路由匹配
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/login", loginRouter);
app.use("/admin", menuRouter);
app.use("/bills", billsRouter);
app.use("/stash", stashRouter);
app.use("/warehousing", getwarehousingRouter);
app.use("/issue", issueRouter);
app.use("/admin", materialRouter);
app.use("/admin", clientRouter);
app.use("/file", require("./utils/upload"));
app.use("/checkBills", require("./routes/checkBills"));
app.use("/role", require("./routes/role"));
app.use("/dict", require("./routes/dict"));
app.use("/sys", require("./utils/dict"));
app.use("/picture", require("./routes/picture"));
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  console.error(err.stack); // 记录错误堆栈信息
  if (err.status == 401) res.send({ code: 401, msg: "token失效,请重新登录" });
  if (err.status == 400) res.send({ code: 400, msg: "参数错误" });
  if (err.status == 500) res.send({ code: 500, msg: "服务器错误" });
  if (err.status == 403) res.send({ code: 403, msg: "禁止访问" });
  if (err.status == 404) res.send({ code: 404, msg: "路径错误" });
  if (err.status == 408) res.send({ code: 408, msg: "请求超时" });
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

// var debug = require("debug")("myweb:server");
var http = require("http");

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.APP_PORT);

app.set("port", port);
console.log(process.env.PORT);

// /**
//  * Create HTTP server.
//  */

var server = http.createServer(app);

// /**
//  * Listen on provided port, on all network interfaces.
//  */

server.listen(port);

// server.on("error", onError);
// server.on("listening", onListening);

// /**
//  * Normalize a port into a number, string, or false.
//  */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

// /**
//  * Event listener for HTTP server "error" event.
//  */

// function onError(error) {
//   if (error.syscall !== "listen") {
//     throw error;
//   }

//   var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

//   // handle specific listen errors with friendly messages
//   switch (error.code) {
//     case "EACCES":
//       console.error(bind + " requires elevated privileges");
//       process.exit(1);
//       break;
//     case "EADDRINUSE":
//       console.error(bind + " is already in use");
//       process.exit(1);
//       break;
//     default:
//       throw error;
//   }
// }

// /**
//  * Event listener for HTTP server "listening" event.
//  */

// function onListening() {
//   var addr = server.address();
//   console.log(addr);

//   var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
//   debug("Listening on " + bind);
// }

// module.exports = app;

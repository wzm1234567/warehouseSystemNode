const config = require('./config');
module.exports = {
  apps: [{
    name: 'my-express-app',
    script: 'app.js',
    instances: 'max',  // 使用所有CPU核心
    exec_mode: 'cluster',  // 集群模式
    env: {
      NODE_ENV: 'development',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    log_file: './logs/combined.log', // 所有日志文件
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',// 日志时间戳格式
    merge_logs: true,
    autorestart: true, // 进程异常退出时自动重启
    watch: false,  // 开发环境设置true 生产环境必须为false
    max_memory_restart: '1G', // 内存使用超过1GB时自动重启进程 单位支持: M (MB), G (GB)
    // 启动延迟
    listen_timeout: 8000, // PM2 等待应用启动完成的超时时间（毫秒）
    kill_timeout: 5000
  }]
};

/**
 * 附加 pm2-logrotate 是 PM2 官方模块，用于自动轮转、压缩和清理日志文件，防止日志占满磁盘空间
 * pm2 install pm2-logrotate
 * | 参数               | 说明                    | 默认值                  | 示例                                                 |
   | ---------------- | --------------------- | -------------------- | -------------------------------------------------- |
   | `max_size`       | 单文件大小限制 (10M/10G/10K) | 10M                  | `pm2 set pm2-logrotate:max_size 100M`              |
   | `retain`         | 保留的轮替文件数量             | 30                   | `pm2 set pm2-logrotate:retain 7`                   |
   | `compress`       | 是否启用 gzip 压缩          | false                | `pm2 set pm2-logrotate:compress true`              |
   | `rotateInterval` | Cron 表达式定时轮转          | -                    | `pm2 set pm2-logrotate:rotateInterval '0 0 * * *'` |
   | `max_days`       | 保留天数（优先级高于 retain）    | -                    | `pm2 set pm2-logrotate:max_days 7`                 |
   | `dateFormat`     | 日志文件名日期格式             | YYYY-MM-DD\_HH-mm-ss | `pm2 set pm2-logrotate:dateFormat YYYY-MM-DD`      |
   | `workerInterval` | 检查间隔（秒）               | 30                   | `pm2 set pm2-logrotate:workerInterval 30`          |
   | `rotateModule`   | 是否轮转 PM2 自身日志         | true                 | `pm2 set pm2-logrotate:rotateModule true`          |
 * 
 * 
 * 完整生产环境配置
 * # 综合配置
    pm2 install pm2-logrotate
    pm2 set pm2-logrotate:max_size 200M      # 200MB 或按大小
    pm2 set pm2-logrotate:rotateInterval '0 0 * * *'  # 或按时间
    pm2 set pm2-logrotate:retain 30          # 保留 30 份
    pm2 set pm2-logrotate:max_days 30        # 或 30 天（二选一）
    pm2 set pm2-logrotate:compress true      # 压缩旧日志
    pm2 set pm2-logrotate:dateFormat 'YYYY-MM-DD_HH-mm-ss'
    pm2 set pm2-logrotate:workerInterval 30  # 30秒检查一次
 * 
 * 
 * 查看当前配置
 * # 查看所有 PM2 配置
    pm2 conf

  # 仅查看 logrotate 配置
    pm2 conf pm2-logrotate
 * 
 * 无需重启应用，配置会自动生效。但若要立即应用新配置，可执行 pm2 restart all
 * 
 * 
 * 
 */
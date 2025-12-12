/**
 * 获取当前时间
 * @param {string} spacer 日期分隔符
 * @returns {string} 时间格式 年月日时分秒
 */
export function getTime(spacer = "-") {
  const now = new Date();
  const year = now.getFullYear(); // 年
  const month = now.getMonth() + 1; // 月（注意：月份从 0 开始，所以要加 1）
  const day = now.getDate(); // 日
  const hour = now.getHours(); // 时
  const minute = now.getMinutes(); // 分
  const second = now.getSeconds(); // 秒

  // 补零函数（可选）
  function padZero(num) {
    return num < 10 ? "0" + num : num;
  }

  // 格式化输出
  const formatted = `${year}${spacer}${padZero(month)}${spacer}${padZero(
    day
  )} ${padZero(hour)}:${padZero(minute)}:${padZero(second)}`;

  return formatted;
}
/**
 * 获取当前时间与前些天的时间
 * @param {number} Interval 时间间隔 例如前30天与今天（默认为前30天）
 */
export function getTimeInterval(Interval = 30) {
  /* 1. Date 对象 */
  const now = new Date(); // 当前时间
  const thirtyDaysAgo = new Date(Date.now() - Interval * 24 * 60 * 60 * 1000);

  /* 2. 格式化函数 */
  function fmt(d) {
    const y = d.getFullYear();
    const M = String(d.getMonth() + 1).padStart(2, "0");
    const D = String(d.getDate()).padStart(2, "0");
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    const s = String(d.getSeconds()).padStart(2, "0");
    return `${y}-${M}-${D} ${h}:${m}:${s}`;
  }

  const nowStr = fmt(now); // "2025-10-13 14:07:28"
  const thirtyStr = fmt(thirtyDaysAgo); // "2025-09-13 14:07:28"
  return [thirtyStr, nowStr];
  // console.log("现在:", nowStr);
  // console.log("30 天前:", thirtyStr);
}

export function getTodayRange() {
  const now = new Date();
  // 当天 0 点
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  // 格式化函数
  const format = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');
    return `${y}-${m}-${d} ${h}:${min}:${s}`;
  };

  return {
    start: format(start),
    end: format(now)
  };
}

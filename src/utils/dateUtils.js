/*
 * @interface 将时间戳转为固定格式的字符窜 yyyy-MM-dd HH:mm:ss
 * @timeStamp {number} timeStamp 时间戳
 * @return {string} 返回固定格式的字符窜
 * */
export function toLocalTime(timeStamp) {
  var date=new Date(timeStamp);
  var year = date.getFullYear();
  var month = (date.getMonth() + 1) < 10 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1);
  var dateTime = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
  var hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
  var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
  var seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
  return year + "-"+month + "-" + dateTime + " " + hours + ":" + minutes + ":" + seconds;
}

/*
 * @interface 将时间戳转为固定格式的字符窜 yyyy-MM-dd HH:mm
 * @timeStamp {number} timeStamp 时间戳
 * @return {string} 返回固定格式的字符窜
 * */
export function toLocalTimeWithNoSecond(timeStamp) {
  var date=new Date(timeStamp);
  var year = date.getFullYear();
  var month = (date.getMonth() + 1) < 10 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1);
  var dateTime = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
  var hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
  var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
  return year + "-"+month + "-" + dateTime + " " + hours + ":" + minutes
}

/*
 * @interface 将时间戳转为固定格式的字符窜 yyyy-MM-dd
 * @timeStamp {number} timeStamp 时间戳
 * @return {string} 返回固定格式的字符窜
 * */
export function toLocalTimeWithNoTime(timeStamp) {
  var date=new Date(timeStamp);
  var year = date.getFullYear();
  var month = (date.getMonth() + 1) < 10 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1);
  var dateTime = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
  return year + "-"+month + "-" + dateTime
}

/*
* @interface 获取指定日期的时间戳
* @param {number|object} timeStamp 指定日期的时间戳或者日期对象
* */
export function getStartTimeStampOfDate(timeStamp){
  var time=new Date(timeStamp);
  const startDateY = time.getFullYear();
  const startDateM = time.getMonth();
  const startDateD = time.getDate();
  return new Date(startDateY, startDateM, startDateD, 0, 0, 0).getTime()
}

/*
* @interface 获取指定日期的结束的时间戳
* @param {number | object} timeStamp 指定日期的时间戳或者时间对象
* */
export function getEndTimeStampOfDate(timeStamp){
  var time=new Date(timeStamp);
  const startDateY = time.getFullYear();
  const startDateM = time.getMonth();
  const startDateD = time.getDate();
  return new Date(startDateY, startDateM, startDateD, 23, 59, 59).getTime()
}

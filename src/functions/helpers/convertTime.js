
// format seconds into h:mm:ss/mm:ss
// (h:mm:ss if time is > 1h)
exports.convertTime = function convertTime(time) {
  if (time === null || time === undefined) {
    return "x";
  } else if (time / 3600 >= 1) {
    const hours = Math.floor(time / 3600);
    time = time - hours;
    const minutes = Math.floor((time - hours * 3600) / 60);
    const seconds = time - minutes * 60 - hours * 3600;
    return `${hours}h ${minutes}m ${seconds}s`;
  } else {
    const minutes = Math.floor((time) / 60);
    const seconds = time - minutes * 60;
    return `${minutes}m ${seconds}s`;
  }
}
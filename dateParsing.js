var dateFormat = function (type, today) {
  // Generate initial state values
  var day = "",
    month = "",
    year = "",
    hour = "",
    minutes = "",
    seconds = "",
    miliseconds = "";

  // Working varialbes

  if (type === 'txnDate') {
    day = today.getUTCDate() + "";
    month = (today.getUTCMonth() + 1) + "";
    year = today.getUTCFullYear() + "";
    hour = today.getUTCHours() + "";
    minutes = today.getUTCMinutes() + "";
    seconds = today.getUTCSeconds() + "";
    miliseconds = today.getUTCMilliseconds() + "";
  } else {
    day = today.getDate() + "";
    month = (today.getMonth() + 1) + "";
    year = today.getFullYear() + "";
    hour = today.getHours() + "";
    minutes = today.getMinutes() + "";
    seconds = today.getSeconds() + "";
    miliseconds = today.getMilliseconds() + "";
  }

  day = checkZero(day);
  month = checkZero(month);
  year = checkZero(year);
  hour = checkZero(hour);
  minutes = checkZero(minutes);
  seconds = checkZero(seconds);



  // Concat
  if (type === 'device') {
    return day + "-" + month + "-" + year + " " + hour + ":" + minutes + ":" + seconds
  } else if (type === 'requestid') {
    return day + month + year + hour + minutes + seconds + miliseconds
  } else if (type === 'txnDate') {
    return year.toString().substr(-2) + month + day + hour + minutes + seconds + padZero(miliseconds.toString())
  } else if (type === 'propMas') {
    return day + '-' + month + '-' + year;
  }
  // Modify the miliseconds
  function padZero(time) {
    if (time.length == 2) {
      time = '0' + time;
    } else if (time.length == 1) {
      time = '00' + time;
    }
    return time;
  }
  // Modify the time
  function checkZero(data) {
    if (data.length == 1) {
      data = "0" + data;
    }
    return data;
  }
}

module.exports = {
  dateFormat
}

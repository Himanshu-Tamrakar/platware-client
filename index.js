var CORE = require('./core.js');
var props = require('./defaultProps.js');
var trigger = require('./triggerRequest.js');
var middleware = require('./middleware.js');

exports.callPlatware = function (data, callback) {
  /**
   * Network connection Handling.
   *
   * @return {Object} The response object.
   *
   */
  if (!navigator.onLine) {
    var data = {
      "message": "Network connection Failure",
      "status": "Connection Failure"
    }
    callback(trigger.apiRes(false, 'Some status code', (data)));
    return;
  }
  /**
   * Multiple Service Handling.
   *
   * @return {Object} The response object.
   *
   */
  var as = Object.keys(data.reqData.services);
  if (as.length > 5) {
    {
      var data = {
        "message": "Max 5 services are allowed at a time",
        "status": "Failure"
      }
      callback(trigger.apiRes(false, 'Some status code', (data)));
      return;
    }
  }

  // Delete variables
  if (props.PWRequest && props.PWRequest.temp) {
    delete props.PWRequest.temp
  }
  if (props.PWRequest && props.PWRequest.txnkey) {
    delete props.PWRequest.txnkey
  }
  if (props.PWRequest && props.PWRequest.loginId) {
    delete props.PWRequest.loginId
  }

  /**
   * Service Handling.
   *
   * @return {Object} The response object.
   *
   */
  if (Object.keys(data.reqData.services)[0] != 'REGISTERAPP') {
    const sn = Object.keys(data.reqData.services)[0];
    if (CORE.cpmc()) {
      console.log('property master already called today');
      // service api call
      trigger.reqToService(data, callback);
    } else {
      console.log('property master api call');
      // property master api call
      makeCallToPM(data, callback);
    }
  } else {
    trigger.reqToService(data, callback);
  }
}

function makeCallToPM(data, callfn) {
  const apiData = data;
  var pm = apiData;
  trigger.reqToPM(pm, apiData, callfn)
}

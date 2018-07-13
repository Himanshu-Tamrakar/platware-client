var CORE = require('./core.js');
var props = require('./defaultProps.js');
var request = require('./postRequest.js');
var middleware = require('./middleware.js');
var Fingerprint = require('./fingerprintjs');

var fingerprint = function () {
  return new Fingerprint().get().toString();
}

function reqCallToPM(pmdata, serviceData, callfn) {
  //headers are stored in props.PWRequest.PWHeader
  //content of the body is stored in props.PWRequest.PWBody
  const req = reqData(pmdata);
  middleware.reqM(req, fingerprint());
  const body = props.PWRequest.temp ? props.PWRequest.temp : props.PWRequest.PWBody;

  request.post(req.envProps.environment.baseUrl + req.url, props.PWRequest.PWHeader, body, true, 100000, function (headers, state, status, response) {

    var _responseAPI = response.target;
    var bodyData = _responseAPI.response ? JSON.parse(_responseAPI.response) : _responseAPI.response;
    if (bodyData && bodyData.response) {
      var tnx = props.PWRequest.txnkey;
      var decryRes = CORE.AESDec(bodyData.response, tnx.toString());
      bodyData = JSON.parse(decryRes);
    }
    for (var _services in bodyData ? bodyData.services : {}) {
      if (_services === 'PROPERTYMASTER') {
        CORE.setpm();
        const fl = bodyData.services.PROPERTYMASTER.records[0].data;
        for (var _flkey in fl) {
          if (fl[_flkey].propertyName === 'IS_FORCE_LOGIN') {
            window.localStorage.setItem("forceLogin", fl[_flkey].propertyValue);
          }
        }
      }
    }
    if (typeof callfn === 'function') {
      console.log("onSuccess", status, bodyData);
      reqCallToService(serviceData, callfn);
    }

  }, function (state, status, response) {
    console.log("error", state, status, response);
    if (status != 0) {
      console.log("error", state, status, response);
      callfn(apiResponse(false, status, JSON.parse(response)));
    }
  })
}

function reqCallToService(data, callfn) {
  //headers are stored in props.PWRequest.PWHeader
  //content of the body is stored in props.PWRequest.PWBody

  const apiData = data;
  middleware.reqM(data, fingerprint());
  console.log("props", props.PWRequest);
  const body = props.PWRequest.temp ? props.PWRequest.temp : props.PWRequest.PWBody;

  request.post(data.envProps.environment.baseUrl + data.url, props.PWRequest.PWHeader, body, true, 100000, function (headers, state, status, response) {
    console.log("response.target", response.target)
    var _responseAPI = response.target;
    var bodyData = _responseAPI.response ? JSON.parse(_responseAPI.response) : _responseAPI.response;
    if (bodyData && bodyData.response) {
      var tnx = props.PWRequest.txnkey;
      var decryRes = CORE.AESDec(bodyData.response, tnx.toString());
      bodyData = JSON.parse(decryRes);
    }
    for (var _services in bodyData ? bodyData.services : {}) {
      if (_services === 'REGISTERAPP') {
        const _hash = headers.hash.toString();
        const _auth = headers.auth.toString();

        var rsaData = bodyData.services.REGISTERAPP.records[0].data[0].rsa;
        var rsaJSON = JSON.parse(rsaData);
        CORE.AESKey(rsaJSON, data.envProps.environment.envProps.secureKey);
        window.localStorage.setItem("jwtToken", CORE.AESEnc(_auth, data.envProps.environment.envProps.secureKey))
        window.localStorage.setItem("hash", CORE.AESEnc(_hash, data.envProps.environment.envProps.secureKey))

        const req = reqData(apiData);
        if (!CORE.cpmc()) {
          reqCallToService(req, callfn);
        }
      } else if (_services === 'AUTH') {
        const _auth = headers.auth.toString();
        window.localStorage.setItem("loginId", props.PWRequest.loginId);
        window.localStorage.setItem("authJwtToken", CORE.AESEnc(_auth, data.envProps.environment.envProps.secureKey))
      } else if (_services === 'PROPERTYMASTER') {
        CORE.setpm();
        const fl = bodyData.services.PROPERTYMASTER.records[0].data;
        for (var _flkey in fl) {
          if (fl[_flkey].propertyName === 'IS_FORCE_LOGIN') {
            window.localStorage.setItem("forceLogin", fl[_flkey].propertyValue);
          }
        }
      }
    }
    if (typeof callfn === 'function') {
      console.log("onSuccess", status, bodyData);
      callfn(apiResponse(true, status, bodyData));
    }

  }, function (state, status, response) {
    console.log("error", state, status, response);
    if (state === 'REGISTERAPP' && status === '401' ||
      status === '627') {
      const req = regReqData(apiData);
      reqCallToService(req, callfn);
    } else if (state === 'AUTH' && status === '621') {
      var r = confirm("Are you sure you want to kill this session?");
      if (r == true) {
        var _hk = apiData.hasOwnProperty('header') ? true : false;
        if (_hk) {
          for (x in _hk) {
            apiData.header['isforcelogin'] = 'Y';
          }
        } else {
          apiData['header'] = {};
          apiData.header['isforcelogin'] = 'Y';
        }
        reqCallToService(apiData, callfn);
        console.log("You pressed OK!", );
      } else {
        console.log("You pressed Cancel!");
      }
    } else if (state === 'AUTH' && status === '402' ||
      status === '622' || status === '628' || status === '528') {
      window.localStorage.removeItem("authJwtToken");
      window.localStorage.removeItem("loginId");
      callfn(apiResponse(false, status, JSON.parse(response)));
    } else if (status != 0) {
      console.log("error", state, status, response);
      callfn(apiResponse(false, status, JSON.parse(response)));
    } else {
      console.log("error", state, status, response);
    }
  })
}

function reqData(data) {
  /**
   *
   * @return {Object} 
   *
   */
  return {
    url: '/gateway',
    envProps: data.envProps,
    reqData: {
      "interfaces": {},
      "services": {
        "PROPERTYMASTER": [{}]
      }
    },
  }
}


function regReqData(data) {
  /**
   *
   * @return {Object} 
   *
   */
  return {
    url: '/register',
    envProps: data.envProps,
    reqData: {
      "interfaces": {},
      "services": {
        "REGISTERAPP": []
      }
    },
  }
}

var apiResponse = function (v, sc, res) {
  /**
   * Create the response object.
   *
   * @return {Object} The response object.
   *
   */
  var response = {
    onSuccess: v,
    data: res,
    statuscode: sc
  }
  return response;
}


module.exports = {
  reqToPM: reqCallToPM,
  reqToService: reqCallToService,
  apiRes: apiResponse
};

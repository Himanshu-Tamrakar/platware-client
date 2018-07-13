var props = require('./defaultProps.js');
var datePars = require('./dateParsing.js');
var CORE = require('./core.js');

reqM: requestMiddleware = function (data, dID) {
  /**
   * [Initializes a newly default props]
   */
  clearAllFields();
  /**
   * [Working varialbes]
   */
  var _navigatorData = window.navigator;
  var _services = Object.keys(data.reqData.services).join("~").toString();
  var _CD = new Date();
  var _CN = _CD.getTime();
  var _nounceValue = CORE.HexStr(_CD.getTime().toString());
  /**
   * [Generate interfaces values ]
   */
  var _interfacesKeys = data.reqData.interfaces;
  for (x in _interfacesKeys) {
    props.PWRequest.PWBody.interfaces[x] = _interfacesKeys[x]
  }

  /**
   * [Generate header values]
   */
  var _headerKeys = data.header;
  for (x in _headerKeys) {
    props.PWRequest.PWHeader[x] = _headerKeys[x]
  }

  /**
   * [request parsing description]
   */
  if (_services === 'REGISTERAPP') {
    setRegisterBody(_navigatorData, _CD, dID, data)
    setRegisterHeaders(_navigatorData, _CD, _CN, dID, _services, data, _nounceValue);
  } else if (_services === 'AUTH') {
    setAuthHeaders(_nounceValue, data, _services, dID, _CN, _CD);
    setAuthBody(datePars, dID, _navigatorData, data, _CD);
  } else if (data.url === '/gateway' || data.url === '/logout') {
    setServiceHeaders(_navigatorData, _CD, dID, data, _services);
    setServiceBody(datePars, _CD, _navigatorData, data, dID);
  }
}


function clearAllFields() {

  // Generate initial state values

  props.setPWRequest({
    "PWHeader": {
      "clientid": "",
      "deviceid": "",
      "platform": "",
      "authorization": "",
      "requesttype": "",
      "txnkey": "",
      "requestid": "",
      "servicename": "",
      "hash": "",
    },
    "PWBody": {
      "interfaces": {
        "APPLICATION_VERSION": "",
        "DEVICE_TIMESTAMP": "",
        "PW_CLIENT_VERSION": "",
        "fingerprint": "",
        "DEVICE_MAKE": "",
        "DEVICE_MODEL": "",
        "PW_VERSION": "",
        "DEVICE_LATITUDE": "",
        "DEVICE_LONGITUDE": "",
      },
      "services": {}
    }
  })
}

function setAuthHeaders(_nounceValue, data, _services, dID, _CN, _CD) {
  /**
   * [Working varialbes]
   */
  var _loginId = data.reqData.services.AUTH[0].LOGIN_ID ? data.reqData.services.AUTH[0].LOGIN_ID : "--";
  var _secureKey = _CN.toString() + data.envProps.environment.envProps.secureKey;
  var _subString = _secureKey.substring(0, 32);

  var _authCryptor = data.envProps.environment.envProps.orgId + "~" + data.envProps.environment.envProps.appId + "~" +
    _loginId + "~" + dID + ":user:" + _CN;

  var _authEncryptKey = CORE.AESEnc(_authCryptor, _subString);

  /**
   * [request header parsing description]
   */

  props.PWRequest.PWHeader.requestid = getRequestid(data, _loginId, dID, _CD);
  props.PWRequest.PWHeader.authorization = "Basic " + _authEncryptKey;
  props.PWRequest.PWHeader["nounce"] = _nounceValue;
  props.PWRequest.PWHeader["clientid"] = getClientid(data);

  props.PWRequest.PWHeader.requesttype = "ER_ER";
  props.PWRequest.PWHeader.servicename = _services;
  props.PWRequest.PWHeader.platform = data.envProps.environment.envProps.platform;
  props.PWRequest.PWHeader.deviceid = dID;
  props.PWRequest.PWHeader["security-version"] = data.envProps.environment.envProps.securityVersion;

  var _fl = window.localStorage.getItem('forceLogin') ? window.localStorage.getItem('forceLogin') : "";
  if (_fl === 'Y') {
    props.PWRequest.PWHeader["isforcelogin"] = _fl;
  }
  // Save loginId
  props.PWRequest['loginId'] = _loginId;

}


function setAuthBody(datePars, dID, _navigatorData, data, _CD) {
  /**
   * [request parsing interface description]
   */
  setInterface(datePars, _CD, data, _navigatorData, dID);

  props.PWRequest.PWBody.services = data.reqData.services;
  /**
   * [Working varialbes]
   */

  // get txnKey
  var getKey = generateTxnKey(_CD, data);
  props.PWRequest.PWHeader.txnkey = getKey.b64txn;

  var _body = CORE.AESEnc(JSON.stringify(props.PWRequest.PWBody), getKey.txn);
  var _updateBody = {
    request: _body
  }
  /**
   * [request body parsing description]
   */
  props.PWRequest["temp"] = _updateBody;
  props.PWRequest.PWHeader.hash = (CORE.Hmac(JSON.stringify(_updateBody).toString(),
    getKey.txn)).toUpperCase();

  // Save txnKey
  props.PWRequest["txnkey"] = getKey.txn.toString();

}

function setRegisterHeaders(_navigatorData, _CD, _CN, dID, _services, data, _nounceValue) {
  /**
   * [Working varialbes]
   */
  var _secureKey = _CN.toString() + data.envProps.environment.envProps.secureKey;
  var _subString = _secureKey.substring(0, 32);
  var _authCryptor = data.envProps.environment.envProps.orgId + "~" + data.envProps.environment.envProps.appId + "~" +
    dID + ":app:" + _CN;
  var _authEncryptKey = CORE.AESEnc(_authCryptor, _subString);
  props.PWRequest.PWHeader.txnkey = '',

    props.PWRequest.PWHeader.authorization = "Basic " + _authEncryptKey;
  var _hashKey = CORE.Hmac("Basic " + _authEncryptKey, data.envProps.environment.envProps.secureKey);

  /**
   * [request header parsing description]
   */
  props.PWRequest.PWHeader.hash = _hashKey;
  props.PWRequest.PWHeader.requesttype = "PR_PR";
  props.PWRequest.PWHeader.requestid = getRequestid(data, '--', dID, _CD);
  props.PWRequest.PWHeader["nounce"] = _nounceValue;
  props.PWRequest.PWHeader["clientid"] = getClientid(data);
  props.PWRequest.PWHeader.servicename = _services;
  props.PWRequest.PWHeader.platform = data.envProps.environment.envProps.platform;
  props.PWRequest.PWHeader.deviceid = dID;

  props.PWRequest.PWHeader["security-version"] = data.envProps.environment.envProps.securityVersion;
}

function setRegisterBody(_navigatorData, _CD, dID, data) {
  /**
   * [request parsing interface description]
   */
  setInterface(datePars, _CD, data, _navigatorData, dID);
  props.PWRequest.PWBody.services = data.reqData.services;
}

function setServiceHeaders(_navigatorData, _CD, dID, data, _services) {
  /**
   * [Get JWT token]
   */
  var jwtToken = ''
  if (window.localStorage.getItem('authJwtToken')) {
    jwtToken = CORE.AESDec(window.localStorage.getItem('authJwtToken'), data.envProps.environment.envProps.secureKey);
  } else if (window.localStorage.getItem('jwtToken')) {
    jwtToken = CORE.AESDec(window.localStorage.getItem('jwtToken'), data.envProps.environment.envProps.secureKey);
  }

  /**
   * [request header parsing description]
   */
  props.PWRequest.PWHeader.authorization = jwtToken;

  var loginID = window.localStorage.getItem('loginId') ? window.localStorage.getItem('loginId') : "--";
  props.PWRequest.PWHeader.requestid = getRequestid(data, loginID, dID, _CD);

  props.PWRequest.PWHeader.deviceid = dID;
  props.PWRequest.PWHeader["clientid"] = getClientid(data);
  props.PWRequest.PWHeader["security-version"] = data.envProps.environment.envProps.securityVersion;
  props.PWRequest.PWHeader.requesttype = "ER_ER";
  props.PWRequest.PWHeader.servicename = _services;
  props.PWRequest.PWHeader.platform = data.envProps.environment.envProps.platform;
}

function setServiceBody(datePars, _CD, _navigatorData, data, dID) {
  /**
   * [request parsing interface description]
   */
  setInterface(datePars, _CD, data, _navigatorData, dID)

  /**
   * [request body parsing description]
   */
  props.PWRequest.PWBody.services = data.reqData.services;

  /**
   * [Working varialbes]
   */

  // get txnKey
  var getKey = generateTxnKey(_CD, data);
  props.PWRequest.PWHeader.txnkey = getKey.b64txn;

  var _body = CORE.AESEnc(JSON.stringify(props.PWRequest.PWBody), getKey.txn);
  var _updateBody = {
    request: _body
  }
  props.PWRequest["temp"] = _updateBody;
  props.PWRequest.PWHeader.hash = (CORE.Hmac(JSON.stringify(_updateBody),
    getKey.txn)).toUpperCase();

  // Save txnKey
  props.PWRequest["txnkey"] = getKey.txn.toString();
}

function getClientid(data) {
  /**
   *
   * @return Client id .
   *
   */
  return data.envProps.environment.envProps.orgId + "~" + data.envProps.environment.envProps.appId;
}


function getRequestid(data, loginId, dID, _CD) {
  /**
   *
   * @return Request id .
   *
   */
  return data.envProps.environment.envProps.orgId +
    data.envProps.environment.envProps.appId + dID + loginId + datePars.dateFormat('requestid', _CD);
}

function generateTxnKey(_CD, data) {
  /**
   *
   * @return txn key and hex string .
   *
   */
  var txn = CORE.RS(32 - datePars.dateFormat('txnDate', _CD).length);
  txn = datePars.dateFormat('txnDate', _CD) + txn;
  var encryKey = window.localStorage.getItem('Publickey');
  var decKey = CORE.AESDec(encryKey, data.envProps.environment.envProps.secureKey)
  var b64txn = CORE.RSAEnc(txn, decKey);
  b64txn = CORE.b64toHex(b64txn);

  return {
    txn,
    b64txn
  };
}

function setInterface(datePars, _CD, data, _navigatorData, dID) {
  /**
   * [request parsing interface description]
   */
  props.PWRequest.PWBody.interfaces.DEVICE_TIMESTAMP = datePars.dateFormat('device', _CD);
  props.PWRequest.PWBody.interfaces.fingerprint = dID;
  props.PWRequest.PWBody.interfaces.APPLICATION_VERSION = data.envProps.environment.envProps.appVersion;
  props.PWRequest.PWBody.interfaces.PW_CLIENT_VERSION = "2.5";
  props.PWRequest.PWBody.interfaces.DEVICE_MAKE = _navigatorData.platform;
  props.PWRequest.PWBody.interfaces.DEVICE_MODEL = _navigatorData.vendor ? _navigatorData.vendor : _navigatorData.appCodeName;
  props.PWRequest.PWBody.interfaces.DEVICE_LATITUDE = "";
  props.PWRequest.PWBody.interfaces.DEVICE_LONGITUDE = "";
  props.PWRequest.PWBody.interfaces.PW_VERSION = "";

}

module.exports = {
  reqM: requestMiddleware
}

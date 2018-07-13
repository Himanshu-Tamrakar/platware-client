var PWRequest = {
    "PWHeader": {
        "clientid": "",
        "deviceid": "",
        "platform": "WEB",
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
}

var setPWRequest = function(obj) {
  this.PWRequest = obj;
}

module.exports={
    PWRequest:PWRequest,
    setPWRequest:setPWRequest
}

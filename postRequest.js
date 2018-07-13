 makePostCall = function (url, headers, body, aync, timeout, onSuccess, onFailure) {
   const http = xhrRef();
   setTimeout(http, timeout);

   http.open('POST', url, aync);
   setHeaders(http, headers);
   http.send(JSON.stringify(body));
   /**
    * [description]
    * @param  {[type]} error [description]
    * @return {[type]}       [description]
    */
   http.onerror = function (error) {
     console.log("Code here for the server answer when not successful", http.status);
   }
   /**
    * [description]
    * @return {[type]} [description]
    */
   http.ontimeout = function () {
     console.log("ontimeout", http.status);
   }
   /**
    * [description]
    * @param  {[type]} e [description]
    * @return {[type]}   [description]
    */
   http.response = function (e) {

   }
   http.onreadystatechange = function (e) {
     if (http.readyState === 4) {
       var res = JSON.parse(e.target.response);
       if (headers.servicename === 'LOGOUT' && res.status === '625') {
         window.localStorage.removeItem("authJwtToken");
         window.localStorage.removeItem("loginId");
         onSuccess({}, http.readyState, http.status, e);
       } else if (headers.servicename === 'REGISTERAPP' && res.status === '401' ||
         res.status === '627') {
         onFailure('REGISTERAPP', res.status, e.target.response)
       } else if (headers.servicename === 'AUTH' && res.status === '621') {
         onFailure('AUTH', res.status, e.target.response)
       } else if (headers.servicename === 'AUTH' && res.status === '402' ||
         res.status === '622' || res.status === '628' || res.status === '528') {
          window.localStorage.removeItem("authJwtToken");
          window.localStorage.removeItem("loginId");
         onFailure('AUTH', res.status, e.target.response);
       } else if (http.status === 200) {
         var hash = http.getResponseHeader('hash');
         var auth = http.getResponseHeader('Authorization');
         onSuccess({
           hash,
           auth
         }, http.readyState, http.status, e);
       } else {
         console.log("Error", {}, http.readyState, http.status, e);
         onFailure(http.readyState, http.status, e.target.response)
       }
     }
   }
 }
 /**
  * [timeout description]
  * @type {[type]}
  */
 function xhrRef() {
   return new XMLHttpRequest();
 }
 /**
  * [setTimeout description]
  * @param {[type]} h [description]
  * @param {[type]} t [description]
  */
 function setTimeout(h, t) {
   h.timeout = t;
 }

 /**
  * [setHeaders description]
  * @param {[type]} http    [description]
  * @param {[type]} headers [description]
  */
 function setHeaders(http, headers) {
   http.setRequestHeader('Content-Type', 'application/json');
   if (Object.keys(headers).length > 0) {
     for (var k in headers) {
       if (headers.hasOwnProperty(k)) {
         http.setRequestHeader(k, headers[k]);
       }
     }
   }
 }

 module.exports = {
   post: makePostCall
 };

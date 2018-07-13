
var datePars = require('./dateParsing.js');
var AESEncryption = require('./AESEncryption/PlatwareAES.js');
var CryptoJS = require('./crypto-js/crypto-js');
var JSEncrypt = require('./js-encrypt/src/jsencrypt.js');

/**
 * [Check wheather to call property master or not]
 * @return {[type]} []
 */
var checkPropCall = function () {
  const r = window.localStorage.getItem('pmlc');
  const f = window.localStorage.getItem('forceLogin');
  const t = datePars.dateFormat('propMas', new Date());
  return r === t && f != null;
}

var setPmlcValue = function () {
  window.localStorage.setItem('pmlc', datePars.dateFormat('propMas', new Date()));
}

var randomString = function (length) {
  /**
   *  Random number generator 
   *
   * @return {string} Random string.
   *
   */
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = length; i > 0; --i) {
    result += chars[Math.round(Math.random() * (chars.length - 1))];
  }
  return result;
}


function base64ToHex(str) {
  /**
   * Converts a Base64 string to a hex.
   *
   * @return {object} The hex object.
   *
   */
  for (var i = 0, bin = atob(str.replace(/[ \r\n]+$/, "")), hex = []; i < bin.length; ++i) {
    var tmp = bin.charCodeAt(i).toString(16);
    if (tmp.length === 1) tmp = "0" + tmp;
    hex[hex.length] = tmp;
  }
  //The hex string.
  return hex.join("");
}


var storeAESPublicKey = function (data, key) {
  var obj = {};
  for (var keyValue in data) {
    if (keyValue === 'public-pem') {
      obj["key"] = AESEncryption.cryptor.encryptText(data[keyValue].toString(), key);
    }
  }
  window.localStorage.setItem("Publickey", obj['key'])
}

var getHexString = function (value) {
  /**
   * Creates a byte array filled with random bytes.
   *
   * @param {number} value The number of random bytes to generate.
   *
   * @return {ByteArray} The random word array.
   *
   */
  var byteArray = [];
  for (var i = 0; i < value.length; i++) {
    byteArray.push(value.charCodeAt(i));
  }
  /**
   * @return {string} The hex string.
   */
  var value = toHexString(byteArray);
  return value;
}

var toHexString = function (byteArray) {
  /**
   * Converts a byte array to a hex string.
   *
   * @param {ByteArray} byteArray The byte array.
   *
   * @return {string} The hex string.
   *
   */
  return Array.from(byteArray, function (byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('')
}

var getEncryption = function (plaintext, key) {
  /**
   * Encrypts a text using a key.
   *
   * @param {WordArray|string} plaintext The plaintext to encrypt.
   * @param {string} key The key.
   *
   * @return The encrypt string.
   *
   */
  var a = AESEncryption.cryptor.encryptText(plaintext, key);
  // Encrypt
  return a;
}

var getDecryption = function (text, key) {
  /**
   * Decrypts a text using a key.
   *
   * @param {WordArray|string} text The text to decrypt.
   * @param {string} key The key.
   *
   * @return The decrypt string.
   *
   */
  var b = AESEncryption.cryptor.decryptText(text, key);
  // Decrypt
  return b;
}

var getHashvalue = function (plaintext, key) {
  /**
   * The HMAC's object interface.
   *
   * @param {WordArray|string} plaintext The plaintext to hash.
   * @param {WordArray|string} key The secret key.
   *
   * @return {WordArray} The hash.
   *
   */
  var hash = CryptoJS.HmacSHA512(plaintext, key).toString();
  // hash
  return hash;
}

var RSAEncrypt = function (plaintext, key) {
  /**
   * Encrypts a text using public key.
   *
   * @param {WordArray|string} text The text to encrypt.
   * @param {string} key The private key.
   *
   * @return The encrypt string.
   *
   */
  var encrypt = new JSEncrypt.JSEncrypt();
  encrypt.setPublicKey(key);
  var encrypted = encrypt.encrypt(plaintext);
  // Encrypt
  return encrypted;
}

var RSADecrypt = function (text, randomKey) {
  /**
   * Decrypts a text using private key.
   *
   * @param {WordArray|string} text The text to decrypt.
   * @param {string} key The private key.
   *
   * @return The decrypt string.
   *
   */
  var decrypt = new JSEncrypt.JSEncrypt();
  decrypt.setPrivateKey(randomKey);
  var uncrypted = decrypt.decrypt(text);
  // Decrypt
  return uncrypted;
}
module.exports = {
  cpmc: checkPropCall,
  setpm: setPmlcValue,
  RS: randomString,
  b64toHex: base64ToHex,
  AESKey: storeAESPublicKey,
  HexStr: getHexString,
  AESEnc: getEncryption,
  AESDec: getDecryption,
  Hmac: getHashvalue,
  RSAEnc: RSAEncrypt,
  RSADec: RSADecrypt
}

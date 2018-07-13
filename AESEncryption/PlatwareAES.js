var CryptoJS = require('../crypto-js/crypto-js');

var AesUtil = function (keySize, iterationCount) {
    this.keySize = keySize / 32;
    this.iterationCount = iterationCount;
};

AesUtil.prototype.generateKey = function (salt, passPhrase) {
    var key = CryptoJS.PBKDF2(
            passPhrase,
            CryptoJS.enc.Hex.parse(salt),
            {keySize: this.keySize, iterations: this.iterationCount});
    return key;
}

AesUtil.prototype.encrypt = function (salt, iv, passPhrase, plainText) {
    var key = this.generateKey(salt, passPhrase);
    var encrypted = CryptoJS.AES.encrypt(
            plainText,
            key,
            {iv: CryptoJS.enc.Hex.parse(iv)});
    return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
}
AesUtil.prototype.decryptHex = function (salt, iv, passPhrase, cipherText) {
    var key = this.generateKey(salt, passPhrase);
    var cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Base64.parse(cipherText)
    });
    var decrypted = CryptoJS.AES.decrypt(
            cipherParams,
            key,
            {iv: CryptoJS.enc.Hex.parse(iv)});
    return decrypted.toString(CryptoJS.enc.Hex.stringify(decrypted));
}
AesUtil.prototype.decrypt = function (salt, iv, passPhrase, cipherText) {
    var key = this.generateKey(salt, passPhrase);
    var cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Base64.parse(cipherText)
    });
    var decrypted = CryptoJS.AES.decrypt(
            cipherParams,
            key,
            {iv: CryptoJS.enc.Hex.parse(iv)});
    return decrypted.toString(CryptoJS.enc.Utf8);
}
var cryptor = {
//   service_url: '/ing_test/cryptor',
    encrypt: function (plainMsg, keyStr, callback) {

        var iv = "00000000000000000000000000000000";
        var salt = "00000000000000000000000000000000";
        var keySize = 256;
        var iterationCount = 100;
        // var passPhrase = "aesalgoisbestbes";
        var passPhrase = keyStr;//"decimalsecretkey";
        var aesUtil = new AesUtil(keySize, iterationCount);
        var encrypt = aesUtil.encrypt(salt, iv, passPhrase, plainMsg);
        callback(encrypt);
    },
    decrypt: function (cipherMsg, keyStr, callback) {
        /* $.post('/ing_test/cryptor','msg='+cipherMsg+'&action=DEC', function(response)
         {
         // alert(response);
         callback(response);
         });  */
        var iv = "00000000000000000000000000000000";
        var salt = "00000000000000000000000000000000";
        var keySize = 256;
        var iterationCount = 100;
        var passPhrase = keyStr;//"decimalsecretkey";
        var aesUtil = new AesUtil(keySize, iterationCount);
        var decrypt = aesUtil.decrypt(salt, iv, passPhrase, cipherMsg);
        callback(decrypt);
    },
    encryptText: function (plainMsg, keyStr, callback) {

        var iv = "00000000000000000000000000000000";
        var salt = "00000000000000000000000000000000";
        var keySize = 256;
        var iterationCount = 100;
        // var passPhrase = "aesalgoisbestbes";
        var passPhrase = keyStr;//"decimalsecretkey";
        var aesUtil = new AesUtil(keySize, iterationCount);
        var encrypt = aesUtil.encrypt(salt, iv, passPhrase, plainMsg);
        //callback(encrypt);
        return encrypt;
    },
    decryptText: function (cipherMsg, keyStr, callback) {
        /* $.post('/ing_test/cryptor','msg='+cipherMsg+'&action=DEC', function(response)
         {
         // alert(response);
         callback(response);
         });  */
        var iv = "00000000000000000000000000000000";
        var salt = "00000000000000000000000000000000";
        var keySize = 256;
        var iterationCount = 100;
        var passPhrase = keyStr;//"decimalsecretkey";
        var aesUtil = new AesUtil(keySize, iterationCount);
        var decrypt = aesUtil.decrypt(salt, iv, passPhrase, cipherMsg);
        //callback(decrypt);
        return decrypt;
    },
    decryptHex: function (cipherMsg, keyStr, callback) {
        /* $.post('/ing_test/cryptor','msg='+cipherMsg+'&action=DEC', function(response)
         {
         // alert(response);
         callback(response);
         });  */
        var iv = "00000000000000000000000000000000";
        var salt = "00000000000000000000000000000000";
        var keySize = 256;
        var iterationCount = 100;
        var passPhrase = keyStr;//"decimalsecretkey";
        var aesUtil = new AesUtil(keySize, iterationCount);
        var decrypt = aesUtil.decryptHex(salt, iv, passPhrase, cipherMsg);
        callback(decrypt);
    },
    hex: function (strin) {
        var string='kunwar';
        var hexStr = CryptoJS.enc.Hex.parse(string);
        console.log()
        return hexStr;
    }

}

module.exports = {
    AesUtil,
    cryptor
}
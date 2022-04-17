"use strict";
exports.__esModule = true;
exports.hkdf = exports.sha256 = exports.hmacSign = exports.aesEncrypWithIV = exports.aesEncrypt = exports.aesDecryptWithIV = exports.aesDecrypt = exports.signedKeyPair = exports.Curve = void 0;
var crypto_1 = require("crypto");
var curveJs = require("curve25519-js");
exports.Curve = {
    generateKeyPair: function () {
        var _a = curveJs.generateKeyPair((0, crypto_1.randomBytes)(32)), pubKey = _a.public, privKey = _a.private;
        return {
            private: Buffer.from(privKey),
            public: Buffer.from(pubKey)
        };
    },
    sharedKey: function (privateKey, publicKey) {
        var shared = curveJs.sharedKey(privateKey, publicKey);
        return Buffer.from(shared);
    },
    sign: function (privateKey, buf) { return (Buffer.from(curveJs.sign(privateKey, buf, null))); },
    verify: function (pubKey, message, signature) {
        return curveJs.verify(pubKey, message, signature);
    }
};
var signedKeyPair = function (keyPair, keyId) {
    var signKeys = exports.Curve.generateKeyPair();
    var pubKey = new Uint8Array(33);
    pubKey.set([5], 0);
    pubKey.set(signKeys.public, 1);
    var signature = exports.Curve.sign(keyPair.private, pubKey);
    return { keyPair: signKeys, signature: signature, keyId: keyId };
};
exports.signedKeyPair = signedKeyPair;
/** decrypt AES 256 CBC; where the IV is prefixed to the buffer */
function aesDecrypt(buffer, key) {
    return aesDecryptWithIV(buffer.slice(16, buffer.length), key, buffer.slice(0, 16));
}
exports.aesDecrypt = aesDecrypt;
/** decrypt AES 256 CBC */
function aesDecryptWithIV(buffer, key, IV) {
    var aes = (0, crypto_1.createDecipheriv)('aes-256-cbc', key, IV);
    return Buffer.concat([aes.update(buffer), aes.final()]);
}
exports.aesDecryptWithIV = aesDecryptWithIV;
// encrypt AES 256 CBC; where a random IV is prefixed to the buffer
function aesEncrypt(buffer, key) {
    var IV = (0, crypto_1.randomBytes)(16);
    var aes = (0, crypto_1.createCipheriv)('aes-256-cbc', key, IV);
    return Buffer.concat([IV, aes.update(buffer), aes.final()]); // prefix IV to the buffer
}
exports.aesEncrypt = aesEncrypt;
// encrypt AES 256 CBC with a given IV
function aesEncrypWithIV(buffer, key, IV) {
    var aes = (0, crypto_1.createCipheriv)('aes-256-cbc', key, IV);
    return Buffer.concat([aes.update(buffer), aes.final()]); // prefix IV to the buffer
}
exports.aesEncrypWithIV = aesEncrypWithIV;
// sign HMAC using SHA 256
function hmacSign(buffer, key, variant) {
    if (variant === void 0) { variant = 'sha256'; }
    return (0, crypto_1.createHmac)(variant, key).update(buffer).digest();
}
exports.hmacSign = hmacSign;
function sha256(buffer) {
    return (0, crypto_1.createHash)('sha256').update(buffer).digest();
}
exports.sha256 = sha256;
// HKDF key expansion
// from: https://github.com/benadida/node-hkdf
function hkdf(buffer, expandedLength, _a) {
    var info = _a.info, salt = _a.salt;
    var hashAlg = 'sha256';
    var hashLength = 32;
    salt = salt || Buffer.alloc(hashLength);
    // now we compute the PRK
    var prk = (0, crypto_1.createHmac)(hashAlg, salt).update(buffer).digest();
    var prev = Buffer.from([]);
    var buffers = [];
    var num_blocks = Math.ceil(expandedLength / hashLength);
    var infoBuff = Buffer.from(info || []);
    for (var i = 0; i < num_blocks; i++) {
        var hmac = (0, crypto_1.createHmac)(hashAlg, prk);
        // XXX is there a more optimal way to build up buffers?
        var input = Buffer.concat([
            prev,
            infoBuff,
            Buffer.from(String.fromCharCode(i + 1))
        ]);
        hmac.update(input);
        prev = hmac.digest();
        buffers.push(prev);
    }
    return Buffer.concat(buffers, expandedLength);
}
exports.hkdf = hkdf;

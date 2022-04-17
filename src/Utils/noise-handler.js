"use strict";
exports.__esModule = true;
exports.makeNoiseHandler = void 0;
var boom_1 = require("@hapi/boom");
var crypto_1 = require("crypto");
var WAProto_1 = require("../../WAProto");
var Defaults_1 = require("../Defaults");
var WABinary_1 = require("../WABinary");
var WABinary_2 = require("../WABinary");
var crypto_2 = require("./crypto");
var generateIV = function (counter) {
    var iv = new ArrayBuffer(12);
    new DataView(iv).setUint32(8, counter);
    return new Uint8Array(iv);
};
var makeNoiseHandler = function (_a) {
    var publicKey = _a.public, privateKey = _a.private;
    var authenticate = function (data) {
        if (!isFinished) {
            hash = (0, crypto_2.sha256)(Buffer.concat([hash, data]));
        }
    };
    var encrypt = function (plaintext) {
        var authTagLength = 128 >> 3;
        var cipher = (0, crypto_1.createCipheriv)('aes-256-gcm', encKey, generateIV(writeCounter), { authTagLength: authTagLength });
        cipher.setAAD(hash);
        var result = Buffer.concat([cipher.update(plaintext), cipher.final(), cipher.getAuthTag()]);
        writeCounter += 1;
        authenticate(result);
        return result;
    };
    var decrypt = function (ciphertext) {
        // before the handshake is finished, we use the same counter
        // after handshake, the counters are different
        var iv = generateIV(isFinished ? readCounter : writeCounter);
        var cipher = (0, crypto_1.createDecipheriv)('aes-256-gcm', decKey, iv);
        // decrypt additional adata
        var tagLength = 128 >> 3;
        var enc = ciphertext.slice(0, ciphertext.length - tagLength);
        var tag = ciphertext.slice(ciphertext.length - tagLength);
        // set additional data
        cipher.setAAD(hash);
        cipher.setAuthTag(tag);
        var result = Buffer.concat([cipher.update(enc), cipher.final()]);
        if (isFinished) {
            readCounter += 1;
        }
        else {
            writeCounter += 1;
        }
        authenticate(ciphertext);
        return result;
    };
    var localHKDF = function (data) {
        var key = (0, crypto_2.hkdf)(Buffer.from(data), 64, { salt: salt, info: '' });
        return [key.slice(0, 32), key.slice(32)];
    };
    var mixIntoKey = function (data) {
        var _a = localHKDF(data), write = _a[0], read = _a[1];
        salt = write;
        encKey = read;
        decKey = read;
        readCounter = 0;
        writeCounter = 0;
    };
    var finishInit = function () {
        var _a = localHKDF(new Uint8Array(0)), write = _a[0], read = _a[1];
        encKey = write;
        decKey = read;
        hash = Buffer.from([]);
        readCounter = 0;
        writeCounter = 0;
        isFinished = true;
    };
    var data = Buffer.from(Defaults_1.NOISE_MODE);
    var hash = Buffer.from(data.byteLength === 32 ? data : (0, crypto_2.sha256)(Buffer.from(data)));
    var salt = hash;
    var encKey = hash;
    var decKey = hash;
    var readCounter = 0;
    var writeCounter = 0;
    var isFinished = false;
    var sentIntro = false;
    var outBinary = new WABinary_1.Binary();
    var inBinary = new WABinary_1.Binary();
    authenticate(Defaults_1.NOISE_WA_HEADER);
    authenticate(publicKey);
    return {
        encrypt: encrypt,
        decrypt: decrypt,
        authenticate: authenticate,
        mixIntoKey: mixIntoKey,
        finishInit: finishInit,
        processHandshake: function (_a, noiseKey) {
            var serverHello = _a.serverHello;
            authenticate(serverHello.ephemeral);
            mixIntoKey(crypto_2.Curve.sharedKey(privateKey, serverHello.ephemeral));
            var decStaticContent = decrypt(serverHello.static);
            mixIntoKey(crypto_2.Curve.sharedKey(privateKey, decStaticContent));
            var certDecoded = decrypt(serverHello.payload);
            var _b = WAProto_1.proto.NoiseCertificate.decode(certDecoded), certDetails = _b.details, certSignature = _b.signature;
            var certKey = WAProto_1.proto.NoiseCertificateDetails.decode(certDetails).key;
            if (Buffer.compare(decStaticContent, certKey) !== 0) {
                throw new boom_1.Boom('certification match failed', { statusCode: 400 });
            }
            var keyEnc = encrypt(noiseKey.public);
            mixIntoKey(crypto_2.Curve.sharedKey(noiseKey.private, serverHello.ephemeral));
            return keyEnc;
        },
        encodeFrame: function (data) {
            if (isFinished) {
                data = encrypt(data);
            }
            var introSize = sentIntro ? 0 : Defaults_1.NOISE_WA_HEADER.length;
            outBinary.ensureAdditionalCapacity(introSize + 3 + data.byteLength);
            if (!sentIntro) {
                outBinary.writeByteArray(Defaults_1.NOISE_WA_HEADER);
                sentIntro = true;
            }
            outBinary.writeUint8(data.byteLength >> 16);
            outBinary.writeUint16(65535 & data.byteLength);
            outBinary.write(data);
            var bytes = outBinary.readByteArray();
            return bytes;
        },
        decodeFrame: function (newData, onFrame) {
            // the binary protocol uses its own framing mechanism
            // on top of the WS frames
            // so we get this data and separate out the frames
            var getBytesSize = function () {
                return (inBinary.readUint8() << 16) | inBinary.readUint16();
            };
            var peekSize = function () {
                return !(inBinary.size() < 3) && getBytesSize() <= inBinary.size();
            };
            inBinary.writeByteArray(newData);
            while (inBinary.peek(peekSize)) {
                var bytes = getBytesSize();
                var frame = inBinary.readByteArray(bytes);
                if (isFinished) {
                    var result = decrypt(frame);
                    var unpacked = new WABinary_1.Binary(result).decompressed();
                    frame = (0, WABinary_2.decodeBinaryNode)(unpacked);
                }
                onFrame(frame);
            }
            inBinary.peek(peekSize);
        }
    };
};
exports.makeNoiseHandler = makeNoiseHandler;

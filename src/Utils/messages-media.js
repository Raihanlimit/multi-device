"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
exports.__esModule = true;
exports.getWAUploadToServer = exports.extensionForMediaMessage = exports.downloadContentFromMessage = exports.encryptedStream = exports.getGotStream = exports.generateThumbnail = exports.getStream = exports.toBuffer = exports.toReadable = exports.getAudioDuration = exports.mediaMessageSHA256B64 = exports.generateProfilePicture = exports.extractImageThumb = exports.getMediaKeys = exports.hkdfInfoKey = void 0;
var boom_1 = require("@hapi/boom");
var child_process_1 = require("child_process");
var Crypto = require("crypto");
var events_1 = require("events");
var fs_1 = require("fs");
var os_1 = require("os");
var path_1 = require("path");
var stream_1 = require("stream");
var Defaults_1 = require("../Defaults");
var crypto_1 = require("./crypto");
var generics_1 = require("./generics");
var getTmpFilesDirectory = function () { return (0, os_1.tmpdir)(); };
var getImageProcessingLibrary = function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, jimp, sharp;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, Promise.all([
                    (function () { return __awaiter(void 0, void 0, void 0, function () {
                        var jimp;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, (Promise.resolve().then(function () { return require('jimp'); })["catch"](function () { }))];
                                case 1:
                                    jimp = _a.sent();
                                    return [2 /*return*/, jimp];
                            }
                        });
                    }); })(),
                    (function () { return __awaiter(void 0, void 0, void 0, function () {
                        var sharp;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, (Promise.resolve().then(function () { return require('sharp'); })["catch"](function () { }))];
                                case 1:
                                    sharp = _a.sent();
                                    return [2 /*return*/, sharp];
                            }
                        });
                    }); })()
                ])];
            case 1:
                _a = _b.sent(), jimp = _a[0], sharp = _a[1];
                if (sharp) {
                    return [2 /*return*/, { sharp: sharp }];
                }
                if (jimp) {
                    return [2 /*return*/, { jimp: jimp }];
                }
                throw new boom_1.Boom('No image processing library available');
        }
    });
}); };
var hkdfInfoKey = function (type) {
    var str = type;
    if (type === 'sticker') {
        str = 'image';
    }
    if (type === 'md-app-state') {
        str = 'App State';
    }
    var hkdfInfo = str[0].toUpperCase() + str.slice(1);
    return "WhatsApp ".concat(hkdfInfo, " Keys");
};
exports.hkdfInfoKey = hkdfInfoKey;
/** generates all the keys required to encrypt/decrypt & sign a media message */
function getMediaKeys(buffer, mediaType) {
    if (typeof buffer === 'string') {
        buffer = Buffer.from(buffer.replace('data:;base64,', ''), 'base64');
    }
    // expand using HKDF to 112 bytes, also pass in the relevant app info
    var expandedMediaKey = (0, crypto_1.hkdf)(buffer, 112, { info: (0, exports.hkdfInfoKey)(mediaType) });
    return {
        iv: expandedMediaKey.slice(0, 16),
        cipherKey: expandedMediaKey.slice(16, 48),
        macKey: expandedMediaKey.slice(48, 80)
    };
}
exports.getMediaKeys = getMediaKeys;
/** Extracts video thumb using FFMPEG */
var extractVideoThumb = function (path, destPath, time, size) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                var cmd = "ffmpeg -ss ".concat(time, " -i ").concat(path, " -y -vf scale=").concat(size.width, ":-1 -vframes 1 -f image2 ").concat(destPath);
                (0, child_process_1.exec)(cmd, function (err) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            })];
    });
}); };
var extractImageThumb = function (bufferOrFilePath) { return __awaiter(void 0, void 0, void 0, function () {
    var lib, result, _a, read, MIME_JPEG, RESIZE_BILINEAR, AUTO, jimp, result;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!(bufferOrFilePath instanceof stream_1.Readable)) return [3 /*break*/, 2];
                return [4 /*yield*/, (0, exports.toBuffer)(bufferOrFilePath)];
            case 1:
                bufferOrFilePath = _b.sent();
                _b.label = 2;
            case 2: return [4 /*yield*/, getImageProcessingLibrary()];
            case 3:
                lib = _b.sent();
                if (!('sharp' in lib)) return [3 /*break*/, 5];
                return [4 /*yield*/, lib.sharp["default"](bufferOrFilePath)
                        .resize(32)
                        .jpeg({ quality: 50 })
                        .toBuffer()];
            case 4:
                result = _b.sent();
                return [2 /*return*/, result];
            case 5:
                _a = lib.jimp, read = _a.read, MIME_JPEG = _a.MIME_JPEG, RESIZE_BILINEAR = _a.RESIZE_BILINEAR, AUTO = _a.AUTO;
                return [4 /*yield*/, read(bufferOrFilePath)];
            case 6:
                jimp = _b.sent();
                return [4 /*yield*/, jimp
                        .quality(50)
                        .resize(32, AUTO, RESIZE_BILINEAR)
                        .getBufferAsync(MIME_JPEG)];
            case 7:
                result = _b.sent();
                return [2 /*return*/, result];
        }
    });
}); };
exports.extractImageThumb = extractImageThumb;
var generateProfilePicture = function (mediaUpload) { return __awaiter(void 0, void 0, void 0, function () {
    var bufferOrFilePath, lib, img, _a, read, MIME_JPEG, RESIZE_BILINEAR, jimp, min, cropped;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                if (!Buffer.isBuffer(mediaUpload)) return [3 /*break*/, 1];
                bufferOrFilePath = mediaUpload;
                return [3 /*break*/, 4];
            case 1:
                if (!('url' in mediaUpload)) return [3 /*break*/, 2];
                bufferOrFilePath = mediaUpload.url.toString();
                return [3 /*break*/, 4];
            case 2: return [4 /*yield*/, (0, exports.toBuffer)(mediaUpload.stream)];
            case 3:
                bufferOrFilePath = _c.sent();
                _c.label = 4;
            case 4: return [4 /*yield*/, getImageProcessingLibrary()];
            case 5:
                lib = _c.sent();
                if (!('sharp' in lib)) return [3 /*break*/, 6];
                img = lib.sharp["default"](bufferOrFilePath)
                    .resize(640, 640)
                    .jpeg({
                    quality: 50
                })
                    .toBuffer();
                return [3 /*break*/, 8];
            case 6:
                _a = lib.jimp, read = _a.read, MIME_JPEG = _a.MIME_JPEG, RESIZE_BILINEAR = _a.RESIZE_BILINEAR;
                return [4 /*yield*/, read(bufferOrFilePath)];
            case 7:
                jimp = _c.sent();
                min = Math.min(jimp.getWidth(), jimp.getHeight());
                cropped = jimp.crop(0, 0, min, min);
                img = cropped
                    .quality(50)
                    .resize(640, 640, RESIZE_BILINEAR)
                    .getBufferAsync(MIME_JPEG);
                _c.label = 8;
            case 8:
                _b = {};
                return [4 /*yield*/, img];
            case 9: return [2 /*return*/, (_b.img = _c.sent(),
                    _b)];
        }
    });
}); };
exports.generateProfilePicture = generateProfilePicture;
/** gets the SHA256 of the given media message */
var mediaMessageSHA256B64 = function (message) {
    var media = Object.values(message)[0];
    return (media === null || media === void 0 ? void 0 : media.fileSha256) && Buffer.from(media.fileSha256).toString('base64');
};
exports.mediaMessageSHA256B64 = mediaMessageSHA256B64;
function getAudioDuration(buffer) {
    return __awaiter(this, void 0, void 0, function () {
        var musicMetadata, metadata, rStream;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('music-metadata'); })];
                case 1:
                    musicMetadata = _a.sent();
                    if (!Buffer.isBuffer(buffer)) return [3 /*break*/, 3];
                    return [4 /*yield*/, musicMetadata.parseBuffer(buffer, null, { duration: true })];
                case 2:
                    metadata = _a.sent();
                    return [3 /*break*/, 7];
                case 3:
                    if (!(typeof buffer === 'string')) return [3 /*break*/, 5];
                    rStream = (0, fs_1.createReadStream)(buffer);
                    return [4 /*yield*/, musicMetadata.parseStream(rStream, null, { duration: true })];
                case 4:
                    metadata = _a.sent();
                    rStream.close();
                    return [3 /*break*/, 7];
                case 5: return [4 /*yield*/, musicMetadata.parseStream(buffer, null, { duration: true })];
                case 6:
                    metadata = _a.sent();
                    _a.label = 7;
                case 7: return [2 /*return*/, metadata.format.duration];
            }
        });
    });
}
exports.getAudioDuration = getAudioDuration;
var toReadable = function (buffer) {
    var readable = new stream_1.Readable({ read: function () { } });
    readable.push(buffer);
    readable.push(null);
    return readable;
};
exports.toReadable = toReadable;
var toBuffer = function (stream) { var stream_2, stream_2_1; return __awaiter(void 0, void 0, void 0, function () {
    var buff, chunk, e_1_1;
    var e_1, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                buff = Buffer.alloc(0);
                _b.label = 1;
            case 1:
                _b.trys.push([1, 6, 7, 12]);
                stream_2 = __asyncValues(stream);
                _b.label = 2;
            case 2: return [4 /*yield*/, stream_2.next()];
            case 3:
                if (!(stream_2_1 = _b.sent(), !stream_2_1.done)) return [3 /*break*/, 5];
                chunk = stream_2_1.value;
                buff = Buffer.concat([buff, chunk]);
                _b.label = 4;
            case 4: return [3 /*break*/, 2];
            case 5: return [3 /*break*/, 12];
            case 6:
                e_1_1 = _b.sent();
                e_1 = { error: e_1_1 };
                return [3 /*break*/, 12];
            case 7:
                _b.trys.push([7, , 10, 11]);
                if (!(stream_2_1 && !stream_2_1.done && (_a = stream_2["return"]))) return [3 /*break*/, 9];
                return [4 /*yield*/, _a.call(stream_2)];
            case 8:
                _b.sent();
                _b.label = 9;
            case 9: return [3 /*break*/, 11];
            case 10:
                if (e_1) throw e_1.error;
                return [7 /*endfinally*/];
            case 11: return [7 /*endfinally*/];
            case 12: return [2 /*return*/, buff];
        }
    });
}); };
exports.toBuffer = toBuffer;
var getStream = function (item) { return __awaiter(void 0, void 0, void 0, function () {
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (Buffer.isBuffer(item)) {
                    return [2 /*return*/, { stream: (0, exports.toReadable)(item), type: 'buffer' }];
                }
                if ('stream' in item) {
                    return [2 /*return*/, { stream: item.stream, type: 'readable' }];
                }
                if (!(item.url.toString().startsWith('http://') || item.url.toString().startsWith('https://'))) return [3 /*break*/, 2];
                _a = {};
                return [4 /*yield*/, (0, exports.getGotStream)(item.url)];
            case 1: 
            // return { stream: await getHttpStream(item.url), type: 'remote' }
            return [2 /*return*/, (_a.stream = _b.sent(), _a.type = 'remote', _a)];
            case 2: return [2 /*return*/, { stream: (0, fs_1.createReadStream)(item.url), type: 'file' }];
        }
    });
}); };
exports.getStream = getStream;
/** generates a thumbnail for a given media, if required */
function generateThumbnail(file, mediaType, options) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var thumbnail, buff, imgFilename, buff, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(mediaType === 'image')) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, exports.extractImageThumb)(file)];
                case 1:
                    buff = _b.sent();
                    thumbnail = buff.toString('base64');
                    return [3 /*break*/, 8];
                case 2:
                    if (!(mediaType === 'video')) return [3 /*break*/, 8];
                    imgFilename = (0, path_1.join)(getTmpFilesDirectory(), (0, generics_1.generateMessageID)() + '.jpg');
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 7, , 8]);
                    return [4 /*yield*/, extractVideoThumb(file, imgFilename, '00:00:00', { width: 32, height: 32 })];
                case 4:
                    _b.sent();
                    return [4 /*yield*/, fs_1.promises.readFile(imgFilename)];
                case 5:
                    buff = _b.sent();
                    thumbnail = buff.toString('base64');
                    return [4 /*yield*/, fs_1.promises.unlink(imgFilename)];
                case 6:
                    _b.sent();
                    return [3 /*break*/, 8];
                case 7:
                    err_1 = _b.sent();
                    (_a = options.logger) === null || _a === void 0 ? void 0 : _a.debug('could not generate video thumb: ' + err_1);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/, thumbnail];
            }
        });
    });
}
exports.generateThumbnail = generateThumbnail;
var getGotStream = function (url, options) {
    if (options === void 0) { options = {}; }
    return __awaiter(void 0, void 0, void 0, function () {
        var gotStream, fetched;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('got'); })];
                case 1:
                    gotStream = (_a.sent())["default"].stream;
                    fetched = gotStream(url, __assign(__assign({}, options), { isStream: true }));
                    return [4 /*yield*/, new Promise(function (resolve, reject) {
                            fetched.once('error', reject);
                            fetched.once('response', function (_a) {
                                var statusCode = _a.statusCode;
                                if (statusCode >= 400) {
                                    reject(new boom_1.Boom('Invalid code (' + statusCode + ') returned', { statusCode: statusCode }));
                                }
                                else {
                                    resolve(undefined);
                                }
                            });
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/, fetched];
            }
        });
    });
};
exports.getGotStream = getGotStream;
var encryptedStream = function (media, mediaType, saveOriginalFileIfRequired, logger) {
    if (saveOriginalFileIfRequired === void 0) { saveOriginalFileIfRequired = true; }
    return __awaiter(void 0, void 0, void 0, function () {
        var _a, stream, type, mediaKey, _b, cipherKey, iv, macKey, encWriteStream, bodyPath, writeStream, didSaveToTmpPath, fileLength, aes, hmac, sha256Plain, sha256Enc, onChunk, stream_3, stream_3_1, data, e_2_1, mac, fileSha256, fileEncSha256, error_1;
        var e_2, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, (0, exports.getStream)(media)];
                case 1:
                    _a = _d.sent(), stream = _a.stream, type = _a.type;
                    logger === null || logger === void 0 ? void 0 : logger.debug('fetched media stream');
                    mediaKey = Crypto.randomBytes(32);
                    _b = getMediaKeys(mediaKey, mediaType), cipherKey = _b.cipherKey, iv = _b.iv, macKey = _b.macKey;
                    encWriteStream = new stream_1.Readable({ read: function () { } });
                    didSaveToTmpPath = false;
                    if (type === 'file') {
                        bodyPath = media.url;
                    }
                    else if (saveOriginalFileIfRequired) {
                        bodyPath = (0, path_1.join)(getTmpFilesDirectory(), mediaType + (0, generics_1.generateMessageID)());
                        writeStream = (0, fs_1.createWriteStream)(bodyPath);
                        didSaveToTmpPath = true;
                    }
                    fileLength = 0;
                    aes = Crypto.createCipheriv('aes-256-cbc', cipherKey, iv);
                    hmac = Crypto.createHmac('sha256', macKey).update(iv);
                    sha256Plain = Crypto.createHash('sha256');
                    sha256Enc = Crypto.createHash('sha256');
                    onChunk = function (buff) {
                        sha256Enc = sha256Enc.update(buff);
                        hmac = hmac.update(buff);
                        encWriteStream.push(buff);
                    };
                    _d.label = 2;
                case 2:
                    _d.trys.push([2, 17, , 18]);
                    _d.label = 3;
                case 3:
                    _d.trys.push([3, 10, 11, 16]);
                    stream_3 = __asyncValues(stream);
                    _d.label = 4;
                case 4: return [4 /*yield*/, stream_3.next()];
                case 5:
                    if (!(stream_3_1 = _d.sent(), !stream_3_1.done)) return [3 /*break*/, 9];
                    data = stream_3_1.value;
                    fileLength += data.length;
                    sha256Plain = sha256Plain.update(data);
                    if (!writeStream) return [3 /*break*/, 7];
                    if (!!writeStream.write(data)) return [3 /*break*/, 7];
                    return [4 /*yield*/, (0, events_1.once)(writeStream, 'drain')];
                case 6:
                    _d.sent();
                    _d.label = 7;
                case 7:
                    onChunk(aes.update(data));
                    _d.label = 8;
                case 8: return [3 /*break*/, 4];
                case 9: return [3 /*break*/, 16];
                case 10:
                    e_2_1 = _d.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 16];
                case 11:
                    _d.trys.push([11, , 14, 15]);
                    if (!(stream_3_1 && !stream_3_1.done && (_c = stream_3["return"]))) return [3 /*break*/, 13];
                    return [4 /*yield*/, _c.call(stream_3)];
                case 12:
                    _d.sent();
                    _d.label = 13;
                case 13: return [3 /*break*/, 15];
                case 14:
                    if (e_2) throw e_2.error;
                    return [7 /*endfinally*/];
                case 15: return [7 /*endfinally*/];
                case 16:
                    onChunk(aes.final());
                    mac = hmac.digest().slice(0, 10);
                    sha256Enc = sha256Enc.update(mac);
                    fileSha256 = sha256Plain.digest();
                    fileEncSha256 = sha256Enc.digest();
                    encWriteStream.push(mac);
                    encWriteStream.push(null);
                    writeStream && writeStream.end();
                    stream.destroy();
                    logger === null || logger === void 0 ? void 0 : logger.debug('encrypted data successfully');
                    return [2 /*return*/, {
                            mediaKey: mediaKey,
                            encWriteStream: encWriteStream,
                            bodyPath: bodyPath,
                            mac: mac,
                            fileEncSha256: fileEncSha256,
                            fileSha256: fileSha256,
                            fileLength: fileLength,
                            didSaveToTmpPath: didSaveToTmpPath
                        }];
                case 17:
                    error_1 = _d.sent();
                    encWriteStream.destroy(error_1);
                    writeStream.destroy(error_1);
                    aes.destroy(error_1);
                    hmac.destroy(error_1);
                    sha256Plain.destroy(error_1);
                    sha256Enc.destroy(error_1);
                    stream.destroy(error_1);
                    throw error_1;
                case 18: return [2 /*return*/];
            }
        });
    });
};
exports.encryptedStream = encryptedStream;
var DEF_HOST = 'mmg.whatsapp.net';
var AES_CHUNK_SIZE = 16;
var toSmallestChunkSize = function (num) {
    return Math.floor(num / AES_CHUNK_SIZE) * AES_CHUNK_SIZE;
};
var downloadContentFromMessage = function (_a, type, _b) {
    var mediaKey = _a.mediaKey, directPath = _a.directPath, url = _a.url;
    var _c = _b === void 0 ? {} : _b, startByte = _c.startByte, endByte = _c.endByte;
    return __awaiter(void 0, void 0, void 0, function () {
        var downloadUrl, bytesFetched, startChunk, firstBlockIsIV, chunk, endChunk, headers, fetched, remainingBytes, _d, cipherKey, iv, aes, pushBytes, output;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    downloadUrl = url || "https://".concat(DEF_HOST).concat(directPath);
                    bytesFetched = 0;
                    startChunk = 0;
                    firstBlockIsIV = false;
                    // if a start byte is specified -- then we need to fetch the previous chunk as that will form the IV
                    if (startByte) {
                        chunk = toSmallestChunkSize(startByte || 0);
                        if (chunk) {
                            startChunk = chunk - AES_CHUNK_SIZE;
                            bytesFetched = chunk;
                            firstBlockIsIV = true;
                        }
                    }
                    endChunk = endByte ? toSmallestChunkSize(endByte || 0) + AES_CHUNK_SIZE : undefined;
                    headers = {
                        Origin: Defaults_1.DEFAULT_ORIGIN
                    };
                    if (startChunk || endChunk) {
                        headers.Range = "bytes=".concat(startChunk, "-");
                        if (endChunk) {
                            headers.Range += endChunk;
                        }
                    }
                    return [4 /*yield*/, getHttpStream(downloadUrl, {
                            headers: headers,
                            maxBodyLength: Infinity,
                            maxContentLength: Infinity
                        })];
                case 1:
                    fetched = _e.sent();
                    remainingBytes = Buffer.from([]);
                    _d = getMediaKeys(mediaKey, type), cipherKey = _d.cipherKey, iv = _d.iv;
                    pushBytes = function (bytes, push) {
                        if (startByte || endByte) {
                            var start = bytesFetched >= startByte ? undefined : Math.max(startByte - bytesFetched, 0);
                            var end = bytesFetched + bytes.length < endByte ? undefined : Math.max(endByte - bytesFetched, 0);
                            push(bytes.slice(start, end));
                            bytesFetched += bytes.length;
                        }
                        else {
                            push(bytes);
                        }
                    };
                    output = new stream_1.Transform({
                        transform: function (chunk, _, callback) {
                            var _this = this;
                            var data = Buffer.concat([remainingBytes, chunk]);
                            var decryptLength = toSmallestChunkSize(data.length);
                            remainingBytes = data.slice(decryptLength);
                            data = data.slice(0, decryptLength);
                            if (!aes) {
                                var ivValue = iv;
                                if (firstBlockIsIV) {
                                    ivValue = data.slice(0, AES_CHUNK_SIZE);
                                    data = data.slice(AES_CHUNK_SIZE);
                                }
                                aes = Crypto.createDecipheriv('aes-256-cbc', cipherKey, ivValue);
                                // if an end byte that is not EOF is specified
                                // stop auto padding (PKCS7) -- otherwise throws an error for decryption
                                if (endByte) {
                                    aes.setAutoPadding(false);
                                }
                            }
                            try {
                                pushBytes(aes.update(data), function (b) { return _this.push(b); });
                                callback();
                            }
                            catch (error) {
                                callback(error);
                            }
                        },
                        final: function (callback) {
                            var _this = this;
                            try {
                                pushBytes(aes.final(), function (b) { return _this.push(b); });
                                callback();
                            }
                            catch (error) {
                                callback(error);
                            }
                        }
                    });
                    return [2 /*return*/, fetched.pipe(output, { end: true })];
            }
        });
    });
};
exports.downloadContentFromMessage = downloadContentFromMessage;
function extensionForMediaMessage(message) {
    var getExtension = function (mimetype) { return mimetype.split(';')[0].split('/')[1]; };
    var type = Object.keys(message)[0];
    var extension;
    if (type === 'locationMessage' ||
        type === 'liveLocationMessage' ||
        type === 'productMessage') {
        extension = '.jpeg';
    }
    else {
        var messageContent = message[type];
        extension = getExtension(messageContent.mimetype);
    }
    return extension;
}
exports.extensionForMediaMessage = extensionForMediaMessage;
var getWAUploadToServer = function (_a, refreshMediaConn) {
    var customUploadHosts = _a.customUploadHosts, fetchAgent = _a.fetchAgent, logger = _a.logger;
    return function (stream, _a) {
        var mediaType = _a.mediaType, fileEncSha256B64 = _a.fileEncSha256B64, timeoutMs = _a.timeoutMs;
        return __awaiter(void 0, void 0, void 0, function () {
            var got, uploadInfo, url, responseText, result, error_2, isLast;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('got'); })];
                    case 1:
                        got = (_b.sent())["default"];
                        return [4 /*yield*/, refreshMediaConn(false)];
                    case 2:
                        uploadInfo = _b.sent();
                        url = "https://".concat(hostname).concat(Defaults_1.MEDIA_PATH_MAP[mediaType], "/").concat(fileEncSha256B64, "?auth=").concat(auth, "&token=").concat(fileEncSha256B64);
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 8, , 9]);
                        return [4 /*yield*/, got.post(url, {
                                headers: {
                                    'Content-Type': 'application/octet-stream',
                                    'Origin': Defaults_1.DEFAULT_ORIGIN
                                },
                                agent: {
                                    https: fetchAgent
                                },
                                body: stream,
                                timeout: timeoutMs
                            })];
                    case 4:
                        responseText = (_b.sent()).body;
                        result = JSON.parse(responseText);
                        if (!((result === null || result === void 0 ? void 0 : result.url) || (result === null || result === void 0 ? void 0 : result.directPath))) return [3 /*break*/, 5];
                        urls = {
                            mediaUrl: result.url,
                            directPath: result.direct_path
                        };
                        break;
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, refreshMediaConn(true)];
                    case 6:
                        uploadInfo = _b.sent();
                        throw new Error("upload failed, reason: ".concat(JSON.stringify(result)));
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        error_2 = _b.sent();
                        isLast = hostname === hosts[uploadInfo.hosts.length - 1];
                        logger.debug("Error in uploading to ".concat(hostname, " (").concat(error_2, ") ").concat(isLast ? '' : ', retrying...'));
                        return [3 /*break*/, 9];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    if (!urls) {
        throw new boom_1.Boom('Media upload failed on all hosts', { statusCode: 500 });
    }
    return urls;
};
exports.getWAUploadToServer = getWAUploadToServer;

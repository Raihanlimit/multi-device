"use strict";
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
exports.__esModule = true;
exports.getStatusFromReceiptType = exports.fetchLatestBaileysVersion = exports.printQRIfNecessaryListener = exports.bindWaitForConnectionUpdate = exports.generateMessageID = exports.promiseTimeout = exports.delayCancellable = exports.delay = exports.debouncedTimeout = exports.unixTimestampSeconds = exports.shallowChanges = exports.toNumber = exports.encodeBigEndian = exports.encodeInt = exports.generateRegistrationId = exports.encodeWAMessage = exports.unpadRandomMax16 = exports.writeRandomPadMax16 = exports.BufferJSON = exports.Browsers = void 0;
var boom_1 = require("@hapi/boom");
var axios_1 = require("axios");
var crypto_1 = require("crypto");
var os_1 = require("os");
var WAProto_1 = require("../../WAProto");
var baileys_version_json_1 = require("../Defaults/baileys-version.json");
var Types_1 = require("../Types");
var WABinary_1 = require("../WABinary");
var PLATFORM_MAP = {
    'aix': 'AIX',
    'darwin': 'Mac OS',
    'win32': 'Windows',
    'android': 'Android'
};
exports.Browsers = {
    ubuntu: function (browser) { return ['Ubuntu', browser, '20.0.04']; },
    macOS: function (browser) { return ['Mac OS', browser, '10.15.7']; },
    baileys: function (browser) { return ['Baileys', browser, '4.0.0']; },
    /** The appropriate browser based on your OS & release */
    appropriate: function (browser) { return [PLATFORM_MAP[(0, os_1.platform)()] || 'Ubuntu', browser, (0, os_1.release)()]; }
};
exports.BufferJSON = {
    replacer: function (k, value) {
        if (Buffer.isBuffer(value) || value instanceof Uint8Array || (value === null || value === void 0 ? void 0 : value.type) === 'Buffer') {
            return { type: 'Buffer', data: Buffer.from((value === null || value === void 0 ? void 0 : value.data) || value).toString('base64') };
        }
        return value;
    },
    reviver: function (_, value) {
        if (typeof value === 'object' && !!value && (value.buffer === true || value.type === 'Buffer')) {
            var val = value.data || value.value;
            return typeof val === 'string' ? Buffer.from(val, 'base64') : Buffer.from(val || []);
        }
        return value;
    }
};
var writeRandomPadMax16 = function (e) {
    function r(e, t) {
        for (var r = 0; r < t; r++) {
            e.writeUint8(t);
        }
    }
    var t = (0, crypto_1.randomBytes)(1);
    r(e, 1 + (15 & t[0]));
    return e;
};
exports.writeRandomPadMax16 = writeRandomPadMax16;
var unpadRandomMax16 = function (e) {
    var t = new Uint8Array(e);
    if (0 === t.length) {
        throw new Error('unpadPkcs7 given empty bytes');
    }
    var r = t[t.length - 1];
    if (r > t.length) {
        throw new Error("unpad given ".concat(t.length, " bytes, but pad is ").concat(r));
    }
    return new Uint8Array(t.buffer, t.byteOffset, t.length - r);
};
exports.unpadRandomMax16 = unpadRandomMax16;
var encodeWAMessage = function (message) { return (Buffer.from((0, exports.writeRandomPadMax16)(new WABinary_1.Binary(WAProto_1.proto.Message.encode(message).finish())).readByteArray())); };
exports.encodeWAMessage = encodeWAMessage;
var generateRegistrationId = function () { return (Uint16Array.from((0, crypto_1.randomBytes)(2))[0] & 0x3fff); };
exports.generateRegistrationId = generateRegistrationId;
var encodeInt = function (e, t) {
    for (var r = t, a = new Uint8Array(e), i = e - 1; i >= 0; i--) {
        a[i] = 255 & r;
        r >>>= 8;
    }
    return a;
};
exports.encodeInt = encodeInt;
var encodeBigEndian = function (e, t) {
    if (t === void 0) { t = 4; }
    var r = e;
    var a = new Uint8Array(t);
    for (var i = t - 1; i >= 0; i--) {
        a[i] = 255 & r;
        r >>>= 8;
    }
    return a;
};
exports.encodeBigEndian = encodeBigEndian;
var toNumber = function (t) { return ((typeof t === 'object' && t) ? ('toNumber' in t ? t.toNumber() : t.low) : t); };
exports.toNumber = toNumber;
function shallowChanges(old, current, _a) {
    var lookForDeletedKeys = _a.lookForDeletedKeys;
    var changes = {};
    for (var key in current) {
        if (old[key] !== current[key]) {
            changes[key] = current[key] || null;
        }
    }
    if (lookForDeletedKeys) {
        for (var key in old) {
            if (!changes[key] && old[key] !== current[key]) {
                changes[key] = current[key] || null;
            }
        }
    }
    return changes;
}
exports.shallowChanges = shallowChanges;
/** unix timestamp of a date in seconds */
var unixTimestampSeconds = function (date) {
    if (date === void 0) { date = new Date(); }
    return Math.floor(date.getTime() / 1000);
};
exports.unixTimestampSeconds = unixTimestampSeconds;
var debouncedTimeout = function (intervalMs, task) {
    if (intervalMs === void 0) { intervalMs = 1000; }
    if (task === void 0) { task = undefined; }
    var timeout;
    return {
        start: function (newIntervalMs, newTask) {
            task = newTask || task;
            intervalMs = newIntervalMs || intervalMs;
            timeout && clearTimeout(timeout);
            timeout = setTimeout(task, intervalMs);
        },
        cancel: function () {
            timeout && clearTimeout(timeout);
            timeout = undefined;
        },
        setTask: function (newTask) { return task = newTask; },
        setInterval: function (newInterval) { return intervalMs = newInterval; }
    };
};
exports.debouncedTimeout = debouncedTimeout;
var delay = function (ms) { return (0, exports.delayCancellable)(ms).delay; };
exports.delay = delay;
var delayCancellable = function (ms) {
    var stack = new Error().stack;
    var timeout;
    var reject;
    var delay = new Promise(function (resolve, _reject) {
        timeout = setTimeout(resolve, ms);
        reject = _reject;
    });
    var cancel = function () {
        clearTimeout(timeout);
        reject(new boom_1.Boom('Cancelled', {
            statusCode: 500,
            data: {
                stack: stack
            }
        }));
    };
    return { delay: delay, cancel: cancel };
};
exports.delayCancellable = delayCancellable;
function promiseTimeout(ms, promise) {
    return __awaiter(this, void 0, void 0, function () {
        var stack, _a, delay, cancel, p;
        return __generator(this, function (_b) {
            if (!ms) {
                return [2 /*return*/, new Promise(promise)];
            }
            stack = new Error().stack;
            _a = (0, exports.delayCancellable)(ms), delay = _a.delay, cancel = _a.cancel;
            p = new Promise(function (resolve, reject) {
                delay
                    .then(function () { return reject(new boom_1.Boom('Timed Out', {
                    statusCode: Types_1.DisconnectReason.timedOut,
                    data: {
                        stack: stack
                    }
                })); })["catch"](function (err) { return reject(err); });
                promise(resolve, reject);
            })["finally"](cancel);
            return [2 /*return*/, p];
        });
    });
}
exports.promiseTimeout = promiseTimeout;
// generate a random ID to attach to a message
var generateMessageID = function () { return 'BAE5' + (0, crypto_1.randomBytes)(6).toString('hex').toUpperCase(); };
exports.generateMessageID = generateMessageID;
var bindWaitForConnectionUpdate = function (ev) { return (function (check, timeoutMs) { return __awaiter(void 0, void 0, void 0, function () {
    var listener;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (promiseTimeout(timeoutMs, function (resolve, reject) {
                    listener = function (update) {
                        var _a;
                        if (check(update)) {
                            resolve();
                        }
                        else if (update.connection === 'close') {
                            reject(((_a = update.lastDisconnect) === null || _a === void 0 ? void 0 : _a.error) || new boom_1.Boom('Connection Closed', { statusCode: Types_1.DisconnectReason.connectionClosed }));
                        }
                    };
                    ev.on('connection.update', listener);
                })["finally"](function () { return (ev.off('connection.update', listener)); }))];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); }); };
exports.bindWaitForConnectionUpdate = bindWaitForConnectionUpdate;
var printQRIfNecessaryListener = function (ev, logger) {
    ev.on('connection.update', function (_a) {
        var qr = _a.qr;
        return __awaiter(void 0, void 0, void 0, function () {
            var QR;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!qr) return [3 /*break*/, 2];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('qrcode-terminal'); })["catch"](function (err) {
                                logger.error('QR code terminal not added as dependency');
                            })];
                    case 1:
                        QR = _b.sent();
                        QR === null || QR === void 0 ? void 0 : QR.generate(qr, { small: true });
                        _b.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    });
};
exports.printQRIfNecessaryListener = printQRIfNecessaryListener;
/**
 * utility that fetches latest baileys version from the master branch.
 * Use to ensure your WA connection is always on the latest version
 */
var fetchLatestBaileysVersion = function () { return __awaiter(void 0, void 0, void 0, function () {
    var URL, result, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                URL = 'https://raw.githubusercontent.com/adiwajshing/Baileys/master/src/Defaults/baileys-version.json';
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, axios_1["default"].get(URL, { responseType: 'json' })];
            case 2:
                result = _a.sent();
                return [2 /*return*/, {
                        version: result.data.version,
                        isLatest: true
                    }];
            case 3:
                error_1 = _a.sent();
                return [2 /*return*/, {
                        version: baileys_version_json_1.version,
                        isLatest: false,
                        error: error_1
                    }];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.fetchLatestBaileysVersion = fetchLatestBaileysVersion;
var STATUS_MAP = {
    'played': WAProto_1.proto.WebMessageInfo.WebMessageInfoStatus.PLAYED,
    'read': WAProto_1.proto.WebMessageInfo.WebMessageInfoStatus.READ,
    'read-self': WAProto_1.proto.WebMessageInfo.WebMessageInfoStatus.READ
};
var getStatusFromReceiptType = function (type) {
    var status = STATUS_MAP[type];
    if (typeof type === 'undefined') {
        return WAProto_1.proto.WebMessageInfo.WebMessageInfoStatus.DELIVERY_ACK;
    }
    return status;
};
exports.getStatusFromReceiptType = getStatusFromReceiptType;

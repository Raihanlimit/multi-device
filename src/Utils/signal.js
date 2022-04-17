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
exports.extractDeviceJids = exports.parseAndInjectE2ESessions = exports.encryptSenderKeyMsgSignalProto = exports.encryptSignalProto = exports.decryptSignalProto = exports.processSenderKeyMessage = exports.decryptGroupSignalProto = exports.signalStorage = exports.xmppPreKey = exports.xmppSignedPreKey = exports.generateOrGetPreKeys = exports.getPreKeys = exports.createSignalIdentity = exports.jidToSignalSenderKeyName = exports.jidToSignalProtocolAddress = exports.generateSignalPubKey = void 0;
var libsignal = require("libsignal");
var WASignalGroup_1 = require("../../WASignalGroup");
var WABinary_1 = require("../WABinary");
var crypto_1 = require("./crypto");
var generics_1 = require("./generics");
var generateSignalPubKey = function (pubKey) {
    var newPub = Buffer.alloc(33);
    newPub.set([5], 0);
    newPub.set(pubKey, 1);
    return newPub;
};
exports.generateSignalPubKey = generateSignalPubKey;
var jidToSignalAddress = function (jid) { return jid.split('@')[0]; };
var jidToSignalProtocolAddress = function (jid) {
    return new libsignal.ProtocolAddress(jidToSignalAddress(jid), 0);
};
exports.jidToSignalProtocolAddress = jidToSignalProtocolAddress;
var jidToSignalSenderKeyName = function (group, user) {
    return new WASignalGroup_1.SenderKeyName(group, (0, exports.jidToSignalProtocolAddress)(user)).toString();
};
exports.jidToSignalSenderKeyName = jidToSignalSenderKeyName;
var createSignalIdentity = function (wid, accountSignatureKey) {
    return {
        identifier: { name: wid, deviceId: 0 },
        identifierKey: (0, exports.generateSignalPubKey)(accountSignatureKey)
    };
};
exports.createSignalIdentity = createSignalIdentity;
var getPreKeys = function (_a, min, limit) {
    var get = _a.get;
    return __awaiter(void 0, void 0, void 0, function () {
        var idList, id;
        return __generator(this, function (_b) {
            idList = [];
            for (id = min; id < limit; id++) {
                idList.push(id.toString());
            }
            return [2 /*return*/, get('pre-key', idList)];
        });
    });
};
exports.getPreKeys = getPreKeys;
var generateOrGetPreKeys = function (creds, range) {
    var avaliable = creds.nextPreKeyId - creds.firstUnuploadedPreKeyId;
    var remaining = range - avaliable;
    var lastPreKeyId = creds.nextPreKeyId + remaining - 1;
    var newPreKeys = {};
    if (remaining > 0) {
        for (var i = creds.nextPreKeyId; i <= lastPreKeyId; i++) {
            newPreKeys[i] = crypto_1.Curve.generateKeyPair();
        }
    }
    return {
        newPreKeys: newPreKeys,
        lastPreKeyId: lastPreKeyId,
        preKeysRange: [creds.firstUnuploadedPreKeyId, range]
    };
};
exports.generateOrGetPreKeys = generateOrGetPreKeys;
var xmppSignedPreKey = function (key) { return ({
    tag: 'skey',
    attrs: {},
    content: [
        { tag: 'id', attrs: {}, content: (0, generics_1.encodeBigEndian)(key.keyId, 3) },
        { tag: 'value', attrs: {}, content: key.keyPair.public },
        { tag: 'signature', attrs: {}, content: key.signature }
    ]
}); };
exports.xmppSignedPreKey = xmppSignedPreKey;
var xmppPreKey = function (pair, id) { return ({
    tag: 'key',
    attrs: {},
    content: [
        { tag: 'id', attrs: {}, content: (0, generics_1.encodeBigEndian)(id, 3) },
        { tag: 'value', attrs: {}, content: pair.public }
    ]
}); };
exports.xmppPreKey = xmppPreKey;
var signalStorage = function (_a) {
    var creds = _a.creds, keys = _a.keys;
    return ({
        loadSession: function (id) { return __awaiter(void 0, void 0, void 0, function () {
            var _a, _b, sess;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, keys.get('session', [id])];
                    case 1:
                        _a = _c.sent(), _b = id, sess = _a[_b];
                        if (sess) {
                            return [2 /*return*/, libsignal.SessionRecord.deserialize(sess)];
                        }
                        return [2 /*return*/];
                }
            });
        }); },
        storeSession: function (id, session) { return __awaiter(void 0, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, keys.set({ 'session': (_a = {}, _a[id] = session.serialize(), _a) })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        isTrustedIdentity: function () {
            return true;
        },
        loadPreKey: function (id) { return __awaiter(void 0, void 0, void 0, function () {
            var keyId, _a, _b, key;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        keyId = id.toString();
                        return [4 /*yield*/, keys.get('pre-key', [keyId])];
                    case 1:
                        _a = _c.sent(), _b = keyId, key = _a[_b];
                        if (key) {
                            return [2 /*return*/, {
                                    privKey: Buffer.from(key.private),
                                    pubKey: Buffer.from(key.public)
                                }];
                        }
                        return [2 /*return*/];
                }
            });
        }); },
        removePreKey: function (id) {
            var _a;
            return keys.set({ 'pre-key': (_a = {}, _a[id] = null, _a) });
        },
        loadSignedPreKey: function (keyId) {
            var key = creds.signedPreKey;
            return {
                privKey: Buffer.from(key.keyPair.private),
                pubKey: Buffer.from(key.keyPair.public)
            };
        },
        loadSenderKey: function (keyId) { return __awaiter(void 0, void 0, void 0, function () {
            var _a, _b, key;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, keys.get('sender-key', [keyId])];
                    case 1:
                        _a = _c.sent(), _b = keyId, key = _a[_b];
                        if (key) {
                            return [2 /*return*/, new WASignalGroup_1.SenderKeyRecord(key)];
                        }
                        return [2 /*return*/];
                }
            });
        }); },
        storeSenderKey: function (keyId, key) { return __awaiter(void 0, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, keys.set({ 'sender-key': (_a = {}, _a[keyId] = key.serialize(), _a) })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        getOurRegistrationId: function () { return (creds.registrationId); },
        getOurIdentity: function () {
            var signedIdentityKey = creds.signedIdentityKey;
            return {
                privKey: Buffer.from(signedIdentityKey.private),
                pubKey: (0, exports.generateSignalPubKey)(signedIdentityKey.public)
            };
        }
    });
};
exports.signalStorage = signalStorage;
var decryptGroupSignalProto = function (group, user, msg, auth) {
    var senderName = (0, exports.jidToSignalSenderKeyName)(group, user);
    var cipher = new WASignalGroup_1.GroupCipher((0, exports.signalStorage)(auth), senderName);
    return cipher.decrypt(Buffer.from(msg));
};
exports.decryptGroupSignalProto = decryptGroupSignalProto;
var processSenderKeyMessage = function (authorJid, item, auth) { return __awaiter(void 0, void 0, void 0, function () {
    var builder, senderName, senderMsg, _a, _b, senderKey, record;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                builder = new WASignalGroup_1.GroupSessionBuilder((0, exports.signalStorage)(auth));
                senderName = (0, exports.jidToSignalSenderKeyName)(item.groupId, authorJid);
                senderMsg = new WASignalGroup_1.SenderKeyDistributionMessage(null, null, null, null, item.axolotlSenderKeyDistributionMessage);
                return [4 /*yield*/, auth.keys.get('sender-key', [senderName])];
            case 1:
                _a = _d.sent(), _b = senderName, senderKey = _a[_b];
                if (!!senderKey) return [3 /*break*/, 3];
                record = new WASignalGroup_1.SenderKeyRecord();
                return [4 /*yield*/, auth.keys.set({ 'sender-key': (_c = {}, _c[senderName] = record, _c) })];
            case 2:
                _d.sent();
                _d.label = 3;
            case 3: return [4 /*yield*/, builder.process(senderName, senderMsg)];
            case 4:
                _d.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.processSenderKeyMessage = processSenderKeyMessage;
var decryptSignalProto = function (user, type, msg, auth) { return __awaiter(void 0, void 0, void 0, function () {
    var addr, session, result, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                addr = (0, exports.jidToSignalProtocolAddress)(user);
                session = new libsignal.SessionCipher((0, exports.signalStorage)(auth), addr);
                _a = type;
                switch (_a) {
                    case 'pkmsg': return [3 /*break*/, 1];
                    case 'msg': return [3 /*break*/, 3];
                }
                return [3 /*break*/, 5];
            case 1: return [4 /*yield*/, session.decryptPreKeyWhisperMessage(msg)];
            case 2:
                result = _b.sent();
                return [3 /*break*/, 5];
            case 3: return [4 /*yield*/, session.decryptWhisperMessage(msg)];
            case 4:
                result = _b.sent();
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/, result];
        }
    });
}); };
exports.decryptSignalProto = decryptSignalProto;
var encryptSignalProto = function (user, buffer, auth) { return __awaiter(void 0, void 0, void 0, function () {
    var addr, cipher, _a, type, body;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                addr = (0, exports.jidToSignalProtocolAddress)(user);
                cipher = new libsignal.SessionCipher((0, exports.signalStorage)(auth), addr);
                return [4 /*yield*/, cipher.encrypt(buffer)];
            case 1:
                _a = _b.sent(), type = _a.type, body = _a.body;
                return [2 /*return*/, {
                        type: type === 3 ? 'pkmsg' : 'msg',
                        ciphertext: Buffer.from(body, 'binary')
                    }];
        }
    });
}); };
exports.encryptSignalProto = encryptSignalProto;
var encryptSenderKeyMsgSignalProto = function (group, data, meId, auth) { return __awaiter(void 0, void 0, void 0, function () {
    var storage, senderName, builder, _a, _b, senderKey, record, senderKeyDistributionMessage, session;
    var _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                storage = (0, exports.signalStorage)(auth);
                senderName = (0, exports.jidToSignalSenderKeyName)(group, meId);
                builder = new WASignalGroup_1.GroupSessionBuilder(storage);
                return [4 /*yield*/, auth.keys.get('sender-key', [senderName])];
            case 1:
                _a = _e.sent(), _b = senderName, senderKey = _a[_b];
                if (!!senderKey) return [3 /*break*/, 3];
                record = new WASignalGroup_1.SenderKeyRecord();
                return [4 /*yield*/, auth.keys.set({ 'sender-key': (_c = {}, _c[senderName] = record, _c) })];
            case 2:
                _e.sent();
                _e.label = 3;
            case 3: return [4 /*yield*/, builder.create(senderName)];
            case 4:
                senderKeyDistributionMessage = _e.sent();
                session = new WASignalGroup_1.GroupCipher(storage, senderName);
                _d = {};
                return [4 /*yield*/, session.encrypt(data)];
            case 5: return [2 /*return*/, (_d.ciphertext = (_e.sent()),
                    _d.senderKeyDistributionMessageKey = senderKeyDistributionMessage.serialize(),
                    _d)];
        }
    });
}); };
exports.encryptSenderKeyMsgSignalProto = encryptSenderKeyMsgSignalProto;
var parseAndInjectE2ESessions = function (node, auth) { return __awaiter(void 0, void 0, void 0, function () {
    var extractKey, nodes, _i, nodes_1, node_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                extractKey = function (key) { return (key ? ({
                    keyId: (0, WABinary_1.getBinaryNodeChildUInt)(key, 'id', 3),
                    publicKey: (0, exports.generateSignalPubKey)((0, WABinary_1.getBinaryNodeChildBuffer)(key, 'value')),
                    signature: (0, WABinary_1.getBinaryNodeChildBuffer)(key, 'signature')
                }) : undefined); };
                nodes = (0, WABinary_1.getBinaryNodeChildren)((0, WABinary_1.getBinaryNodeChild)(node, 'list'), 'user');
                for (_i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
                    node_1 = nodes_1[_i];
                    (0, WABinary_1.assertNodeErrorFree)(node_1);
                }
                return [4 /*yield*/, Promise.all(nodes.map(function (node) { return __awaiter(void 0, void 0, void 0, function () {
                        var signedKey, key, identity, jid, registrationId, device, cipher;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    signedKey = (0, WABinary_1.getBinaryNodeChild)(node, 'skey');
                                    key = (0, WABinary_1.getBinaryNodeChild)(node, 'key');
                                    identity = (0, WABinary_1.getBinaryNodeChildBuffer)(node, 'identity');
                                    jid = node.attrs.jid;
                                    registrationId = (0, WABinary_1.getBinaryNodeChildUInt)(node, 'registration', 4);
                                    device = {
                                        registrationId: registrationId,
                                        identityKey: (0, exports.generateSignalPubKey)(identity),
                                        signedPreKey: extractKey(signedKey),
                                        preKey: extractKey(key)
                                    };
                                    cipher = new libsignal.SessionBuilder((0, exports.signalStorage)(auth), (0, exports.jidToSignalProtocolAddress)(jid));
                                    return [4 /*yield*/, cipher.initOutgoing(device)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); }))];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.parseAndInjectE2ESessions = parseAndInjectE2ESessions;
var extractDeviceJids = function (result, myJid, excludeZeroDevices) {
    var _a;
    var _b = (0, WABinary_1.jidDecode)(myJid), myUser = _b.user, myDevice = _b.device;
    var extracted = [];
    for (var _i = 0, _c = result.content; _i < _c.length; _i++) {
        var node = _c[_i];
        var list = (_a = (0, WABinary_1.getBinaryNodeChild)(node, 'list')) === null || _a === void 0 ? void 0 : _a.content;
        if (list && Array.isArray(list)) {
            for (var _d = 0, list_1 = list; _d < list_1.length; _d++) {
                var item = list_1[_d];
                var user = (0, WABinary_1.jidDecode)(item.attrs.jid).user;
                var devicesNode = (0, WABinary_1.getBinaryNodeChild)(item, 'devices');
                var deviceListNode = (0, WABinary_1.getBinaryNodeChild)(devicesNode, 'device-list');
                if (Array.isArray(deviceListNode === null || deviceListNode === void 0 ? void 0 : deviceListNode.content)) {
                    for (var _e = 0, _f = deviceListNode.content; _e < _f.length; _e++) {
                        var _g = _f[_e], tag = _g.tag, attrs = _g.attrs;
                        var device = +attrs.id;
                        if (tag === 'device' && // ensure the "device" tag
                            (!excludeZeroDevices || device !== 0) && // if zero devices are not-excluded, or device is non zero
                            (myUser !== user || myDevice !== device) && // either different user or if me user, not this device
                            (device === 0 || !!attrs['key-index']) // ensure that "key-index" is specified for "non-zero" devices, produces a bad req otherwise
                        ) {
                            extracted.push({ user: user, device: device });
                        }
                    }
                }
            }
        }
    }
    return extracted;
};
exports.extractDeviceJids = extractDeviceJids;

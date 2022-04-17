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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.processSyncActions = exports.chatModificationToAppPatch = exports.decodePatches = exports.decodeSyncdSnapshot = exports.downloadExternalPatch = exports.downloadExternalBlob = exports.extractSyncdPatches = exports.decodeSyncdPatch = exports.decodeSyncdMutations = exports.encodeSyncdPatch = exports.newLTHashState = void 0;
var boom_1 = require("@hapi/boom");
var WAProto_1 = require("../../WAProto");
var WABinary_1 = require("../WABinary");
var crypto_1 = require("./crypto");
var generics_1 = require("./generics");
var lt_hash_1 = require("./lt-hash");
var messages_media_1 = require("./messages-media");
var mutationKeys = function (keydata) {
    var expanded = (0, crypto_1.hkdf)(keydata, 160, { info: 'WhatsApp Mutation Keys' });
    return {
        indexKey: expanded.slice(0, 32),
        valueEncryptionKey: expanded.slice(32, 64),
        valueMacKey: expanded.slice(64, 96),
        snapshotMacKey: expanded.slice(96, 128),
        patchMacKey: expanded.slice(128, 160)
    };
};
var generateMac = function (operation, data, keyId, key) {
    var getKeyData = function () {
        var r;
        switch (operation) {
            case WAProto_1.proto.SyncdMutation.SyncdMutationSyncdOperation.SET:
                r = 0x01;
                break;
            case WAProto_1.proto.SyncdMutation.SyncdMutationSyncdOperation.REMOVE:
                r = 0x02;
                break;
        }
        var buff = Buffer.from([r]);
        return Buffer.concat([buff, Buffer.from(keyId, 'base64')]);
    };
    var keyData = getKeyData();
    var last = Buffer.alloc(8); // 8 bytes
    last.set([keyData.length], last.length - 1);
    var total = Buffer.concat([keyData, data, last]);
    var hmac = (0, crypto_1.hmacSign)(total, key, 'sha512');
    return hmac.slice(0, 32);
};
var to64BitNetworkOrder = function (e) {
    var t = new ArrayBuffer(8);
    new DataView(t).setUint32(4, e, !1);
    return Buffer.from(t);
};
var makeLtHashGenerator = function (_a) {
    var indexValueMap = _a.indexValueMap, hash = _a.hash;
    indexValueMap = __assign({}, indexValueMap);
    var addBuffs = [];
    var subBuffs = [];
    return {
        mix: function (_a) {
            var indexMac = _a.indexMac, valueMac = _a.valueMac, operation = _a.operation;
            var indexMacBase64 = Buffer.from(indexMac).toString('base64');
            var prevOp = indexValueMap[indexMacBase64];
            if (operation === WAProto_1.proto.SyncdMutation.SyncdMutationSyncdOperation.REMOVE) {
                if (!prevOp) {
                    throw new boom_1.Boom('tried remove, but no previous op', { data: { indexMac: indexMac, valueMac: valueMac } });
                }
                // remove from index value mac, since this mutation is erased
                delete indexValueMap[indexMacBase64];
            }
            else {
                addBuffs.push(new Uint8Array(valueMac).buffer);
                // add this index into the history map
                indexValueMap[indexMacBase64] = { valueMac: valueMac };
            }
            if (prevOp) {
                subBuffs.push(new Uint8Array(prevOp.valueMac).buffer);
            }
        },
        finish: function () {
            var result = lt_hash_1.LT_HASH_ANTI_TAMPERING.subtractThenAdd(new Uint8Array(hash).buffer, addBuffs, subBuffs);
            var buffer = Buffer.from(result);
            return {
                hash: buffer,
                indexValueMap: indexValueMap
            };
        }
    };
};
var generateSnapshotMac = function (lthash, version, name, key) {
    var total = Buffer.concat([
        lthash,
        to64BitNetworkOrder(version),
        Buffer.from(name, 'utf-8')
    ]);
    return (0, crypto_1.hmacSign)(total, key, 'sha256');
};
var generatePatchMac = function (snapshotMac, valueMacs, version, type, key) {
    var total = Buffer.concat(__spreadArray(__spreadArray([
        snapshotMac
    ], valueMacs, true), [
        to64BitNetworkOrder(version),
        Buffer.from(type, 'utf-8')
    ], false));
    return (0, crypto_1.hmacSign)(total, key);
};
var newLTHashState = function () { return ({ version: 0, hash: Buffer.alloc(128), indexValueMap: {} }); };
exports.newLTHashState = newLTHashState;
var encodeSyncdPatch = function (_a, myAppStateKeyId, state, getAppStateSyncKey) {
    var type = _a.type, index = _a.index, syncAction = _a.syncAction, apiVersion = _a.apiVersion, operation = _a.operation;
    return __awaiter(void 0, void 0, void 0, function () {
        var key, _b, encKeyId, indexBuffer, dataProto, encoded, keyValue, encValue, valueMac, indexMac, generator, snapshotMac, patch, base64Index;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!!!myAppStateKeyId) return [3 /*break*/, 2];
                    return [4 /*yield*/, getAppStateSyncKey(myAppStateKeyId)];
                case 1:
                    _b = _c.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _b = undefined;
                    _c.label = 3;
                case 3:
                    key = _b;
                    if (!key) {
                        throw new boom_1.Boom("myAppStateKey (\"".concat(myAppStateKeyId, "\") not present"), { statusCode: 404 });
                    }
                    encKeyId = Buffer.from(myAppStateKeyId, 'base64');
                    state = __assign(__assign({}, state), { indexValueMap: __assign({}, state.indexValueMap) });
                    indexBuffer = Buffer.from(JSON.stringify(index));
                    dataProto = WAProto_1.proto.SyncActionData.fromObject({
                        index: indexBuffer,
                        value: syncAction,
                        padding: new Uint8Array(0),
                        version: apiVersion
                    });
                    encoded = WAProto_1.proto.SyncActionData.encode(dataProto).finish();
                    keyValue = mutationKeys(key.keyData);
                    encValue = (0, crypto_1.aesEncrypt)(encoded, keyValue.valueEncryptionKey);
                    valueMac = generateMac(operation, encValue, encKeyId, keyValue.valueMacKey);
                    indexMac = (0, crypto_1.hmacSign)(indexBuffer, keyValue.indexKey);
                    generator = makeLtHashGenerator(state);
                    generator.mix({ indexMac: indexMac, valueMac: valueMac, operation: operation });
                    Object.assign(state, generator.finish());
                    state.version += 1;
                    snapshotMac = generateSnapshotMac(state.hash, state.version, type, keyValue.snapshotMacKey);
                    patch = {
                        patchMac: generatePatchMac(snapshotMac, [valueMac], state.version, type, keyValue.patchMacKey),
                        snapshotMac: snapshotMac,
                        keyId: { id: encKeyId },
                        mutations: [
                            {
                                operation: operation,
                                record: {
                                    index: {
                                        blob: indexMac
                                    },
                                    value: {
                                        blob: Buffer.concat([encValue, valueMac])
                                    },
                                    keyId: { id: encKeyId }
                                }
                            }
                        ]
                    };
                    base64Index = indexMac.toString('base64');
                    state.indexValueMap[base64Index] = { valueMac: valueMac };
                    return [2 /*return*/, { patch: patch, state: state }];
            }
        });
    });
};
exports.encodeSyncdPatch = encodeSyncdPatch;
var decodeSyncdMutations = function (msgMutations, initialState, getAppStateSyncKey, validateMacs) { return __awaiter(void 0, void 0, void 0, function () {
    var keyCache, getKey, ltGenerator, mutations, _i, _a, msgMutation, operation, record, key, content, encContent, ogValueMac, contentHmac, result, syncAction, hmac, indexStr;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                keyCache = {};
                getKey = function (keyId) { return __awaiter(void 0, void 0, void 0, function () {
                    var base64Key, key, keyEnc, result;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                base64Key = Buffer.from(keyId).toString('base64');
                                key = keyCache[base64Key];
                                if (!!key) return [3 /*break*/, 2];
                                return [4 /*yield*/, getAppStateSyncKey(base64Key)];
                            case 1:
                                keyEnc = _a.sent();
                                if (!keyEnc) {
                                    throw new boom_1.Boom("failed to find key \"".concat(base64Key, "\" to decode mutation"), { statusCode: 404, data: { msgMutations: msgMutations } });
                                }
                                result = mutationKeys(keyEnc.keyData);
                                keyCache[base64Key] = result;
                                key = result;
                                _a.label = 2;
                            case 2: return [2 /*return*/, key];
                        }
                    });
                }); };
                ltGenerator = makeLtHashGenerator(initialState);
                mutations = [];
                _i = 0, _a = msgMutations;
                _b.label = 1;
            case 1:
                if (!(_i < _a.length)) return [3 /*break*/, 4];
                msgMutation = _a[_i];
                operation = 'operation' in msgMutation ? msgMutation.operation : WAProto_1.proto.SyncdMutation.SyncdMutationSyncdOperation.SET;
                record = ('record' in msgMutation && !!msgMutation.record) ? msgMutation.record : msgMutation;
                return [4 /*yield*/, getKey(record.keyId.id)];
            case 2:
                key = _b.sent();
                content = Buffer.from(record.value.blob);
                encContent = content.slice(0, -32);
                ogValueMac = content.slice(-32);
                if (validateMacs) {
                    contentHmac = generateMac(operation, encContent, record.keyId.id, key.valueMacKey);
                    if (Buffer.compare(contentHmac, ogValueMac) !== 0) {
                        throw new boom_1.Boom('HMAC content verification failed');
                    }
                }
                result = (0, crypto_1.aesDecrypt)(encContent, key.valueEncryptionKey);
                syncAction = WAProto_1.proto.SyncActionData.decode(result);
                if (validateMacs) {
                    hmac = (0, crypto_1.hmacSign)(syncAction.index, key.indexKey);
                    if (Buffer.compare(hmac, record.index.blob) !== 0) {
                        throw new boom_1.Boom('HMAC index verification failed');
                    }
                }
                indexStr = Buffer.from(syncAction.index).toString();
                mutations.push({
                    syncAction: syncAction,
                    index: JSON.parse(indexStr)
                });
                ltGenerator.mix({
                    indexMac: record.index.blob,
                    valueMac: ogValueMac,
                    operation: operation
                });
                _b.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/, __assign({ mutations: mutations }, ltGenerator.finish())];
        }
    });
}); };
exports.decodeSyncdMutations = decodeSyncdMutations;
var decodeSyncdPatch = function (msg, name, initialState, getAppStateSyncKey, validateMacs) { return __awaiter(void 0, void 0, void 0, function () {
    var base64Key, mainKeyObj, mainKey, mutationmacs, patchMac, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!validateMacs) return [3 /*break*/, 2];
                base64Key = Buffer.from(msg.keyId.id).toString('base64');
                return [4 /*yield*/, getAppStateSyncKey(base64Key)];
            case 1:
                mainKeyObj = _a.sent();
                mainKey = mutationKeys(mainKeyObj.keyData);
                mutationmacs = msg.mutations.map(function (mutation) { return mutation.record.value.blob.slice(-32); });
                patchMac = generatePatchMac(msg.snapshotMac, mutationmacs, (0, generics_1.toNumber)(msg.version.version), name, mainKey.patchMacKey);
                if (Buffer.compare(patchMac, msg.patchMac) !== 0) {
                    throw new boom_1.Boom('Invalid patch mac');
                }
                _a.label = 2;
            case 2: return [4 /*yield*/, (0, exports.decodeSyncdMutations)(msg.mutations, initialState, getAppStateSyncKey, validateMacs)];
            case 3:
                result = _a.sent();
                return [2 /*return*/, result];
        }
    });
}); };
exports.decodeSyncdPatch = decodeSyncdPatch;
var extractSyncdPatches = function (result) { return __awaiter(void 0, void 0, void 0, function () {
    var syncNode, collectionNodes, final;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                syncNode = (0, WABinary_1.getBinaryNodeChild)(result, 'sync');
                collectionNodes = (0, WABinary_1.getBinaryNodeChildren)(syncNode, 'collection');
                final = {};
                return [4 /*yield*/, Promise.all(collectionNodes.map(function (collectionNode) { return __awaiter(void 0, void 0, void 0, function () {
                        var patchesNode, patches, snapshotNode, syncds, name, hasMorePatches, snapshot, blobRef, data, _i, patches_1, content, syncd;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    patchesNode = (0, WABinary_1.getBinaryNodeChild)(collectionNode, 'patches');
                                    patches = (0, WABinary_1.getBinaryNodeChildren)(patchesNode || collectionNode, 'patch');
                                    snapshotNode = (0, WABinary_1.getBinaryNodeChild)(collectionNode, 'snapshot');
                                    syncds = [];
                                    name = collectionNode.attrs.name;
                                    hasMorePatches = collectionNode.attrs.has_more_patches === 'true';
                                    snapshot = undefined;
                                    if (!(snapshotNode && !!snapshotNode.content)) return [3 /*break*/, 2];
                                    if (!Buffer.isBuffer(snapshotNode)) {
                                        snapshotNode.content = Buffer.from(Object.values(snapshotNode.content));
                                    }
                                    blobRef = WAProto_1.proto.ExternalBlobReference.decode(snapshotNode.content);
                                    return [4 /*yield*/, (0, exports.downloadExternalBlob)(blobRef)];
                                case 1:
                                    data = _a.sent();
                                    snapshot = WAProto_1.proto.SyncdSnapshot.decode(data);
                                    _a.label = 2;
                                case 2:
                                    for (_i = 0, patches_1 = patches; _i < patches_1.length; _i++) {
                                        content = patches_1[_i].content;
                                        if (content) {
                                            if (!Buffer.isBuffer(content)) {
                                                content = Buffer.from(Object.values(content));
                                            }
                                            syncd = WAProto_1.proto.SyncdPatch.decode(content);
                                            if (!syncd.version) {
                                                syncd.version = { version: +collectionNode.attrs.version + 1 };
                                            }
                                            syncds.push(syncd);
                                        }
                                    }
                                    final[name] = { patches: syncds, hasMorePatches: hasMorePatches, snapshot: snapshot };
                                    return [2 /*return*/];
                            }
                        });
                    }); }))];
            case 1:
                _a.sent();
                return [2 /*return*/, final];
        }
    });
}); };
exports.extractSyncdPatches = extractSyncdPatches;
var downloadExternalBlob = function (blob) { return __awaiter(void 0, void 0, void 0, function () {
    var stream, buffer, stream_1, stream_1_1, chunk, e_1_1;
    var e_1, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, (0, messages_media_1.downloadContentFromMessage)(blob, 'md-app-state')];
            case 1:
                stream = _b.sent();
                buffer = Buffer.from([]);
                _b.label = 2;
            case 2:
                _b.trys.push([2, 7, 8, 13]);
                stream_1 = __asyncValues(stream);
                _b.label = 3;
            case 3: return [4 /*yield*/, stream_1.next()];
            case 4:
                if (!(stream_1_1 = _b.sent(), !stream_1_1.done)) return [3 /*break*/, 6];
                chunk = stream_1_1.value;
                buffer = Buffer.concat([buffer, chunk]);
                _b.label = 5;
            case 5: return [3 /*break*/, 3];
            case 6: return [3 /*break*/, 13];
            case 7:
                e_1_1 = _b.sent();
                e_1 = { error: e_1_1 };
                return [3 /*break*/, 13];
            case 8:
                _b.trys.push([8, , 11, 12]);
                if (!(stream_1_1 && !stream_1_1.done && (_a = stream_1["return"]))) return [3 /*break*/, 10];
                return [4 /*yield*/, _a.call(stream_1)];
            case 9:
                _b.sent();
                _b.label = 10;
            case 10: return [3 /*break*/, 12];
            case 11:
                if (e_1) throw e_1.error;
                return [7 /*endfinally*/];
            case 12: return [7 /*endfinally*/];
            case 13: return [2 /*return*/, buffer];
        }
    });
}); };
exports.downloadExternalBlob = downloadExternalBlob;
var downloadExternalPatch = function (blob) { return __awaiter(void 0, void 0, void 0, function () {
    var buffer, syncData;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, exports.downloadExternalBlob)(blob)];
            case 1:
                buffer = _a.sent();
                syncData = WAProto_1.proto.SyncdMutations.decode(buffer);
                return [2 /*return*/, syncData];
        }
    });
}); };
exports.downloadExternalPatch = downloadExternalPatch;
var decodeSyncdSnapshot = function (name, snapshot, getAppStateSyncKey, minimumVersionNumber, validateMacs) {
    if (validateMacs === void 0) { validateMacs = true; }
    return __awaiter(void 0, void 0, void 0, function () {
        var newState, _a, hash, indexValueMap, mutations, base64Key, keyEnc, result, computedSnapshotMac, areMutationsRequired;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    newState = (0, exports.newLTHashState)();
                    newState.version = (0, generics_1.toNumber)(snapshot.version.version);
                    return [4 /*yield*/, (0, exports.decodeSyncdMutations)(snapshot.records, newState, getAppStateSyncKey, validateMacs)];
                case 1:
                    _a = _b.sent(), hash = _a.hash, indexValueMap = _a.indexValueMap, mutations = _a.mutations;
                    newState.hash = hash;
                    newState.indexValueMap = indexValueMap;
                    if (!validateMacs) return [3 /*break*/, 3];
                    base64Key = Buffer.from(snapshot.keyId.id).toString('base64');
                    return [4 /*yield*/, getAppStateSyncKey(base64Key)];
                case 2:
                    keyEnc = _b.sent();
                    if (!keyEnc) {
                        throw new boom_1.Boom("failed to find key \"".concat(base64Key, "\" to decode mutation"), { statusCode: 500 });
                    }
                    result = mutationKeys(keyEnc.keyData);
                    computedSnapshotMac = generateSnapshotMac(newState.hash, newState.version, name, result.snapshotMacKey);
                    if (Buffer.compare(snapshot.mac, computedSnapshotMac) !== 0) {
                        throw new boom_1.Boom("failed to verify LTHash at ".concat(newState.version, " of ").concat(name, " from snapshot"), { statusCode: 500 });
                    }
                    _b.label = 3;
                case 3:
                    areMutationsRequired = typeof minimumVersionNumber === 'undefined' || newState.version > minimumVersionNumber;
                    if (!areMutationsRequired) {
                        // clear array
                        mutations.splice(0, mutations.length);
                    }
                    return [2 /*return*/, {
                            state: newState,
                            mutations: mutations
                        }];
            }
        });
    });
};
exports.decodeSyncdSnapshot = decodeSyncdSnapshot;
var decodePatches = function (name, syncds, initial, getAppStateSyncKey, minimumVersionNumber, validateMacs) {
    if (validateMacs === void 0) { validateMacs = true; }
    return __awaiter(void 0, void 0, void 0, function () {
        var successfulMutations, newState, _i, syncds_1, syncd, version, keyId, snapshotMac, ref, patchVersion, decodeResult, base64Key, keyEnc, result, computedSnapshotMac;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    successfulMutations = [];
                    newState = __assign(__assign({}, initial), { indexValueMap: __assign({}, initial.indexValueMap) });
                    _i = 0, syncds_1 = syncds;
                    _b.label = 1;
                case 1:
                    if (!(_i < syncds_1.length)) return [3 /*break*/, 7];
                    syncd = syncds_1[_i];
                    version = syncd.version, keyId = syncd.keyId, snapshotMac = syncd.snapshotMac;
                    if (!syncd.externalMutations) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, exports.downloadExternalPatch)(syncd.externalMutations)];
                case 2:
                    ref = _b.sent();
                    (_a = syncd.mutations).push.apply(_a, ref.mutations);
                    _b.label = 3;
                case 3:
                    patchVersion = (0, generics_1.toNumber)(version.version);
                    newState.version = patchVersion;
                    return [4 /*yield*/, (0, exports.decodeSyncdPatch)(syncd, name, newState, getAppStateSyncKey, validateMacs)];
                case 4:
                    decodeResult = _b.sent();
                    newState.hash = decodeResult.hash;
                    newState.indexValueMap = decodeResult.indexValueMap;
                    if (typeof minimumVersionNumber === 'undefined' || patchVersion > minimumVersionNumber) {
                        successfulMutations.push.apply(successfulMutations, decodeResult.mutations);
                    }
                    if (!validateMacs) return [3 /*break*/, 6];
                    base64Key = Buffer.from(keyId.id).toString('base64');
                    return [4 /*yield*/, getAppStateSyncKey(base64Key)];
                case 5:
                    keyEnc = _b.sent();
                    if (!keyEnc) {
                        throw new boom_1.Boom("failed to find key \"".concat(base64Key, "\" to decode mutation"));
                    }
                    result = mutationKeys(keyEnc.keyData);
                    computedSnapshotMac = generateSnapshotMac(newState.hash, newState.version, name, result.snapshotMacKey);
                    if (Buffer.compare(snapshotMac, computedSnapshotMac) !== 0) {
                        throw new boom_1.Boom("failed to verify LTHash at ".concat(newState.version, " of ").concat(name));
                    }
                    _b.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 1];
                case 7: return [2 /*return*/, {
                        newMutations: successfulMutations,
                        state: newState
                    }];
            }
        });
    });
};
exports.decodePatches = decodePatches;
var chatModificationToAppPatch = function (mod, jid) {
    var OP = WAProto_1.proto.SyncdMutation.SyncdMutationSyncdOperation;
    var getMessageRange = function (lastMessages) {
        if (!(lastMessages === null || lastMessages === void 0 ? void 0 : lastMessages.length)) {
            throw new boom_1.Boom('Expected last message to be not from me', { statusCode: 400 });
        }
        var lastMsg = lastMessages[lastMessages.length - 1];
        if (lastMsg.key.fromMe) {
            throw new boom_1.Boom('Expected last message in array to be not from me', { statusCode: 400 });
        }
        var messageRange = {
            lastMessageTimestamp: lastMsg === null || lastMsg === void 0 ? void 0 : lastMsg.messageTimestamp,
            messages: lastMessages.map(function (m) {
                if (m.key.participant) {
                    m.key = __assign({}, m.key);
                    m.key.participant = (0, WABinary_1.jidNormalizedUser)(m.key.participant);
                }
                return m;
            })
        };
        return messageRange;
    };
    var patch;
    if ('mute' in mod) {
        patch = {
            syncAction: {
                muteAction: {
                    muted: !!mod.mute,
                    muteEndTimestamp: mod.mute || undefined
                }
            },
            index: ['mute', jid],
            type: 'regular_high',
            apiVersion: 2,
            operation: OP.SET
        };
    }
    else if ('archive' in mod) {
        patch = {
            syncAction: {
                archiveChatAction: {
                    archived: !!mod.archive,
                    messageRange: getMessageRange(mod.lastMessages)
                }
            },
            index: ['archive', jid],
            type: 'regular_low',
            apiVersion: 3,
            operation: OP.SET
        };
    }
    else if ('markRead' in mod) {
        patch = {
            syncAction: {
                markChatAsReadAction: {
                    read: mod.markRead,
                    messageRange: getMessageRange(mod.lastMessages)
                }
            },
            index: ['markChatAsRead', jid],
            type: 'regular_low',
            apiVersion: 3,
            operation: OP.SET
        };
    }
    else if ('clear' in mod) {
        if (mod.clear === 'all') {
            throw new boom_1.Boom('not supported');
        }
        else {
            var key = mod.clear.messages[0];
            patch = {
                syncAction: {
                    deleteMessageForMeAction: {
                        deleteMedia: false
                    }
                },
                index: ['deleteMessageForMe', jid, key.id, key.fromMe ? '1' : '0', '0'],
                type: 'regular_high',
                apiVersion: 3,
                operation: OP.SET
            };
        }
    }
    else if ('pin' in mod) {
        patch = {
            syncAction: {
                pinAction: {
                    pinned: !!mod.pin
                }
            },
            index: ['pin_v1', jid],
            type: 'regular_low',
            apiVersion: 5,
            operation: OP.SET
        };
    }
    else {
        throw new boom_1.Boom('not supported');
    }
    patch.syncAction.timestamp = Date.now();
    return patch;
};
exports.chatModificationToAppPatch = chatModificationToAppPatch;
var processSyncActions = function (actions, me, logger) {
    var _a, _b, _c, _d, _e;
    var map = {};
    var updates = {};
    var contactUpdates = {};
    var msgDeletes = [];
    for (var _i = 0, actions_1 = actions; _i < actions_1.length; _i++) {
        var _f = actions_1[_i], action = _f.syncAction.value, _g = _f.index, _ = _g[0], id = _g[1], msgId = _g[2], fromMe = _g[3];
        var update = { id: id };
        if (action === null || action === void 0 ? void 0 : action.muteAction) {
            update.mute = ((_a = action.muteAction) === null || _a === void 0 ? void 0 : _a.muted) ?
                (0, generics_1.toNumber)(action.muteAction.muteEndTimestamp) :
                undefined;
        }
        else if (action === null || action === void 0 ? void 0 : action.archiveChatAction) {
            update.archive = !!((_b = action.archiveChatAction) === null || _b === void 0 ? void 0 : _b.archived);
        }
        else if (action === null || action === void 0 ? void 0 : action.markChatAsReadAction) {
            update.unreadCount = !!((_c = action.markChatAsReadAction) === null || _c === void 0 ? void 0 : _c.read) ? 0 : -1;
        }
        else if (action === null || action === void 0 ? void 0 : action.clearChatAction) {
            msgDeletes.push({
                remoteJid: id,
                id: msgId,
                fromMe: fromMe === '1'
            });
        }
        else if (action === null || action === void 0 ? void 0 : action.contactAction) {
            contactUpdates[id] = __assign(__assign({}, (contactUpdates[id] || {})), { id: id, name: action.contactAction.fullName });
        }
        else if (action === null || action === void 0 ? void 0 : action.pushNameSetting) {
            map['creds.update'] = map['creds.update'] || {};
            map['creds.update'].me = __assign(__assign({}, me), { name: (_d = action === null || action === void 0 ? void 0 : action.pushNameSetting) === null || _d === void 0 ? void 0 : _d.name });
        }
        else if (action === null || action === void 0 ? void 0 : action.pinAction) {
            update.pin = ((_e = action.pinAction) === null || _e === void 0 ? void 0 : _e.pinned) ? (0, generics_1.toNumber)(action.timestamp) : undefined;
        }
        else if (action === null || action === void 0 ? void 0 : action.unarchiveChatsSetting) {
            map['creds.update'] = map['creds.update'] || {};
            map['creds.update'].accountSettings = { unarchiveChats: !!action.unarchiveChatsSetting.unarchiveChats };
            logger.info("archive setting updated => '".concat(action.unarchiveChatsSetting.unarchiveChats, "'"));
        }
        else {
            logger.warn({ action: action, id: id }, 'unprocessable update');
        }
        if (Object.keys(update).length > 1) {
            updates[update.id] = __assign(__assign({}, (updates[update.id] || {})), update);
        }
    }
    if (Object.values(updates).length) {
        map['chats.update'] = Object.values(updates);
    }
    if (Object.values(contactUpdates).length) {
        map['contacts.upsert'] = Object.values(contactUpdates);
    }
    if (msgDeletes.length) {
        map['messages.delete'] = { keys: msgDeletes };
    }
    return map;
};
exports.processSyncActions = processSyncActions;

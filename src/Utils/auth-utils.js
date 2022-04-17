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
exports.useSingleFileAuthState = exports.initAuthCreds = exports.addTransactionCapability = void 0;
var boom_1 = require("@hapi/boom");
var crypto_1 = require("crypto");
var WAProto_1 = require("../../WAProto");
var crypto_2 = require("./crypto");
var generics_1 = require("./generics");
var KEY_MAP = {
    'pre-key': 'preKeys',
    'session': 'sessions',
    'sender-key': 'senderKeys',
    'app-state-sync-key': 'appStateSyncKeys',
    'app-state-sync-version': 'appStateVersions',
    'sender-key-memory': 'senderKeyMemory'
};
var addTransactionCapability = function (state, logger) {
    var inTransaction = false;
    var transactionCache = {};
    var mutations = {};
    var prefetch = function (type, ids) { return __awaiter(void 0, void 0, void 0, function () {
        var dict, idsRequiringFetch, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!inTransaction) {
                        throw new boom_1.Boom('Cannot prefetch without transaction');
                    }
                    dict = transactionCache[type];
                    idsRequiringFetch = dict ? ids.filter(function (item) { return !(item in dict); }) : ids;
                    if (!idsRequiringFetch.length) return [3 /*break*/, 2];
                    return [4 /*yield*/, state.get(type, idsRequiringFetch)];
                case 1:
                    result = _a.sent();
                    transactionCache[type] = transactionCache[type] || {};
                    Object.assign(transactionCache[type], result);
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); };
    return {
        get: function (type, ids) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!inTransaction) return [3 /*break*/, 2];
                        return [4 /*yield*/, prefetch(type, ids)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, ids.reduce(function (dict, id) {
                                var _a;
                                var value = (_a = transactionCache[type]) === null || _a === void 0 ? void 0 : _a[id];
                                if (value) {
                                    dict[id] = value;
                                }
                                return dict;
                            }, {})];
                    case 2: return [2 /*return*/, state.get(type, ids)];
                }
            });
        }); },
        set: function (data) {
            if (inTransaction) {
                logger.trace({ types: Object.keys(data) }, 'caching in transaction');
                for (var key in data) {
                    transactionCache[key] = transactionCache[key] || {};
                    Object.assign(transactionCache[key], data[key]);
                    mutations[key] = mutations[key] || {};
                    Object.assign(mutations[key], data[key]);
                }
            }
            else {
                return state.set(data);
            }
        },
        isInTransaction: function () { return inTransaction; },
        prefetch: function (type, ids) {
            logger.trace({ type: type, ids: ids }, 'prefetching');
            return prefetch(type, ids);
        },
        transaction: function (work) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!inTransaction) return [3 /*break*/, 2];
                        return [4 /*yield*/, work()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 9];
                    case 2:
                        logger.debug('entering transaction');
                        inTransaction = true;
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, , 8, 9]);
                        return [4 /*yield*/, work()];
                    case 4:
                        _a.sent();
                        if (!Object.keys(mutations).length) return [3 /*break*/, 6];
                        logger.debug('committing transaction');
                        return [4 /*yield*/, state.set(mutations)];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        logger.debug('no mutations in transaction');
                        _a.label = 7;
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        inTransaction = false;
                        transactionCache = {};
                        mutations = {};
                        return [7 /*endfinally*/];
                    case 9: return [2 /*return*/];
                }
            });
        }); }
    };
};
exports.addTransactionCapability = addTransactionCapability;
var initAuthCreds = function () {
    var identityKey = crypto_2.Curve.generateKeyPair();
    return {
        noiseKey: crypto_2.Curve.generateKeyPair(),
        signedIdentityKey: identityKey,
        signedPreKey: (0, crypto_2.signedKeyPair)(identityKey, 1),
        registrationId: (0, generics_1.generateRegistrationId)(),
        advSecretKey: (0, crypto_1.randomBytes)(32).toString('base64'),
        nextPreKeyId: 1,
        firstUnuploadedPreKeyId: 1,
        serverHasPreKeys: false,
        accountSettings: {
            unarchiveChats: false
        }
    };
};
exports.initAuthCreds = initAuthCreds;
/** stores the full authentication state in a single JSON file */
var useSingleFileAuthState = function (filename, logger) {
    // require fs here so that in case "fs" is not available -- the app does not crash
    var _a = require('fs'), readFileSync = _a.readFileSync, writeFileSync = _a.writeFileSync, existsSync = _a.existsSync;
    var creds;
    var keys = {};
    // save the authentication state to a file
    var saveState = function () {
        logger && logger.trace('saving auth state');
        writeFileSync(filename, 
        // BufferJSON replacer utility saves buffers nicely
        JSON.stringify({ creds: creds, keys: keys }, generics_1.BufferJSON.replacer, 2));
    };
    if (existsSync(filename)) {
        var result = JSON.parse(readFileSync(filename, { encoding: 'utf-8' }), generics_1.BufferJSON.reviver);
        creds = result.creds;
        keys = result.keys;
    }
    else {
        creds = (0, exports.initAuthCreds)();
        keys = {};
    }
    return {
        state: {
            creds: creds,
            keys: {
                get: function (type, ids) {
                    var key = KEY_MAP[type];
                    return ids.reduce(function (dict, id) {
                        var _a;
                        var value = (_a = keys[key]) === null || _a === void 0 ? void 0 : _a[id];
                        if (value) {
                            if (type === 'app-state-sync-key') {
                                value = WAProto_1.proto.AppStateSyncKeyData.fromObject(value);
                            }
                            dict[id] = value;
                        }
                        return dict;
                    }, {});
                },
                set: function (data) {
                    for (var _key in data) {
                        var key = KEY_MAP[_key];
                        keys[key] = keys[key] || {};
                        Object.assign(keys[key], data[_key]);
                    }
                    saveState();
                }
            }
        },
        saveState: saveState
    };
};
exports.useSingleFileAuthState = useSingleFileAuthState;

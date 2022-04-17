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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
exports.__esModule = true;
exports.readAndEmitEventStream = exports.captureEventStream = void 0;
var events_1 = require("events");
var fs_1 = require("fs");
var promises_1 = require("fs/promises");
var readline_1 = require("readline");
var generics_1 = require("./generics");
var make_mutex_1 = require("./make-mutex");
/**
 * Captures events from a baileys event emitter & stores them in a file
 * @param ev The event emitter to read events from
 * @param filename File to save to
 */
var captureEventStream = function (ev, filename) {
    var oldEmit = ev.emit;
    // write mutex so data is appended in order
    var writeMutex = (0, make_mutex_1.makeMutex)();
    // monkey patch eventemitter to capture all events
    ev.emit = function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var content = JSON.stringify({ timestamp: Date.now(), event: args[0], data: args[1] }) + '\n';
        var result = oldEmit.apply(ev, args);
        writeMutex.mutex(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, promises_1.writeFile)(filename, content, { flag: 'a' })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        return result;
    };
};
exports.captureEventStream = captureEventStream;
/**
 * Read event file and emit events from there
 * @param filename filename containing event data
 * @param delayIntervalMs delay between each event emit
 */
var readAndEmitEventStream = function (filename, delayIntervalMs) {
    if (delayIntervalMs === void 0) { delayIntervalMs = 0; }
    var ev = new events_1["default"]();
    var fireEvents = function () { return __awaiter(void 0, void 0, void 0, function () {
        var fileStream, rl, rl_1, rl_1_1, line, _a, event_1, data, _b, e_1_1;
        var e_1, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    fileStream = (0, fs_1.createReadStream)(filename);
                    rl = (0, readline_1.createInterface)({
                        input: fileStream,
                        crlfDelay: Infinity
                    });
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 8, 9, 14]);
                    rl_1 = __asyncValues(rl);
                    _d.label = 2;
                case 2: return [4 /*yield*/, rl_1.next()];
                case 3:
                    if (!(rl_1_1 = _d.sent(), !rl_1_1.done)) return [3 /*break*/, 7];
                    line = rl_1_1.value;
                    if (!line) return [3 /*break*/, 6];
                    _a = JSON.parse(line), event_1 = _a.event, data = _a.data;
                    ev.emit(event_1, data);
                    _b = delayIntervalMs;
                    if (!_b) return [3 /*break*/, 5];
                    return [4 /*yield*/, (0, generics_1.delay)(delayIntervalMs)];
                case 4:
                    _b = (_d.sent());
                    _d.label = 5;
                case 5:
                    _b;
                    _d.label = 6;
                case 6: return [3 /*break*/, 2];
                case 7: return [3 /*break*/, 14];
                case 8:
                    e_1_1 = _d.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 14];
                case 9:
                    _d.trys.push([9, , 12, 13]);
                    if (!(rl_1_1 && !rl_1_1.done && (_c = rl_1["return"]))) return [3 /*break*/, 11];
                    return [4 /*yield*/, _c.call(rl_1)];
                case 10:
                    _d.sent();
                    _d.label = 11;
                case 11: return [3 /*break*/, 13];
                case 12:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 13: return [7 /*endfinally*/];
                case 14:
                    fileStream.close();
                    return [2 /*return*/];
            }
        });
    }); };
    return {
        ev: ev,
        task: fireEvents()
    };
};
exports.readAndEmitEventStream = readAndEmitEventStream;

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
exports.decodeMessageStanza = void 0;
var boom_1 = require("@hapi/boom");
var WAProto_1 = require("../../WAProto");
var WABinary_1 = require("../WABinary");
var generics_1 = require("./generics");
var signal_1 = require("./signal");
var NO_MESSAGE_FOUND_ERROR_TEXT = 'No message found';
var decodeMessageStanza = function (stanza, auth) {
    var msgType;
    var chatId;
    var author;
    var msgId = stanza.attrs.id;
    var from = stanza.attrs.from;
    var participant = stanza.attrs.participant;
    var recipient = stanza.attrs.recipient;
    var isMe = function (jid) { return (0, WABinary_1.areJidsSameUser)(jid, auth.creds.me.id); };
    if ((0, WABinary_1.isJidUser)(from)) {
        if (recipient) {
            if (!isMe(from)) {
                throw new boom_1.Boom('');
            }
            chatId = recipient;
        }
        else {
            chatId = from;
        }
        msgType = 'chat';
        author = from;
    }
    else if ((0, WABinary_1.isJidGroup)(from)) {
        if (!participant) {
            throw new boom_1.Boom('No participant in group message');
        }
        msgType = 'group';
        author = participant;
        chatId = from;
    }
    else if ((0, WABinary_1.isJidBroadcast)(from)) {
        if (!participant) {
            throw new boom_1.Boom('No participant in group message');
        }
        var isParticipantMe = isMe(participant);
        if ((0, WABinary_1.isJidStatusBroadcast)(from)) {
            msgType = isParticipantMe ? 'direct_peer_status' : 'other_status';
        }
        else {
            msgType = isParticipantMe ? 'peer_broadcast' : 'other_broadcast';
        }
        chatId = from;
        author = participant;
    }
    var sender = msgType === 'chat' ? author : chatId;
    var fromMe = isMe(stanza.attrs.participant || stanza.attrs.from);
    var pushname = stanza.attrs.notify;
    var key = {
        remoteJid: chatId,
        fromMe: fromMe,
        id: msgId,
        participant: participant
    };
    var fullMessage = {
        key: key,
        messageTimestamp: +stanza.attrs.t,
        pushName: pushname
    };
    if (key.fromMe) {
        fullMessage.status = WAProto_1.proto.WebMessageInfo.WebMessageInfoStatus.SERVER_ACK;
    }
    return {
        fullMessage: fullMessage,
        category: stanza.attrs.category,
        author: author,
        decryptionTask: (function () { return __awaiter(void 0, void 0, void 0, function () {
            var decryptables, _i, _a, _b, tag, attrs, content, msgBuffer, e2eType, _c, user, msg, error_1;
            var _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        decryptables = 0;
                        if (!Array.isArray(stanza.content)) return [3 /*break*/, 12];
                        _i = 0, _a = stanza.content;
                        _e.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 12];
                        _b = _a[_i], tag = _b.tag, attrs = _b.attrs, content = _b.content;
                        if (tag !== 'enc') {
                            return [3 /*break*/, 11];
                        }
                        if (!(content instanceof Uint8Array)) {
                            return [3 /*break*/, 11];
                        }
                        decryptables += 1;
                        msgBuffer = void 0;
                        _e.label = 2;
                    case 2:
                        _e.trys.push([2, 10, , 11]);
                        e2eType = attrs.type;
                        _c = e2eType;
                        switch (_c) {
                            case 'skmsg': return [3 /*break*/, 3];
                            case 'pkmsg': return [3 /*break*/, 5];
                            case 'msg': return [3 /*break*/, 5];
                        }
                        return [3 /*break*/, 7];
                    case 3: return [4 /*yield*/, (0, signal_1.decryptGroupSignalProto)(sender, author, content, auth)];
                    case 4:
                        msgBuffer = _e.sent();
                        return [3 /*break*/, 7];
                    case 5:
                        user = (0, WABinary_1.isJidUser)(sender) ? sender : author;
                        return [4 /*yield*/, (0, signal_1.decryptSignalProto)(user, e2eType, content, auth)];
                    case 6:
                        msgBuffer = _e.sent();
                        return [3 /*break*/, 7];
                    case 7:
                        msg = WAProto_1.proto.Message.decode((0, generics_1.unpadRandomMax16)(msgBuffer));
                        msg = ((_d = msg.deviceSentMessage) === null || _d === void 0 ? void 0 : _d.message) || msg;
                        if (!msg.senderKeyDistributionMessage) return [3 /*break*/, 9];
                        return [4 /*yield*/, (0, signal_1.processSenderKeyMessage)(author, msg.senderKeyDistributionMessage, auth)];
                    case 8:
                        _e.sent();
                        _e.label = 9;
                    case 9:
                        if (fullMessage.message) {
                            Object.assign(fullMessage.message, msg);
                        }
                        else {
                            fullMessage.message = msg;
                        }
                        return [3 /*break*/, 11];
                    case 10:
                        error_1 = _e.sent();
                        fullMessage.messageStubType = WAProto_1.proto.WebMessageInfo.WebMessageInfoStubType.CIPHERTEXT;
                        fullMessage.messageStubParameters = [error_1.message];
                        return [3 /*break*/, 11];
                    case 11:
                        _i++;
                        return [3 /*break*/, 1];
                    case 12:
                        // if nothing was found to decrypt
                        if (!decryptables) {
                            fullMessage.messageStubType = WAProto_1.proto.WebMessageInfo.WebMessageInfoStubType.CIPHERTEXT;
                            fullMessage.messageStubParameters = [NO_MESSAGE_FOUND_ERROR_TEXT];
                        }
                        return [2 /*return*/];
                }
            });
        }); })()
    };
};
exports.decodeMessageStanza = decodeMessageStanza;

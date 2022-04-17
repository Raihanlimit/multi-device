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
exports.downloadMediaMessage = exports.aggregateMessageKeysNotFromMe = exports.updateMessageWithReceipt = exports.getDevice = exports.extractMessageContent = exports.normalizeMessageContent = exports.getContentType = exports.generateWAMessage = exports.generateWAMessageFromContent = exports.generateWAMessageContent = exports.generateForwardMessageContent = exports.prepareDisappearingMessageSettingContent = exports.prepareWAMessageMedia = void 0;
var boom_1 = require("@hapi/boom");
var fs_1 = require("fs");
var WAProto_1 = require("../../WAProto");
var Defaults_1 = require("../Defaults");
var Types_1 = require("../Types");
var generics_1 = require("./generics");
var messages_media_1 = require("./messages-media");
var MIMETYPE_MAP = {
    image: 'image/jpeg',
    video: 'video/mp4',
    document: 'application/pdf',
    audio: 'audio/ogg; codecs=opus',
    sticker: 'image/webp',
    history: 'application/x-protobuf',
    'md-app-state': 'application/x-protobuf'
};
var MessageTypeProto = {
    'image': Types_1.WAProto.ImageMessage,
    'video': Types_1.WAProto.VideoMessage,
    'audio': Types_1.WAProto.AudioMessage,
    'sticker': Types_1.WAProto.StickerMessage,
    'document': Types_1.WAProto.DocumentMessage
};
var ButtonType = WAProto_1.proto.ButtonsMessage.ButtonsMessageHeaderType;
var prepareWAMessageMedia = function (message, options) { return __awaiter(void 0, void 0, void 0, function () {
    var logger, mediaType, _i, MEDIA_KEYS_1, key, uploadData, cacheableKey, mediaBuff, obj_1, key, requiresDurationComputation, requiresThumbnailComputation, requiresOriginalForSomeProcessing, _a, mediaKey, encWriteStream, bodyPath, fileEncSha256, fileSha256, fileLength, didSaveToTmpPath, fileEncSha256B64, _b, mediaUrl, directPath, obj;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                logger = options.logger;
                for (_i = 0, MEDIA_KEYS_1 = Defaults_1.MEDIA_KEYS; _i < MEDIA_KEYS_1.length; _i++) {
                    key = MEDIA_KEYS_1[_i];
                    if (key in message) {
                        mediaType = key;
                    }
                }
                uploadData = __assign(__assign({}, message), { media: message[mediaType] });
                delete uploadData[mediaType];
                cacheableKey = typeof uploadData.media === 'object' &&
                    ('url' in uploadData.media) &&
                    !!uploadData.media.url &&
                    !!options.mediaCache && (
                // generate the key
                mediaType + ':' + uploadData.media.url.toString());
                if (mediaType === 'document' && !uploadData.fileName) {
                    uploadData.fileName = 'file';
                }
                if (!uploadData.mimetype) {
                    uploadData.mimetype = MIMETYPE_MAP[mediaType];
                }
                // check for cache hit
                if (cacheableKey) {
                    mediaBuff = options.mediaCache.get(cacheableKey);
                    if (mediaBuff) {
                        logger === null || logger === void 0 ? void 0 : logger.debug({ cacheableKey: cacheableKey }, 'got media cache hit');
                        obj_1 = Types_1.WAProto.Message.decode(mediaBuff);
                        key = "".concat(mediaType, "Message");
                        delete uploadData.media;
                        Object.assign(obj_1[key], __assign({}, uploadData));
                        return [2 /*return*/, obj_1];
                    }
                }
                requiresDurationComputation = mediaType === 'audio' && typeof uploadData.seconds === 'undefined';
                requiresThumbnailComputation = (mediaType === 'image' || mediaType === 'video') &&
                    (typeof uploadData['jpegThumbnail'] === 'undefined');
                requiresOriginalForSomeProcessing = requiresDurationComputation || requiresThumbnailComputation;
                return [4 /*yield*/, (0, messages_media_1.encryptedStream)(uploadData.media, mediaType, requiresOriginalForSomeProcessing)
                    // url safe Base64 encode the SHA256 hash of the body
                ];
            case 1:
                _a = _d.sent(), mediaKey = _a.mediaKey, encWriteStream = _a.encWriteStream, bodyPath = _a.bodyPath, fileEncSha256 = _a.fileEncSha256, fileSha256 = _a.fileSha256, fileLength = _a.fileLength, didSaveToTmpPath = _a.didSaveToTmpPath;
                fileEncSha256B64 = encodeURIComponent(fileEncSha256.toString('base64')
                    .replace(/\+/g, '-')
                    .replace(/\//g, '_')
                    .replace(/\=+$/, ''));
                return [4 /*yield*/, Promise.all([
                        (function () { return __awaiter(void 0, void 0, void 0, function () {
                            var result;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, options.upload(encWriteStream, { fileEncSha256B64: fileEncSha256B64, mediaType: mediaType, timeoutMs: options.mediaUploadTimeoutMs })];
                                    case 1:
                                        result = _a.sent();
                                        logger === null || logger === void 0 ? void 0 : logger.debug('uploaded media');
                                        return [2 /*return*/, result];
                                }
                            });
                        }); })(),
                        (function () { return __awaiter(void 0, void 0, void 0, function () {
                            var _a, _b, error_1;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        _c.trys.push([0, 5, , 6]);
                                        if (!requiresThumbnailComputation) return [3 /*break*/, 2];
                                        _a = uploadData;
                                        return [4 /*yield*/, (0, messages_media_1.generateThumbnail)(bodyPath, mediaType, options)];
                                    case 1:
                                        _a.jpegThumbnail = _c.sent();
                                        logger === null || logger === void 0 ? void 0 : logger.debug('generated thumbnail');
                                        _c.label = 2;
                                    case 2:
                                        if (!requiresDurationComputation) return [3 /*break*/, 4];
                                        _b = uploadData;
                                        return [4 /*yield*/, (0, messages_media_1.getAudioDuration)(bodyPath)];
                                    case 3:
                                        _b.seconds = _c.sent();
                                        logger === null || logger === void 0 ? void 0 : logger.debug('computed audio duration');
                                        _c.label = 4;
                                    case 4: return [3 /*break*/, 6];
                                    case 5:
                                        error_1 = _c.sent();
                                        logger === null || logger === void 0 ? void 0 : logger.warn({ trace: error_1.stack }, 'failed to obtain extra info');
                                        return [3 /*break*/, 6];
                                    case 6: return [2 /*return*/];
                                }
                            });
                        }); })(),
                    ])["finally"](function () { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    encWriteStream.destroy();
                                    if (!(didSaveToTmpPath && bodyPath)) return [3 /*break*/, 2];
                                    return [4 /*yield*/, fs_1.promises.unlink(bodyPath)];
                                case 1:
                                    _a.sent();
                                    logger === null || logger === void 0 ? void 0 : logger.debug('removed tmp files');
                                    _a.label = 2;
                                case 2: return [2 /*return*/];
                            }
                        });
                    }); })];
            case 2:
                _b = (_d.sent())[0], mediaUrl = _b.mediaUrl, directPath = _b.directPath;
                delete uploadData.media;
                obj = Types_1.WAProto.Message.fromObject((_c = {},
                    _c["".concat(mediaType, "Message")] = MessageTypeProto[mediaType].fromObject(__assign({ url: mediaUrl, directPath: directPath, mediaKey: mediaKey, fileEncSha256: fileEncSha256, fileSha256: fileSha256, fileLength: fileLength, mediaKeyTimestamp: (0, generics_1.unixTimestampSeconds)() }, uploadData)),
                    _c));
                if (cacheableKey) {
                    logger.debug({ cacheableKey: cacheableKey }, 'set cache');
                    options.mediaCache.set(cacheableKey, Types_1.WAProto.Message.encode(obj).finish());
                }
                return [2 /*return*/, obj];
        }
    });
}); };
exports.prepareWAMessageMedia = prepareWAMessageMedia;
var prepareDisappearingMessageSettingContent = function (ephemeralExpiration) {
    ephemeralExpiration = ephemeralExpiration || 0;
    var content = {
        ephemeralMessage: {
            message: {
                protocolMessage: {
                    type: Types_1.WAProto.ProtocolMessage.ProtocolMessageType.EPHEMERAL_SETTING,
                    ephemeralExpiration: ephemeralExpiration
                }
            }
        }
    };
    return Types_1.WAProto.Message.fromObject(content);
};
exports.prepareDisappearingMessageSettingContent = prepareDisappearingMessageSettingContent;
/**
 * Generate forwarded message content like WA does
 * @param message the message to forward
 * @param options.forceForward will show the message as forwarded even if it is from you
 */
var generateForwardMessageContent = function (message, forceForward) {
    var _a;
    var content = message.message;
    if (!content) {
        throw new boom_1.Boom('no content in message', { statusCode: 400 });
    }
    // hacky copy
    content = (0, exports.normalizeMessageContent)(message.message);
    content = WAProto_1.proto.Message.decode(WAProto_1.proto.Message.encode(content).finish());
    var key = Object.keys(content)[0];
    var score = ((_a = content[key].contextInfo) === null || _a === void 0 ? void 0 : _a.forwardingScore) || 0;
    score += message.key.fromMe && !forceForward ? 0 : 1;
    if (key === 'conversation') {
        content.extendedTextMessage = { text: content[key] };
        delete content.conversation;
        key = 'extendedTextMessage';
    }
    if (score > 0) {
        content[key].contextInfo = { forwardingScore: score, isForwarded: true };
    }
    else {
        content[key].contextInfo = {};
    }
    return content;
};
exports.generateForwardMessageContent = generateForwardMessageContent;
var generateWAMessageContent = function (message, options) { return __awaiter(void 0, void 0, void 0, function () {
    var m, extContent, data, error_2, contactLen, exp, buttonsMessage, type, templateMessage, listMessage, messageType;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                m = {};
                if (!('text' in message)) return [3 /*break*/, 5];
                extContent = __assign({}, message);
                if (!(!!options.getUrlInfo && message.text.match(Defaults_1.URL_REGEX))) return [3 /*break*/, 4];
                _c.label = 1;
            case 1:
                _c.trys.push([1, 3, , 4]);
                return [4 /*yield*/, options.getUrlInfo(message.text)];
            case 2:
                data = _c.sent();
                extContent.canonicalUrl = data['canonical-url'];
                extContent.matchedText = data['matched-text'];
                extContent.jpegThumbnail = data.jpegThumbnail;
                extContent.description = data.description;
                extContent.title = data.title;
                extContent.previewType = 0;
                return [3 /*break*/, 4];
            case 3:
                error_2 = _c.sent();
                (_a = options.logger) === null || _a === void 0 ? void 0 : _a.warn({ trace: error_2.stack }, 'url generation failed');
                return [3 /*break*/, 4];
            case 4:
                m.extendedTextMessage = extContent;
                return [3 /*break*/, 13];
            case 5:
                if (!('contacts' in message)) return [3 /*break*/, 6];
                contactLen = message.contacts.contacts.length;
                if (!contactLen) {
                    throw new boom_1.Boom('require atleast 1 contact', { statusCode: 400 });
                }
                if (contactLen === 1) {
                    m.contactMessage = Types_1.WAProto.ContactMessage.fromObject(message.contacts.contacts[0]);
                }
                else {
                    m.contactsArrayMessage = Types_1.WAProto.ContactsArrayMessage.fromObject(message.contacts);
                }
                return [3 /*break*/, 13];
            case 6:
                if (!('location' in message)) return [3 /*break*/, 7];
                m.locationMessage = Types_1.WAProto.LocationMessage.fromObject(message.location);
                return [3 /*break*/, 13];
            case 7:
                if (!('react' in message)) return [3 /*break*/, 8];
                m.reactionMessage = Types_1.WAProto.ReactionMessage.fromObject(message.react);
                return [3 /*break*/, 13];
            case 8:
                if (!('delete' in message)) return [3 /*break*/, 9];
                m.protocolMessage = {
                    key: message["delete"],
                    type: Types_1.WAProto.ProtocolMessage.ProtocolMessageType.REVOKE
                };
                return [3 /*break*/, 13];
            case 9:
                if (!('forward' in message)) return [3 /*break*/, 10];
                m = (0, exports.generateForwardMessageContent)(message.forward, message.force);
                return [3 /*break*/, 13];
            case 10:
                if (!('disappearingMessagesInChat' in message)) return [3 /*break*/, 11];
                exp = typeof message.disappearingMessagesInChat === 'boolean' ?
                    (message.disappearingMessagesInChat ? Defaults_1.WA_DEFAULT_EPHEMERAL : 0) :
                    message.disappearingMessagesInChat;
                m = (0, exports.prepareDisappearingMessageSettingContent)(exp);
                return [3 /*break*/, 13];
            case 11: return [4 /*yield*/, (0, exports.prepareWAMessageMedia)(message, options)];
            case 12:
                m = _c.sent();
                _c.label = 13;
            case 13:
                if ('buttons' in message && !!message.buttons) {
                    buttonsMessage = {
                        buttons: message.buttons.map(function (b) { return (__assign(__assign({}, b), { type: WAProto_1.proto.Button.ButtonType.RESPONSE })); })
                    };
                    if ('text' in message) {
                        buttonsMessage.contentText = message.text;
                        buttonsMessage.headerType = ButtonType.EMPTY;
                    }
                    else {
                        if ('caption' in message) {
                            buttonsMessage.contentText = message.caption;
                        }
                        type = Object.keys(m)[0].replace('Message', '').toUpperCase();
                        buttonsMessage.headerType = ButtonType[type];
                        Object.assign(buttonsMessage, m);
                    }
                    if ('footer' in message && !!message.footer) {
                        buttonsMessage.footerText = message.footer;
                    }
                    m = { buttonsMessage: buttonsMessage };
                }
                else if ('templateButtons' in message && !!message.templateButtons) {
                    templateMessage = {
                        hydratedTemplate: {
                            hydratedButtons: message.templateButtons
                        }
                    };
                    if ('text' in message) {
                        templateMessage.hydratedTemplate.hydratedContentText = message.text;
                    }
                    else {
                        if ('caption' in message) {
                            templateMessage.hydratedTemplate.hydratedContentText = message.caption;
                        }
                        Object.assign(templateMessage.hydratedTemplate, m);
                    }
                    if ('footer' in message && !!message.footer) {
                        templateMessage.hydratedTemplate.hydratedFooterText = message.footer;
                    }
                    m = { templateMessage: templateMessage };
                }
                if ('sections' in message && !!message.sections) {
                    listMessage = {
                        sections: message.sections,
                        buttonText: message.buttonText,
                        title: message.title,
                        footerText: message.footer,
                        description: message.text,
                        listType: WAProto_1.proto.ListMessage.ListMessageListType['SINGLE_SELECT']
                    };
                    m = { listMessage: listMessage };
                }
                if ('viewOnce' in message && !!message.viewOnce) {
                    m = { viewOnceMessage: { message: m } };
                }
                if ('mentions' in message && ((_b = message.mentions) === null || _b === void 0 ? void 0 : _b.length)) {
                    messageType = Object.keys(m)[0];
                    m[messageType].contextInfo = m[messageType] || {};
                    m[messageType].contextInfo.mentionedJid = message.mentions;
                }
                return [2 /*return*/, Types_1.WAProto.Message.fromObject(m)];
        }
    });
}); };
exports.generateWAMessageContent = generateWAMessageContent;
var generateWAMessageFromContent = function (jid, message, options) {
    if (!options.timestamp) {
        options.timestamp = new Date();
    } // set timestamp to now
    var key = Object.keys(message)[0];
    var timestamp = (0, generics_1.unixTimestampSeconds)(options.timestamp);
    var quoted = options.quoted, userJid = options.userJid;
    if (quoted) {
        var participant = quoted.key.fromMe ? userJid : (quoted.participant || quoted.key.participant || quoted.key.remoteJid);
        message[key].contextInfo = message[key].contextInfo || {};
        message[key].contextInfo.participant = participant;
        message[key].contextInfo.stanzaId = quoted.key.id;
        message[key].contextInfo.quotedMessage = quoted.message;
        // if a participant is quoted, then it must be a group
        // hence, remoteJid of group must also be entered
        if (quoted.key.participant || quoted.participant) {
            message[key].contextInfo.remoteJid = quoted.key.remoteJid;
        }
    }
    if (
    // if we want to send a disappearing message
    !!(options === null || options === void 0 ? void 0 : options.ephemeralExpiration) &&
        // and it's not a protocol message -- delete, toggle disappear message
        key !== 'protocolMessage' &&
        // already not converted to disappearing message
        key !== 'ephemeralMessage') {
        message[key].contextInfo = __assign(__assign({}, (message[key].contextInfo || {})), { expiration: options.ephemeralExpiration || Defaults_1.WA_DEFAULT_EPHEMERAL });
        message = {
            ephemeralMessage: {
                message: message
            }
        };
    }
    message = Types_1.WAProto.Message.fromObject(message);
    var messageJSON = {
        key: {
            remoteJid: jid,
            fromMe: true,
            id: (options === null || options === void 0 ? void 0 : options.messageId) || (0, generics_1.generateMessageID)()
        },
        message: message,
        messageTimestamp: timestamp,
        messageStubParameters: [],
        participant: jid.includes('@g.us') ? userJid : undefined,
        status: Types_1.WAMessageStatus.PENDING
    };
    return Types_1.WAProto.WebMessageInfo.fromObject(messageJSON);
};
exports.generateWAMessageFromContent = generateWAMessageFromContent;
var generateWAMessage = function (jid, content, options) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                // ensure msg ID is with every log
                options.logger = (_c = options === null || options === void 0 ? void 0 : options.logger) === null || _c === void 0 ? void 0 : _c.child({ msgId: options.messageId });
                _a = exports.generateWAMessageFromContent;
                _b = [jid];
                return [4 /*yield*/, (0, exports.generateWAMessageContent)(content, options)];
            case 1: return [2 /*return*/, _a.apply(void 0, _b.concat([_d.sent(), options]))];
        }
    });
}); };
exports.generateWAMessage = generateWAMessage;
/** Get the key to access the true type of content */
var getContentType = function (content) {
    if (content) {
        var keys = Object.keys(content);
        var key = keys.find(function (k) { return (k === 'conversation' || k.endsWith('Message')) && k !== 'senderKeyDistributionMessage'; });
        return key;
    }
};
exports.getContentType = getContentType;
/**
 * Normalizes ephemeral, view once messages to regular message content
 * Eg. image messages in ephemeral messages, in view once messages etc.
 * @param content
 * @returns
 */
var normalizeMessageContent = function (content) {
    var _a, _b, _c, _d, _e;
    content = ((_c = (_b = (_a = content === null || content === void 0 ? void 0 : content.ephemeralMessage) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.viewOnceMessage) === null || _c === void 0 ? void 0 : _c.message) ||
        ((_d = content === null || content === void 0 ? void 0 : content.ephemeralMessage) === null || _d === void 0 ? void 0 : _d.message) ||
        ((_e = content === null || content === void 0 ? void 0 : content.viewOnceMessage) === null || _e === void 0 ? void 0 : _e.message) ||
        content ||
        undefined;
    return content;
};
exports.normalizeMessageContent = normalizeMessageContent;
/**
 * Extract the true message content from a message
 * Eg. extracts the inner message from a disappearing message/view once message
 */
var extractMessageContent = function (content) {
    var _a, _b, _c, _d, _e, _f;
    var extractFromTemplateMessage = function (msg) {
        if (msg.imageMessage) {
            return { imageMessage: msg.imageMessage };
        }
        else if (msg.documentMessage) {
            return { documentMessage: msg.documentMessage };
        }
        else if (msg.videoMessage) {
            return { videoMessage: msg.videoMessage };
        }
        else if (msg.locationMessage) {
            return { locationMessage: msg.locationMessage };
        }
        else {
            return { conversation: 'contentText' in msg ? msg.contentText : ('hydratedContentText' in msg ? msg.hydratedContentText : '') };
        }
    };
    content = (0, exports.normalizeMessageContent)(content);
    if (content === null || content === void 0 ? void 0 : content.buttonsMessage) {
        return extractFromTemplateMessage(content.buttonsMessage);
    }
    if ((_a = content === null || content === void 0 ? void 0 : content.templateMessage) === null || _a === void 0 ? void 0 : _a.hydratedFourRowTemplate) {
        return extractFromTemplateMessage((_b = content === null || content === void 0 ? void 0 : content.templateMessage) === null || _b === void 0 ? void 0 : _b.hydratedFourRowTemplate);
    }
    if ((_c = content === null || content === void 0 ? void 0 : content.templateMessage) === null || _c === void 0 ? void 0 : _c.hydratedTemplate) {
        return extractFromTemplateMessage((_d = content === null || content === void 0 ? void 0 : content.templateMessage) === null || _d === void 0 ? void 0 : _d.hydratedTemplate);
    }
    if ((_e = content === null || content === void 0 ? void 0 : content.templateMessage) === null || _e === void 0 ? void 0 : _e.fourRowTemplate) {
        return extractFromTemplateMessage((_f = content === null || content === void 0 ? void 0 : content.templateMessage) === null || _f === void 0 ? void 0 : _f.fourRowTemplate);
    }
    return content;
};
exports.extractMessageContent = extractMessageContent;
/**
 * Returns the device predicted by message ID
 */
var getDevice = function (id) {
    var deviceType = id.length > 21 ? 'android' : id.substring(0, 2) === '3A' ? 'ios' : 'web';
    return deviceType;
};
exports.getDevice = getDevice;
/** Upserts a receipt in the message */
var updateMessageWithReceipt = function (msg, receipt) {
    msg.userReceipt = msg.userReceipt || [];
    var recp = msg.userReceipt.find(function (m) { return m.userJid === receipt.userJid; });
    if (recp) {
        Object.assign(recp, receipt);
    }
    else {
        msg.userReceipt.push(receipt);
    }
};
exports.updateMessageWithReceipt = updateMessageWithReceipt;
/** Given a list of message keys, aggregates them by chat & sender. Useful for sending read receipts in bulk */
var aggregateMessageKeysNotFromMe = function (keys) {
    var keyMap = {};
    for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
        var _a = keys_1[_i], remoteJid = _a.remoteJid, id = _a.id, participant = _a.participant, fromMe = _a.fromMe;
        if (!fromMe) {
            var uqKey = "".concat(remoteJid, ":").concat(participant || '');
            if (!keyMap[uqKey]) {
                keyMap[uqKey] = {
                    jid: remoteJid,
                    participant: participant,
                    messageIds: []
                };
            }
            keyMap[uqKey].messageIds.push(id);
        }
    }
    return Object.values(keyMap);
};
exports.aggregateMessageKeysNotFromMe = aggregateMessageKeysNotFromMe;
/**
 * Downloads the given message. Throws an error if it's not a media message
 */
var downloadMediaMessage = function (message, type, options) { return __awaiter(void 0, void 0, void 0, function () {
    var mContent, contentType, mediaType, media, stream, buffer, stream_1, stream_1_1, chunk, e_1_1;
    var e_1, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                mContent = (0, exports.extractMessageContent)(message.message);
                if (!mContent) {
                    throw new boom_1.Boom('No message present', { statusCode: 400, data: message });
                }
                contentType = (0, exports.getContentType)(mContent);
                mediaType = contentType.replace('Message', '');
                media = mContent[contentType];
                if (typeof media !== 'object' || !('url' in media)) {
                    throw new boom_1.Boom("\"".concat(contentType, "\" message is not a media message"));
                }
                return [4 /*yield*/, (0, messages_media_1.downloadContentFromMessage)(media, mediaType, options)];
            case 1:
                stream = _b.sent();
                if (!(type === 'buffer')) return [3 /*break*/, 14];
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
            case 14: return [2 /*return*/, stream];
        }
    });
}); };
exports.downloadMediaMessage = downloadMediaMessage;

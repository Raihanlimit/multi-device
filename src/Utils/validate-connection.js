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
exports.configureSuccessfulPairing = exports.generateRegistrationNode = exports.generateLoginNode = void 0;
var boom_1 = require("@hapi/boom");
var crypto_1 = require("crypto");
var WAProto_1 = require("../../WAProto");
var WABinary_1 = require("../WABinary");
var crypto_2 = require("./crypto");
var generics_1 = require("./generics");
var signal_1 = require("./signal");
var getUserAgent = function (_a) {
    var version = _a.version;
    return ({
        appVersion: {
            primary: version[0],
            secondary: version[1],
            tertiary: version[2]
        },
        platform: WAProto_1.proto.UserAgent.UserAgentPlatform.WEB,
        releaseChannel: WAProto_1.proto.UserAgent.UserAgentReleaseChannel.RELEASE,
        mcc: '000',
        mnc: '000',
        osVersion: '0.1',
        manufacturer: '',
        device: 'Desktop',
        osBuildNumber: '0.1',
        localeLanguageIso6391: 'en',
        localeCountryIso31661Alpha2: 'US'
    });
};
var getWebInfo = function () { return ({
    webSubPlatform: WAProto_1.proto.WebInfo.WebInfoWebSubPlatform.WEB_BROWSER
}); };
var getClientPayload = function (config) {
    return {
        passive: true,
        connectType: WAProto_1.proto.ClientPayload.ClientPayloadConnectType.WIFI_UNKNOWN,
        connectReason: WAProto_1.proto.ClientPayload.ClientPayloadConnectReason.USER_ACTIVATED,
        userAgent: getUserAgent(config),
        webInfo: getWebInfo()
    };
};
var generateLoginNode = function (userJid, config) {
    var _a = (0, WABinary_1.jidDecode)(userJid), user = _a.user, device = _a.device;
    var payload = __assign(__assign({}, getClientPayload(config)), { username: +user, device: device });
    return WAProto_1.proto.ClientPayload.fromObject(payload);
};
exports.generateLoginNode = generateLoginNode;
var generateRegistrationNode = function (_a, config) {
    var registrationId = _a.registrationId, signedPreKey = _a.signedPreKey, signedIdentityKey = _a.signedIdentityKey;
    // the app version needs to be md5 hashed
    // and passed in
    var appVersionBuf = (0, crypto_1.createHash)('md5')
        .update(config.version.join('.')) // join as string
        .digest();
    var browserVersion = config.browser[2].split('.');
    var companion = {
        os: config.browser[0],
        version: {
            primary: +(browserVersion[0] || 10),
            secondary: +(browserVersion[1] || 0),
            tertiary: +(browserVersion[2] || 0)
        },
        platformType: WAProto_1.proto.CompanionProps.CompanionPropsPlatformType[config.browser[1].toUpperCase()] || WAProto_1.proto.CompanionProps.CompanionPropsPlatformType.CHROME,
        requireFullSync: false
    };
    var companionProto = WAProto_1.proto.CompanionProps.encode(companion).finish();
    var registerPayload = __assign(__assign({}, getClientPayload(config)), { regData: {
            buildHash: appVersionBuf,
            companionProps: companionProto,
            eRegid: (0, generics_1.encodeInt)(4, registrationId),
            eKeytype: (0, generics_1.encodeInt)(1, 5),
            eIdent: signedIdentityKey.public,
            eSkeyId: (0, generics_1.encodeInt)(3, signedPreKey.keyId),
            eSkeyVal: signedPreKey.keyPair.public,
            eSkeySig: signedPreKey.signature
        } });
    return WAProto_1.proto.ClientPayload.fromObject(registerPayload);
};
exports.generateRegistrationNode = generateRegistrationNode;
var configureSuccessfulPairing = function (stanza, _a) {
    var _b, _c, _d, _e, _f;
    var advSecretKey = _a.advSecretKey, signedIdentityKey = _a.signedIdentityKey, signalIdentities = _a.signalIdentities;
    var pair = (0, WABinary_1.getAllBinaryNodeChildren)(stanza)[0];
    var pairContent = Array.isArray(pair.content) ? pair.content : [];
    var msgId = stanza.attrs.id;
    var deviceIdentity = (_b = pairContent.find(function (m) { return m.tag === 'device-identity'; })) === null || _b === void 0 ? void 0 : _b.content;
    var businessName = (_d = (_c = pairContent.find(function (m) { return m.tag === 'biz'; })) === null || _c === void 0 ? void 0 : _c.attrs) === null || _d === void 0 ? void 0 : _d.name;
    var verifiedName = businessName || '';
    var jid = (_f = (_e = pairContent.find(function (m) { return m.tag === 'device'; })) === null || _e === void 0 ? void 0 : _e.attrs) === null || _f === void 0 ? void 0 : _f.jid;
    var _g = WAProto_1.proto.ADVSignedDeviceIdentityHMAC.decode(deviceIdentity), details = _g.details, hmac = _g.hmac;
    var advSign = (0, crypto_2.hmacSign)(details, Buffer.from(advSecretKey, 'base64'));
    if (Buffer.compare(hmac, advSign) !== 0) {
        throw new boom_1.Boom('Invalid pairing');
    }
    var account = WAProto_1.proto.ADVSignedDeviceIdentity.decode(details);
    var accountSignatureKey = account.accountSignatureKey, accountSignature = account.accountSignature;
    var accountMsg = Buffer.concat([
        Buffer.from([6, 0]),
        account.details,
        signedIdentityKey.public
    ]);
    if (!crypto_2.Curve.verify(accountSignatureKey, accountMsg, accountSignature)) {
        throw new boom_1.Boom('Failed to verify account signature');
    }
    var deviceMsg = Buffer.concat([
        new Uint8Array([6, 1]),
        account.details,
        signedIdentityKey.public,
        account.accountSignatureKey
    ]);
    account.deviceSignature = crypto_2.Curve.sign(signedIdentityKey.private, deviceMsg);
    var identity = (0, signal_1.createSignalIdentity)(jid, accountSignatureKey);
    var keyIndex = WAProto_1.proto.ADVDeviceIdentity.decode(account.details).keyIndex;
    var accountEnc = WAProto_1.proto.ADVSignedDeviceIdentity.encode(__assign(__assign({}, account.toJSON()), { accountSignatureKey: undefined })).finish();
    var reply = {
        tag: 'iq',
        attrs: {
            to: WABinary_1.S_WHATSAPP_NET,
            type: 'result',
            id: msgId
        },
        content: [
            {
                tag: 'pair-device-sign',
                attrs: {},
                content: [
                    {
                        tag: 'device-identity',
                        attrs: { 'key-index': "".concat(keyIndex) },
                        content: accountEnc
                    }
                ]
            }
        ]
    };
    var authUpdate = {
        account: account,
        me: { id: jid, verifiedName: verifiedName },
        signalIdentities: __spreadArray(__spreadArray([], (signalIdentities || []), true), [identity], false)
    };
    return {
        creds: authUpdate,
        reply: reply
    };
};
exports.configureSuccessfulPairing = configureSuccessfulPairing;

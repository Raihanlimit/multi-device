"use strict";
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
exports.decodeBinaryNodeLegacy = exports.encodeBinaryNodeLegacy = exports.isLegacyBinaryNode = void 0;
var constants_1 = require("./constants");
var isLegacyBinaryNode = function (buffer) {
    switch (buffer[0]) {
        case constants_1.Tags.LIST_EMPTY:
        case constants_1.Tags.LIST_8:
        case constants_1.Tags.LIST_16:
            return true;
        default:
            return false;
    }
};
exports.isLegacyBinaryNode = isLegacyBinaryNode;
function decode(buffer, indexRef) {
    var checkEOS = function (length) {
        if (indexRef.index + length > buffer.length) {
            throw new Error('end of stream');
        }
    };
    var next = function () {
        var value = buffer[indexRef.index];
        indexRef.index += 1;
        return value;
    };
    var readByte = function () {
        checkEOS(1);
        return next();
    };
    var readStringFromChars = function (length) {
        checkEOS(length);
        var value = buffer.slice(indexRef.index, indexRef.index + length);
        indexRef.index += length;
        return value.toString('utf-8');
    };
    var readBytes = function (n) {
        checkEOS(n);
        var value = buffer.slice(indexRef.index, indexRef.index + n);
        indexRef.index += n;
        return value;
    };
    var readInt = function (n, littleEndian) {
        if (littleEndian === void 0) { littleEndian = false; }
        checkEOS(n);
        var val = 0;
        for (var i = 0; i < n; i++) {
            var shift = littleEndian ? i : n - 1 - i;
            val |= next() << (shift * 8);
        }
        return val;
    };
    var readInt20 = function () {
        checkEOS(3);
        return ((next() & 15) << 16) + (next() << 8) + next();
    };
    var unpackHex = function (value) {
        if (value >= 0 && value < 16) {
            return value < 10 ? '0'.charCodeAt(0) + value : 'A'.charCodeAt(0) + value - 10;
        }
        throw new Error('invalid hex: ' + value);
    };
    var unpackNibble = function (value) {
        if (value >= 0 && value <= 9) {
            return '0'.charCodeAt(0) + value;
        }
        switch (value) {
            case 10:
                return '-'.charCodeAt(0);
            case 11:
                return '.'.charCodeAt(0);
            case 15:
                return '\0'.charCodeAt(0);
            default:
                throw new Error('invalid nibble: ' + value);
        }
    };
    var unpackByte = function (tag, value) {
        if (tag === constants_1.Tags.NIBBLE_8) {
            return unpackNibble(value);
        }
        else if (tag === constants_1.Tags.HEX_8) {
            return unpackHex(value);
        }
        else {
            throw new Error('unknown tag: ' + tag);
        }
    };
    var readPacked8 = function (tag) {
        var startByte = readByte();
        var value = '';
        for (var i = 0; i < (startByte & 127); i++) {
            var curByte = readByte();
            value += String.fromCharCode(unpackByte(tag, (curByte & 0xf0) >> 4));
            value += String.fromCharCode(unpackByte(tag, curByte & 0x0f));
        }
        if (startByte >> 7 !== 0) {
            value = value.slice(0, -1);
        }
        return value;
    };
    var isListTag = function (tag) {
        return tag === constants_1.Tags.LIST_EMPTY || tag === constants_1.Tags.LIST_8 || tag === constants_1.Tags.LIST_16;
    };
    var readListSize = function (tag) {
        switch (tag) {
            case constants_1.Tags.LIST_EMPTY:
                return 0;
            case constants_1.Tags.LIST_8:
                return readByte();
            case constants_1.Tags.LIST_16:
                return readInt(2);
            default:
                throw new Error('invalid tag for list size: ' + tag);
        }
    };
    var getToken = function (index) {
        if (index < 3 || index >= constants_1.SingleByteTokens.length) {
            throw new Error('invalid token index: ' + index);
        }
        return constants_1.SingleByteTokens[index];
    };
    var readString = function (tag) {
        if (tag >= 3 && tag <= 235) {
            var token = getToken(tag);
            return token; // === 's.whatsapp.net' ? 'c.us' : token
        }
        switch (tag) {
            case constants_1.Tags.DICTIONARY_0:
            case constants_1.Tags.DICTIONARY_1:
            case constants_1.Tags.DICTIONARY_2:
            case constants_1.Tags.DICTIONARY_3:
                return getTokenDouble(tag - constants_1.Tags.DICTIONARY_0, readByte());
            case constants_1.Tags.LIST_EMPTY:
                return null;
            case constants_1.Tags.BINARY_8:
                return readStringFromChars(readByte());
            case constants_1.Tags.BINARY_20:
                return readStringFromChars(readInt20());
            case constants_1.Tags.BINARY_32:
                return readStringFromChars(readInt(4));
            case constants_1.Tags.JID_PAIR:
                var i = readString(readByte());
                var j = readString(readByte());
                if (typeof i === 'string' && j) {
                    return i + '@' + j;
                }
                throw new Error('invalid jid pair: ' + i + ', ' + j);
            case constants_1.Tags.HEX_8:
            case constants_1.Tags.NIBBLE_8:
                return readPacked8(tag);
            default:
                throw new Error('invalid string with tag: ' + tag);
        }
    };
    var readList = function (tag) { return (__spreadArray([], new Array(readListSize(tag)), true).map(function () { return decode(buffer, indexRef); })); };
    var getTokenDouble = function (index1, index2) {
        var n = 256 * index1 + index2;
        if (n < 0 || n > constants_1.DoubleByteTokens.length) {
            throw new Error('invalid double token index: ' + n);
        }
        return constants_1.DoubleByteTokens[n];
    };
    var listSize = readListSize(readByte());
    var descrTag = readByte();
    if (descrTag === constants_1.Tags.STREAM_END) {
        throw new Error('unexpected stream end');
    }
    var header = readString(descrTag);
    var attrs = {};
    var data;
    if (listSize === 0 || !header) {
        throw new Error('invalid node');
    }
    // read the attributes in
    var attributesLength = (listSize - 1) >> 1;
    for (var i = 0; i < attributesLength; i++) {
        var key = readString(readByte());
        var b = readByte();
        attrs[key] = readString(b);
    }
    if (listSize % 2 === 0) {
        var tag = readByte();
        if (isListTag(tag)) {
            data = readList(tag);
        }
        else {
            var decoded = void 0;
            switch (tag) {
                case constants_1.Tags.BINARY_8:
                    decoded = readBytes(readByte());
                    break;
                case constants_1.Tags.BINARY_20:
                    decoded = readBytes(readInt20());
                    break;
                case constants_1.Tags.BINARY_32:
                    decoded = readBytes(readInt(4));
                    break;
                default:
                    decoded = readString(tag);
                    break;
            }
            data = decoded;
        }
    }
    return {
        tag: header,
        attrs: attrs,
        content: data
    };
}
var encode = function (_a, buffer) {
    var tag = _a.tag, attrs = _a.attrs, content = _a.content;
    if (buffer === void 0) { buffer = []; }
    var pushByte = function (value) { return buffer.push(value & 0xff); };
    var pushInt = function (value, n, littleEndian) {
        if (littleEndian === void 0) { littleEndian = false; }
        for (var i = 0; i < n; i++) {
            var curShift = littleEndian ? i : n - 1 - i;
            buffer.push((value >> (curShift * 8)) & 0xff);
        }
    };
    var pushBytes = function (bytes) { return (bytes.forEach(function (b) { return buffer.push(b); })); };
    var pushInt20 = function (value) { return (pushBytes([(value >> 16) & 0x0f, (value >> 8) & 0xff, value & 0xff])); };
    var writeByteLength = function (length) {
        if (length >= 4294967296) {
            throw new Error('string too large to encode: ' + length);
        }
        if (length >= 1 << 20) {
            pushByte(constants_1.Tags.BINARY_32);
            pushInt(length, 4); // 32 bit integer
        }
        else if (length >= 256) {
            pushByte(constants_1.Tags.BINARY_20);
            pushInt20(length);
        }
        else {
            pushByte(constants_1.Tags.BINARY_8);
            pushByte(length);
        }
    };
    var writeStringRaw = function (str) {
        var bytes = Buffer.from(str, 'utf-8');
        writeByteLength(bytes.length);
        pushBytes(bytes);
    };
    var writeToken = function (token) {
        if (token < 245) {
            pushByte(token);
        }
        else if (token <= 500) {
            throw new Error('invalid token');
        }
    };
    var writeString = function (token, i) {
        if (token === 'c.us') {
            token = 's.whatsapp.net';
        }
        var tokenIndex = constants_1.SingleByteTokens.indexOf(token);
        if (!i && token === 's.whatsapp.net') {
            writeToken(tokenIndex);
        }
        else if (tokenIndex >= 0) {
            if (tokenIndex < constants_1.Tags.SINGLE_BYTE_MAX) {
                writeToken(tokenIndex);
            }
            else {
                var overflow = tokenIndex - constants_1.Tags.SINGLE_BYTE_MAX;
                var dictionaryIndex = overflow >> 8;
                if (dictionaryIndex < 0 || dictionaryIndex > 3) {
                    throw new Error('double byte dict token out of range: ' + token + ', ' + tokenIndex);
                }
                writeToken(constants_1.Tags.DICTIONARY_0 + dictionaryIndex);
                writeToken(overflow % 256);
            }
        }
        else if (token) {
            var jidSepIndex = token.indexOf('@');
            if (jidSepIndex <= 0) {
                writeStringRaw(token);
            }
            else {
                writeJid(token.slice(0, jidSepIndex), token.slice(jidSepIndex + 1, token.length));
            }
        }
    };
    var writeJid = function (left, right) {
        pushByte(constants_1.Tags.JID_PAIR);
        left && left.length > 0 ? writeString(left) : writeToken(constants_1.Tags.LIST_EMPTY);
        writeString(right);
    };
    var writeListStart = function (listSize) {
        if (listSize === 0) {
            pushByte(constants_1.Tags.LIST_EMPTY);
        }
        else if (listSize < 256) {
            pushBytes([constants_1.Tags.LIST_8, listSize]);
        }
        else {
            pushBytes([constants_1.Tags.LIST_16, listSize]);
        }
    };
    var validAttributes = Object.keys(attrs).filter(function (k) { return (typeof attrs[k] !== 'undefined' && attrs[k] !== null); });
    writeListStart(2 * validAttributes.length + 1 + (typeof content !== 'undefined' && content !== null ? 1 : 0));
    writeString(tag);
    validAttributes.forEach(function (key) {
        if (typeof attrs[key] === 'string') {
            writeString(key);
            writeString(attrs[key]);
        }
    });
    if (typeof content === 'string') {
        writeString(content, true);
    }
    else if (Buffer.isBuffer(content)) {
        writeByteLength(content.length);
        pushBytes(content);
    }
    else if (Array.isArray(content)) {
        writeListStart(content.length);
        for (var _i = 0, content_1 = content; _i < content_1.length; _i++) {
            var item = content_1[_i];
            if (item) {
                encode(item, buffer);
            }
        }
    }
    else if (typeof content === 'undefined' || content === null) {
    }
    else {
        throw new Error("invalid children for header \"".concat(tag, "\": ").concat(content, " (").concat(typeof content, ")"));
    }
    return Buffer.from(buffer);
};
exports.encodeBinaryNodeLegacy = encode;
exports.decodeBinaryNodeLegacy = decode;

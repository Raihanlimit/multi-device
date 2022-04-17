"use strict";
exports.__esModule = true;
exports.LT_HASH_ANTI_TAMPERING = void 0;
var crypto_1 = require("./crypto");
/**
 * LT Hash is a summation based hash algorithm that maintains the integrity of a piece of data
 * over a series of mutations. You can add/remove mutations and it'll return a hash equal to
 * if the same series of mutations was made sequentially.
 */
var o = 128;
var d = /** @class */ (function () {
    function d(e) {
        this.salt = e;
    }
    d.prototype.add = function (e, t) {
        var r = this;
        for (var _i = 0, t_1 = t; _i < t_1.length; _i++) {
            var item = t_1[_i];
            e = r._addSingle(e, item);
        }
        return e;
    };
    d.prototype.subtract = function (e, t) {
        var r = this;
        for (var _i = 0, t_2 = t; _i < t_2.length; _i++) {
            var item = t_2[_i];
            e = r._subtractSingle(e, item);
        }
        return e;
    };
    d.prototype.subtractThenAdd = function (e, t, r) {
        var n = this;
        return n.add(n.subtract(e, r), t);
    };
    d.prototype._addSingle = function (e, t) {
        var r = this;
        var n = new Uint8Array((0, crypto_1.hkdf)(Buffer.from(t), o, { info: r.salt })).buffer;
        return r.performPointwiseWithOverflow(e, n, (function (e, t) { return e + t; }));
    };
    d.prototype._subtractSingle = function (e, t) {
        var r = this;
        var n = new Uint8Array((0, crypto_1.hkdf)(Buffer.from(t), o, { info: r.salt })).buffer;
        return r.performPointwiseWithOverflow(e, n, (function (e, t) { return e - t; }));
    };
    d.prototype.performPointwiseWithOverflow = function (e, t, r) {
        var n = new DataView(e), i = new DataView(t), a = new ArrayBuffer(n.byteLength), s = new DataView(a);
        for (var e_1 = 0; e_1 < n.byteLength; e_1 += 2) {
            s.setUint16(e_1, r(n.getUint16(e_1, !0), i.getUint16(e_1, !0)), !0);
        }
        return a;
    };
    return d;
}());
exports.LT_HASH_ANTI_TAMPERING = new d('WhatsApp Patch Integrity');

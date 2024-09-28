(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function BodyConsumer(context, consumer) {
        return Object.assign(consumer, { context });
    }
    (function (BodyConsumer) {
        function is(consumer) {
            return !!consumer && "context" in consumer;
        }
        BodyConsumer.is = is;
    })(BodyConsumer || (BodyConsumer = {}));
    exports.default = BodyConsumer;
});
//# sourceMappingURL=BodyConsumer.js.map
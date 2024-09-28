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
    exports.allArgs = void 0;
    const args = {};
    const allArgs = [];
    exports.allArgs = allArgs;
    for (let i = 2; i < process.argv.length; i++) {
        const arg = process.argv[i];
        if (arg[0] === "-" && (arg[2] || arg[1] !== "-")) {
            if (arg[1] === "-") {
                args[arg.slice(2)] = process.argv[++i];
                continue;
            }
            args[arg.slice(1)] = true;
            continue;
        }
        allArgs.push(arg);
    }
    exports.default = args;
});
//# sourceMappingURL=args.js.map
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "fs"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = default_1;
    const fs_1 = __importDefault(require("fs"));
    async function default_1(file, data) {
        const stream = fs_1.default.createWriteStream(file);
        let hold = "";
        const awrite = stream.awrite = (chunk, force = false) => new Promise((resolve, reject) => {
            hold += chunk;
            if (hold.length < 8192 && !force)
                return resolve();
            stream.write(hold, err => err ? reject(err) : resolve());
            hold = "";
        });
        await write(stream, data, "");
        if (hold)
            await awrite("", true);
        stream.end();
        stream.close();
    }
    async function write(stream, data, indent) {
        switch (typeof data) {
            case "bigint":
            case "function":
            case "symbol":
            case "undefined":
                throw new Error(`Can't convert ${typeof data} to JSON`);
            case "boolean":
            case "number":
            case "string":
                await stream.awrite(JSON.stringify(data));
                return;
        }
        // data is "object"
        if (data === null) {
            await stream.awrite("null");
            return;
        }
        if (Array.isArray(data)) {
            await stream.awrite("[");
            if (data.length) {
                indent += "\t";
                await stream.awrite(`\n${indent}`);
                for (let i = 0; i < data.length; i++) {
                    await write(stream, data[i], indent);
                    if (i !== data.length - 1)
                        await stream.awrite(`,\n${indent}`);
                }
                indent = indent.slice(0, -1);
                await stream.awrite(`\n${indent}`);
            }
            await stream.awrite("]");
            return;
        }
        const entries = Object.entries(data);
        await stream.awrite("{");
        let hasWrittenKeyVal = false;
        if (entries.length) {
            indent += "\t";
            for (let i = 0; i < entries.length; i++) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const [key, value] = entries[i];
                if (value === undefined)
                    continue;
                await stream.awrite(`${hasWrittenKeyVal ? "," : ""}\n${indent}`);
                hasWrittenKeyVal = true;
                await stream.awrite(`${JSON.stringify(key)}: `);
                await write(stream, value, indent);
            }
            indent = indent.slice(0, -1);
            if (hasWrittenKeyVal)
                await stream.awrite(`\n${indent}`);
        }
        await stream.awrite("}");
    }
});
//# sourceMappingURL=streamJson.js.map
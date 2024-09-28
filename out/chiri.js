#!/usr/bin/env node
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "chokidar", "dotenv", "path", "./ansi", "./args", "./chc/util/prefixError.js", "./chc/util/relToCwd.js", "./constants"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /* eslint-disable @typescript-eslint/no-var-requires */
    const chokidar_1 = __importDefault(require("chokidar"));
    const dotenv_1 = __importDefault(require("dotenv"));
    const path_1 = __importDefault(require("path"));
    const ansi_1 = __importDefault(require("./ansi"));
    const args_1 = __importStar(require("./args"));
    const prefixError_js_1 = __importDefault(require("./chc/util/prefixError.js"));
    const relToCwd_js_1 = __importDefault(require("./chc/util/relToCwd.js"));
    const constants_1 = require("./constants");
    if (process.cwd() === constants_1.PACKAGE_ROOT)
        dotenv_1.default.config();
    Error.stackTraceLimit = Math.max(Error.stackTraceLimit, +process.env.CHIRI_STACK_LENGTH || 4);
    if (process.env.CHIRI_ENV === "dev")
        // eslint-disable-next-line @typescript-eslint/consistent-type-imports
        require("source-map-support").install();
    if (args_1.default.v) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        console.log(require(path_1.default.join(constants_1.PACKAGE_ROOT, "package.json")).version);
        process.exit();
    }
    let compilationPromise = undefined;
    let queuedCompileAll = false;
    let queuedTryCompile = false;
    async function compileAll(files, watch = false) {
        for (const file of files) {
            await (compilationPromise = tryCompile(file));
            compilationPromise = undefined;
            if (watch) {
                console.log(ansi_1.default.label + "watch", ansi_1.default.path + (0, relToCwd_js_1.default)(file), ansi_1.default.reset);
                chokidar_1.default.watch([file, `${file}.chiri`], { ignoreInitial: true })
                    // eslint-disable-next-line @typescript-eslint/no-misused-promises
                    .on("all", async (event, filename) => {
                    if (queuedTryCompile)
                        return; // dedupe
                    queuedTryCompile = true;
                    while (compilationPromise)
                        await compilationPromise;
                    queuedTryCompile = false;
                    console.log(ansi_1.default.label + event, ansi_1.default.path + (0, relToCwd_js_1.default)(filename), ansi_1.default.reset);
                    await (compilationPromise = tryCompile(file));
                    compilationPromise = undefined;
                })
                    .on("error", console.error);
            }
        }
    }
    async function tryCompile(filename) {
        try {
            return compile(filename);
        }
        catch (e) {
            const err = e;
            let message = err.message;
            let stack = err.stack;
            const enomdl = message.startsWith("Cannot find module");
            stack = enomdl ? message.slice(message.indexOf("\n") + 1) : err.stack?.slice(err.stack.indexOf("\n") + 1) ?? "";
            // stack = enomdl ? message.slice(message.indexOf("\n") + 1) : err.stack?.slice(err.stack.indexOf("\n", err.stack.indexOf("\n") + 1)) ?? "";
            message = enomdl ? message.slice(0, message.indexOf("\n") + 1) : message;
            console.error(ansi_1.default.err + message, ansi_1.default.reset + stack);
        }
    }
    async function compile(filename) {
        const start = performance.now();
        for (const key of Object.keys(require.cache))
            if (key.startsWith(constants_1.CHC_ROOT))
                delete require.cache[key];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const rerequire = (path) => require(path).default;
        const ChiriReader = rerequire("./chc/read/ChiriReader.js");
        const reader = await ChiriReader.load(filename);
        if (!reader) {
            console.log(ansi_1.default.err + "Failed to load ChiriReader");
            return;
        }
        const ast = await reader.read();
        if (reader.errored)
            return;
        if (process.env.CHIRI_AST) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const streamJsonFunction = rerequire("./chc/util/streamJson.js");
            await streamJsonFunction(reader.basename + ".ast.json", ast)
                .catch(e => { throw (0, prefixError_js_1.default)(e, "Failed to write AST JSON file"); });
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const ChiriCompilerClass = rerequire("./chc/write/ChiriCompiler.js");
        const compiler = ChiriCompilerClass(ast, reader.basename);
        compiler.compile();
        await compiler.writeFiles();
        const elapsed = performance.now() - start;
        console.log(ansi_1.default.label + "chiri", ansi_1.default.path + (0, relToCwd_js_1.default)(reader.filename), ansi_1.default.label + formatElapsed(elapsed));
    }
    function formatElapsed(elapsed) {
        if (elapsed < 1)
            return `${Math.floor(elapsed * 1_000)} μs`;
        if (elapsed < 1_000)
            return `${Math.floor(elapsed)} ms`;
        if (elapsed < 60_000)
            return `${+(elapsed / 1_000).toFixed(2)} s`;
        return `${+(elapsed / 60_000).toFixed(2)} m`;
    }
    void (async () => {
        const files = args_1.allArgs.map(file => path_1.default.resolve(file));
        await compileAll(files, !!args_1.default.w);
        if (args_1.default.w && process.env.CHIRI_ENV === "dev") {
            let lastQueueAttemptId;
            const debounceTime = 100;
            chokidar_1.default.watch([constants_1.CHC_ROOT, "!**/*.d.ts", constants_1.LIB_ROOT], { ignoreInitial: true })
                .on("all", (event, filename) => {
                if (lastQueueAttemptId)
                    clearTimeout(lastQueueAttemptId);
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                lastQueueAttemptId = setTimeout(queueCompileAll.bind(null, event, filename), debounceTime);
            })
                .on("error", console.error);
        }
        async function queueCompileAll(event, filename) {
            if (queuedCompileAll)
                return; // skip
            queuedCompileAll = true;
            while (compilationPromise)
                await compilationPromise;
            queuedCompileAll = false;
            console.log(ansi_1.default.label + event, ansi_1.default.path + (0, relToCwd_js_1.default)(filename), ansi_1.default.reset);
            await compileAll(files);
        }
    })();
});
//# sourceMappingURL=chiri.js.map
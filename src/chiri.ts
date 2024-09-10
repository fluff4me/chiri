import chokidar from "chokidar";
import dotenv from "dotenv";
import path from "path";
import ansi from "./ansi";
import ChiriReader from "./chc/read/ChiriReader";
import prefixError from "./chc/util/prefixError.js";
import relToCwd from "./chc/util/relToCwd.js";
import streamJson from "./chc/util/streamJson";
import ChiriCompiler from "./chc/write/ChiriCompiler";
import { CHC_ROOT, LIB_ROOT } from "./constants";

dotenv.config();

const args: Record<string, string | true> = {};
const allArgs: string[] = [];

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

let compilationPromise: Promise<any> | undefined = undefined;
let queuedCompileAll = false;
let queuedTryCompile = false;

async function compileAll (files: string[], watch = false) {
	for (const file of files) {
		await (compilationPromise = tryCompile(file));
		compilationPromise = undefined;
		if (watch) {
			console.log(ansi.label + "watch", ansi.path + relToCwd(file), ansi.reset);
			chokidar.watch(file, { ignoreInitial: true })
				.on("all", async (event, filename) => {
					if (queuedTryCompile)
						return; // dedupe

					queuedTryCompile = true;
					while (compilationPromise) await compilationPromise;
					queuedTryCompile = false;
					console.log(ansi.label + event, ansi.path + relToCwd(filename), ansi.reset);
					await (compilationPromise = tryCompile(file));
					compilationPromise = undefined;
				})
				.on("error", console.error);
		}
	}
}

async function tryCompile (filename: string) {
	try {
		return compile(filename);
	} catch (e) {
		const err = e as Error;
		let message = err.message;
		let stack = err.stack;
		const enomdl = message.startsWith("Cannot find module");
		stack = enomdl ? message.slice(message.indexOf("\n") + 1) : err.stack?.slice(err.stack.indexOf("\n") + 1) ?? "";
		// stack = enomdl ? message.slice(message.indexOf("\n") + 1) : err.stack?.slice(err.stack.indexOf("\n", err.stack.indexOf("\n") + 1)) ?? "";
		message = enomdl ? message.slice(0, message.indexOf("\n") + 1) : message;
		console.error(ansi.err + message, ansi.reset + stack);
	}
}

async function compile (filename: string) {
	const start = performance.now();

	for (const key of Object.keys(require.cache))
		if (key.startsWith(CHC_ROOT))
			delete require.cache[key];

	const ChiriReaderClass = (require("./chc/read/ChiriReader.js").default) as typeof ChiriReader;
	const reader = await ChiriReaderClass.load(filename);
	if (!reader) {
		console.log(ansi.err + "Failed to load ChiriReader");
		return;
	}

	const ast = await reader.read();

	if (process.env.CHIRI_AST) {
		const streamJsonFunction = (require("./chc/util/streamJson.js").default) as typeof streamJson;
		await streamJsonFunction(reader.basename + ".ast.json", ast)
			.catch(e => { throw prefixError(e, "Failed to write AST JSON file"); });
	}

	const outFile = reader.basename;

	const ChiriCompilerClass = (require("./chc/write/ChiriCompiler.js").default) as typeof ChiriCompiler;
	const compiler = new ChiriCompilerClass(ast, outFile);
	compiler.compile();
	await compiler.writeFiles();

	const elapsed = performance.now() - start;
	console.log(ansi.label + "chiri", ansi.path + relToCwd(filename), ansi.label + "=>", ansi.path + relToCwd(outFile), ansi.label + formatElapsed(elapsed));
}

function formatElapsed (elapsed: number) {
	if (elapsed < 1)
		return `${Math.floor(elapsed * 1_000)} μs`;

	if (elapsed < 1_000)
		return `${Math.floor(elapsed)} ms`;

	if (elapsed < 60_000)
		return `${+(elapsed / 1_000).toFixed(2)} s`;

	return `${+(elapsed / 60_000).toFixed(2)} m`;
}

(async () => {
	const files = allArgs.map(file => path.resolve(file));
	compileAll(files, !!args.w);

	if (args.w && process.env.CHIRI_ENV === "dev") {
		let lastQueueAttemptId: NodeJS.Timeout | undefined;
		const debounceTime = 100;
		chokidar.watch([CHC_ROOT, "!**/*.d.ts", LIB_ROOT], { ignoreInitial: true })
			.on("all", (event, filename) => {
				if (lastQueueAttemptId) clearTimeout(lastQueueAttemptId);
				lastQueueAttemptId = setTimeout(queueCompileAll.bind(null, event, filename), debounceTime);
			})
			.on("error", console.error);
	}

	async function queueCompileAll (event: string, filename: string) {
		if (queuedCompileAll)
			return; // skip

		queuedCompileAll = true;
		while (compilationPromise) await compilationPromise;
		queuedCompileAll = false;
		console.log(ansi.label + event, ansi.path + relToCwd(filename), ansi.reset);
		await compileAll(files);
	}
})();


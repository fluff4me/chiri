//@ts-check

const args = /** @type {Record<string, string | true> & { "*": string[] }} */(/** @type {any} */ ({ "*": [] }));
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

	args["*"].push(arg);
}

const fsp = require("fs/promises");
const path = require("path");
const chokidar = require("chokidar");
const ansi = require("./ansi");
const prefixError = require("./chc/util/prefixError");
const relToCwd = require("./chc/util/relToCwd");
const ChiriCompiler = require("./chc/write/ChiriCompiler.js");
const chcPath = path.resolve("chc");
const libPath = path.resolve("lib");

try { require("dotenv").config(); } catch { }

/** @type {Promise<any> | undefined} */
let compilationPromise = undefined;
let queuedCompileAll = false;
let queuedTryCompile = false;
/**
 * @param {string[]} files
 */
async function compileAll (files, watch = false) {
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

/** @param {string} filename */
async function tryCompile (filename) {
	try {
		return compile(filename);
	} catch (e) {
		const err = /** @type {Error} */(e);
		let message = err.message;
		let stack = err.stack;
		const enomdl = message.startsWith("Cannot find module");
		stack = enomdl ? message.slice(message.indexOf("\n") + 1) : err.stack?.slice(err.stack.indexOf("\n") + 1) ?? "";
		// stack = enomdl ? message.slice(message.indexOf("\n") + 1) : err.stack?.slice(err.stack.indexOf("\n", err.stack.indexOf("\n") + 1)) ?? "";
		message = enomdl ? message.slice(0, message.indexOf("\n") + 1) : message;
		console.error(ansi.err + message, ansi.reset + stack);
	}
}

/** @param {string} filename */
async function compile (filename) {
	const start = performance.now();

	for (const key of Object.keys(require.cache))
		if (key.startsWith(chcPath))
			delete require.cache[key];

	const ChiriReader = require("./chc/read/ChiriReader.js");
	const reader = /** @type {ChiriReader} */(await ChiriReader.load(filename));

	const ast = await reader.read();

	if (process.env.CHIRI_AST) {
		const streamJson = require("./chc/util/streamJson");
		await streamJson(reader.basename + ".ast.json", ast)
			.catch(e => { throw prefixError(e, "Failed to write AST JSON file"); });
	}

	const outFile = reader.basename;

	const ChiriCompiler = require("./chc/write/ChiriCompiler.js");
	const compiler = new ChiriCompiler(ast, outFile);
	compiler.compile();
	await compiler.writeFiles();

	const elapsed = performance.now() - start;
	console.log(ansi.label + "chiri", ansi.path + relToCwd(filename), ansi.label + "=>", ansi.path + relToCwd(outFile), ansi.label + formatElapsed(elapsed));
}

/**
 * @param {number} elapsed 
 */
function formatElapsed (elapsed) {
	if (elapsed < 1)
		return `${Math.floor(elapsed * 1_000)} μs`;

	if (elapsed < 1_000)
		return `${Math.floor(elapsed)} ms`;

	if (elapsed < 60_000)
		return `${+(elapsed / 1_000).toFixed(2)} s`;

	return `${+(elapsed / 60_000).toFixed(2)} m`;
}

(async () => {
	const files = args["*"].map(file => path.resolve(file));
	compileAll(files, !!args.w);

	if (args.w && process.env.CHIRI_ENV === "dev") {
		chokidar.watch([chcPath, libPath], { ignoreInitial: true })
			.on("all", async (event, filename) => {
				if (queuedCompileAll)
					return; // skip

				queuedCompileAll = true;
				while (compilationPromise) await compilationPromise;
				queuedCompileAll = false;
				console.log(ansi.label + event, ansi.path + relToCwd(filename), ansi.reset);
				await compileAll(files);
			})
			.on("error", console.error);
	}
})();

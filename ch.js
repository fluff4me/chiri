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
const fs = require("fs");
const path = require("path");
const ansi = require("./ansi");
const chcPath = path.resolve("chc");

/**
 * @param {string} file
 */
function relToCwd (file) {
	return path.relative(process.cwd(), file);
}

(async () => {
	const files = args["*"].map(file => path.resolve(file));
	compileAll(files, !!args.w);

	if (args.w) {
		/**
		 * @type {NodeJS.Timeout | undefined}
		 */
		let timeout;
		const recompile = () => {
			clearTimeout(timeout);
			timeout = setTimeout(() => compileAll(files), 10);
		};

		fs.watch(chcPath, { persistent: true, recursive: true }, recompile).on("error", console.error);
	}
})();

/**
 * @param {string[]} files
 */
async function compileAll (files, watch = false) {
	for (const file of files) {
		await compile(file);
		if (watch) {
			console.log(ansi.label + "watch", ansi.path + relToCwd(file), ansi.reset);
			/**
			 * @type {NodeJS.Timeout | undefined}
			 */
			let timeout;
			fs.watch(file, { persistent: true }, () => {
				clearTimeout(timeout);
				timeout = setTimeout(() => compile(file), 10);
			}).on("error", console.error);
		}
	}
}

/** @param {string} filename */
async function compile (filename) {
	const start = performance.now();

	const ch = await fsp.readFile(filename, "utf8")
		.catch(err => {
			console.error(ansi.err + "Failed to read input file", filename, err, ansi.reset);
			return "";
		});

	for (const key of Object.keys(require.cache))
		if (key.startsWith(chcPath))
			delete require.cache[key];

	const basename = path.join(path.dirname(filename), path.basename(filename, path.extname(filename)));

	/** @type {ChiriAST} */
	let ast;
	try {
		/** @type {typeof import("./chc/read/ChiriReader")} */
		const ChiriReader = require(path.join(chcPath, "read/ChiriReader.js"));
		ast = new ChiriReader(filename, ch).read();

		try {
			await fsp.writeFile(basename + ".ast.json", JSON.stringify(ast, null, "\t"));
		} catch (e) {
			const err = /** @type {Error} */(e);
			console.error(ansi.err + "Failed to write AST JSON file", ansi.reset + "\n" + (err.stack ?? err.message));
		}

	} catch (e) {
		const err = /** @type {Error} */(e);
		let message = err.message;
		let stack = err.stack;
		const enomdl = message.startsWith("Cannot find module");
		stack = enomdl ? message.slice(message.indexOf("\n") + 1) : err.stack?.slice(err.stack.indexOf("\n") + 1) ?? "";
		message = enomdl ? message.slice(0, message.indexOf("\n") + 1) : message;
		console.error(ansi.err + message, ansi.reset + stack);
		ast = { filename, source: ch, statements: [] };
	}

	// only ESWriter output type atm
	/** @type {typeof import("./chc/write/ESWriter") | undefined} */
	let outputType;
	try {
		outputType = require(path.join(chcPath, "write/ESWriter.js"));
	} catch (e) {
		const err = /** @type {Error} */(e);
		let message = err.message;
		let stack = err.stack;
		const enomdl = message.startsWith("Cannot find module");
		stack = enomdl ? message.slice(message.indexOf("\n") + 1) : err.stack?.slice(err.stack.indexOf("\n", err.stack.indexOf("\n") + 1)) ?? "";
		message = enomdl ? message.slice(0, message.indexOf("\n") + 1) : message;
		console.error(ansi.err + message, ansi.reset + stack);
	}

	if (!outputType)
		return;

	const outFile = basename + outputType.extension;
	let js = "";
	try {
		js = new outputType(ast, basename).write();
	} catch (e) {
		const err = /** @type {Error} */(e);
		let message = err.message;
		let stack = err.stack;
		const enomdl = message.startsWith("Cannot find module");
		stack = enomdl ? message.slice(message.indexOf("\n") + 1) : err.stack?.slice(err.stack.indexOf("\n", err.stack.indexOf("\n") + 1)) ?? "";
		message = enomdl ? message.slice(0, message.indexOf("\n") + 1) : message;
		console.error(ansi.err + message, ansi.reset + stack);
	}

	const elapsed = performance.now() - start;
	console.log(ansi.label + "chc", ansi.path + relToCwd(filename), ansi.label + "=>", ansi.path + relToCwd(outFile), ansi.label + formatElapsed(elapsed));
	return fsp.writeFile(outFile, js);
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

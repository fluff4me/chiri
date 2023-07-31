//@ts-check
const args = { "*": /** @type {string[]} */([]) };
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
const thcPath = path.resolve("thc");

function relToCwd (file) {
	return path.relative(process.cwd(), file);
}

(async () => {
	const files = args["*"].map(file => path.resolve(file));
	compileAll(files, args.w);

	if (args.w) {
		let timeout;
		const recompile = () => {
			clearTimeout(timeout);
			timeout = setTimeout(() => compileAll(files), 10);
		};

		fs.watch(`${thcPath}.js`, { persistent: true }, recompile).on("error", console.error);
		fs.watch(thcPath, { persistent: true, recursive: true }, recompile).on("error", console.error);
	}
})();

async function compileAll (files, watch = false) {
	for (const file of files) {
		await compile(file);
		if (watch) {
			console.log(ansi.label + "watch", ansi.path + relToCwd(file), ansi.reset);
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
	const th = await fsp.readFile(filename, "utf8")
		.catch(err => {
			console.error(ansi.err + "Failed to read input file", filename, err, ansi.reset);
			return "";
		});

	for (const key of Object.keys(require.cache))
		if (key.startsWith(thcPath))
			delete require.cache[key];

	const basename = path.join(path.dirname(filename), path.basename(filename, path.extname(filename)));

	/** @type {ThetaAST} */
	let ast;
	try {
		/** @type {typeof import("./thc/read/ThetaReader")} */
		const ThetaReader = require(path.join(thcPath, "read/ThetaReader.js"));
		ast = new ThetaReader(filename, th).read();

		try {
			await fsp.writeFile(basename + ".ast.json", JSON.stringify(ast, null, "\t"));
		} catch (err) {
			console.error(ansi.err + "Failed to write AST JSON file", ansi.reset + "\n" + (err.stack ?? err.message));
		}

	} catch (err) {
		let message = err.message;
		let stack = err.stack;
		const enomdl = message.startsWith("Cannot find module");
		stack = enomdl ? message.slice(message.indexOf("\n") + 1) : err.stack?.slice(err.stack.indexOf("\n") + 1) ?? "";
		message = enomdl ? message.slice(0, message.indexOf("\n") + 1) : message;
		console.error(ansi.err + message, ansi.reset + stack);
		ast = { filename, source: th, statements: [] };
	}

	// only ESWriter output type atm
	/** @type {typeof import("./thc/write/ESWriter") | undefined */
	let outputType;
	try {
		outputType = require(path.join(thcPath, "write/ESWriter.js"));
	} catch (err) {
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
	} catch (err) {
		let message = err.message;
		let stack = err.stack;
		const enomdl = message.startsWith("Cannot find module");
		stack = enomdl ? message.slice(message.indexOf("\n") + 1) : err.stack?.slice(err.stack.indexOf("\n", err.stack.indexOf("\n") + 1)) ?? "";
		message = enomdl ? message.slice(0, message.indexOf("\n") + 1) : message;
		console.error(ansi.err + message, ansi.reset + stack);
	}

	console.log(ansi.label + "thc", ansi.path + relToCwd(filename), ansi.label + "=>", ansi.path + relToCwd(outFile), ansi.reset);
	return fsp.writeFile(outFile, js);
}

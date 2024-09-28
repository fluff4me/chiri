#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-var-requires */
import chokidar from "chokidar"
import dotenv from "dotenv"
import path from "path"
import sourceMapSupport from "source-map-support"
import ansi from "./ansi"
import args, { allArgs } from "./args"
import type ChiriReaderType from "./chc/read/ChiriReader"
import prefixError from "./chc/util/prefixError.js"
import relToCwd from "./chc/util/relToCwd.js"
import type streamJsonType from "./chc/util/streamJson"
import type ChiriCompilerType from "./chc/write/ChiriCompiler"
import { CHC_ROOT, LIB_ROOT, PACKAGE_ROOT } from "./constants"

if (process.cwd() === PACKAGE_ROOT)
	dotenv.config()

Error.stackTraceLimit = Math.max(Error.stackTraceLimit, +process.env.CHIRI_STACK_LENGTH! || 4)

if (process.env.CHIRI_ENV === "dev")
	sourceMapSupport.install()

if (args.v) {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
	console.log(require(path.join(PACKAGE_ROOT, "package.json")).version)
	process.exit()
}

let compilationPromise: Promise<any> | undefined = undefined
let queuedCompileAll = false
let queuedTryCompile = false

async function compileAll (files: string[], watch = false) {
	for (const file of files) {
		await (compilationPromise = tryCompile(file))
		compilationPromise = undefined
		if (watch) {
			console.log(ansi.label + "watch", ansi.path + relToCwd(file), ansi.reset)
			chokidar.watch([file, `${file}.chiri`], { ignoreInitial: true })
				// eslint-disable-next-line @typescript-eslint/no-misused-promises
				.on("all", async (event, filename) => {
					if (queuedTryCompile)
						return // dedupe

					queuedTryCompile = true
					while (compilationPromise) await compilationPromise
					queuedTryCompile = false
					console.log(ansi.label + event, ansi.path + relToCwd(filename), ansi.reset)
					await (compilationPromise = tryCompile(file))
					compilationPromise = undefined
				})
				.on("error", console.error)
		}
	}
}

async function tryCompile (filename: string) {
	try {
		return compile(filename)
	} catch (e) {
		const err = e as Error
		let message = err.message
		let stack = err.stack
		const enomdl = message.startsWith("Cannot find module")
		stack = enomdl ? message.slice(message.indexOf("\n") + 1) : err.stack?.slice(err.stack.indexOf("\n") + 1) ?? ""
		// stack = enomdl ? message.slice(message.indexOf("\n") + 1) : err.stack?.slice(err.stack.indexOf("\n", err.stack.indexOf("\n") + 1)) ?? "";
		message = enomdl ? message.slice(0, message.indexOf("\n") + 1) : message
		console.error(ansi.err + message, ansi.reset + stack)
	}
}

async function compile (filename: string) {
	const start = performance.now()

	for (const key of Object.keys(require.cache))
		if (key.startsWith(CHC_ROOT))
			delete require.cache[key]

	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
	const rerequire = <T> (path: string): T => require(path).default as T

	const ChiriReader = rerequire<typeof ChiriReaderType>("./chc/read/ChiriReader.js")
	const reader = await ChiriReader.load(filename)
	if (!reader) {
		console.log(ansi.err + "Failed to load ChiriReader")
		return
	}

	const ast = await reader.read()
	if (reader.errored)
		return

	if (process.env.CHIRI_AST) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		const streamJsonFunction = rerequire<typeof streamJsonType>("./chc/util/streamJson.js")
		await streamJsonFunction(reader.basename + ".ast.json", ast)
			.catch(e => { throw prefixError(e, "Failed to write AST JSON file") })
	}

	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
	const ChiriCompilerClass = rerequire<typeof ChiriCompilerType>("./chc/write/ChiriCompiler.js")
	const compiler = ChiriCompilerClass(ast, reader.basename)
	compiler.compile()
	await compiler.writeFiles()

	const elapsed = performance.now() - start
	console.log(ansi.label + "chiri", ansi.path + relToCwd(reader.filename), ansi.label + formatElapsed(elapsed))
}

function formatElapsed (elapsed: number) {
	if (elapsed < 1)
		return `${Math.floor(elapsed * 1_000)} μs`

	if (elapsed < 1_000)
		return `${Math.floor(elapsed)} ms`

	if (elapsed < 60_000)
		return `${+(elapsed / 1_000).toFixed(2)} s`

	return `${+(elapsed / 60_000).toFixed(2)} m`
}

void (async () => {
	const files = allArgs.map(file => path.resolve(file))
	await compileAll(files, !!args.w)

	if (args.w && process.env.CHIRI_ENV === "dev") {
		let lastQueueAttemptId: NodeJS.Timeout | undefined
		const debounceTime = 100
		chokidar.watch([CHC_ROOT, "!**/*.d.ts", LIB_ROOT], { ignoreInitial: true })
			.on("all", (event, filename) => {
				if (lastQueueAttemptId) clearTimeout(lastQueueAttemptId)
				// eslint-disable-next-line @typescript-eslint/no-misused-promises
				lastQueueAttemptId = setTimeout(queueCompileAll.bind(null, event, filename), debounceTime)
			})
			.on("error", console.error)
	}

	async function queueCompileAll (event: string, filename: string) {
		if (queuedCompileAll)
			return // skip

		queuedCompileAll = true
		while (compilationPromise) await compilationPromise
		queuedCompileAll = false
		console.log(ansi.label + event, ansi.path + relToCwd(filename), ansi.reset)
		await compileAll(files)
	}
})()


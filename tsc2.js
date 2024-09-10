// @ts-check
"use strict";

const { exec } = require("child_process");

////////////////////////////////////
//#region Util

const ansi = {
	reset: "\x1b[0m",
	label: "\x1b[90m",
	duration: "\x1b[35m",
	err: "\x1b[91m",
	ok: "\x1b[92m",
};

function getTimeString () {
	let time = new Date().toLocaleTimeString(undefined, { hour12: false });
	time = time.startsWith("24") ? `00${time.slice(2)}` : time;
	return ansi.label + time + ansi.reset;
}

/**
 * @param {number} start
 */
function getElapsedString (start, time = Date.now() - start) {
	let timeString;

	if (time >= 1000) {
		timeString = `${(time / 1000).toFixed(2).replace(/\.0+$/, "")} s`;
	} else if (time >= 1) {
		timeString = `${time.toFixed(0)} ms`;
	} else {
		timeString = `${Math.floor(time * 1000)} μs`;
	}

	return ansi.duration + timeString + ansi.reset;
}

//#endregion
////////////////////////////////////

(async () => {
	const tsc = exec(`npx tsc --project src/tsconfig.json ${process.argv.slice(2).map(a => a.includes(" ") ? `"${a}"` : a).join(" ")}`);

	let lastStart = -1;

	await /** @type {Promise<void>} */(new Promise((resolve) => {
		tsc.stdout?.on("data", data => {
			data = data
				.replace(/\[\x1b\[90m\d{1,2}:\d{2}:\d{2}[ \xa0\u202f][AP]M\x1b\[0m\][ \xa0\u202f]/gi, "") // remove time
				.replace(/(\x1b\[96m)(.*?\x1b\[0m:\x1b\[93m)/g, `$1${process.cwd()}/$2`); // longer file paths

			const lines = data.split("\n");
			for (let line of lines) {
				if (line.trim().length === 0) {
					// ignore boring lines
					continue;
				}

				if (line.startsWith("> ")) {
					// ignore "> tsc --build --watch --pretty --preserveWatchOutput" line
					continue;
				}

				if (line.includes("Starting compilation in watch mode...")) {
					lastStart = Date.now();
				} else if (line.includes("Starting incremental compilation...")) {
					if (lastStart !== -1) {
						// ignore duplicate "starting incremental compilation" line
						continue;
					}

					lastStart = Date.now();
				}

				if (!process.env.TSC_NO_COLOURIZE_ERRORS) {
					line = line
						.replace(/(?<!\d)0 errors/, ansi.ok + "0 errors" + ansi.reset)
						.replace(/(?<!\d)(?!0)(\d+) errors/, ansi.err + "$1 errors" + ansi.reset);
				}

				if (!process.env.TSC_NO_LOG_DURATION && line.includes(". Watching for file changes.")) {
					line = line.replace(". Watching for file changes.", ` after ${getElapsedString(lastStart)}`);
					lastStart = -1;
				}

				process.stdout.write(`${getTimeString()} ${line}\n`);
			}

			if (data.includes("Found 0 errors. Watching for file changes.")) {
				resolve();
			}
		});

		tsc.stderr?.on("data", data => {
			process.stderr.write(data);
		});

		tsc.on("exit", (exitCode) => {
			if (exitCode !== 0)
				process.exit(exitCode);

			resolve();
		});
	}));
})();

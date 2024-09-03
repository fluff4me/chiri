const fs = require("fs");

/**
 * @typedef {fs.WriteStream & { awrite(chunk: string): Promise<void> }} AWriteStream
 */

/**
 * @param {string} file 
 * @param {any} data 
 */
module.exports = async function streamJson (file, data) {
	const stream = /** @type {AWriteStream} */(fs.createWriteStream(file));
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
};

/**
 * @param {AWriteStream} stream 
 * @param {any} data 
 * @param {string} indent
 */
async function write (stream, data, indent) {
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
	if (entries.length) {
		indent += "\t";
		await stream.awrite(`\n${indent}`);
		for (let i = 0; i < entries.length; i++) {
			const [key, value] = entries[i];
			if (value === undefined)
				continue;

			await stream.awrite(`${JSON.stringify(key)}: `);
			await write(stream, value, indent);
			if (i !== entries.length - 1)
				await stream.awrite(`,\n${indent}`);
		}
		indent = indent.slice(0, -1);
		await stream.awrite(`\n${indent}`);
	}
	await stream.awrite("}");
}

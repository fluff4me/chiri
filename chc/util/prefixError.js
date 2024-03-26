/**
 * @param {unknown} error 
 * @param {string} prefix 
 * @returns {Error}
 */
module.exports = (error, prefix) => {
	const message = error instanceof Error ? error.message : typeof error === "string" ? error : String(error);
	let stack;
	if (error instanceof Error)
		stack = error.stack;
	else {
		stack = new Error().stack;
		stack = stack?.slice(stack.indexOf("\n") + 1);
	}

	return Object.assign(new Error(), {
		message: `${prefix}: ${message}`,
		stack,
	});
};

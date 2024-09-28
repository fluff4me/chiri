const args: Record<string, string | true> = {}
const allArgs: string[] = []

for (let i = 2; i < process.argv.length; i++) {
	const arg = process.argv[i]
	if (arg[0] === "-" && (arg[2] || arg[1] !== "-")) {
		if (arg[1] === "-") {
			args[arg.slice(2)] = process.argv[++i]
			continue
		}

		args[arg.slice(1)] = true
		continue
	}

	allArgs.push(arg)
}

export default args
export { allArgs }


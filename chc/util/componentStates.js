
const STATE_MAP = {
	"hover": ":hover:not(:has(:hover))",
	"active": ":active:not(:has(:active))",
	"focus": ":focus-visible",
	"focus-any": ":focus",
	":hover": ":hover",
	":active": ":active",
	":focus": ":has(:focus-visible)",
	":focus-any": ":focus-within",
};

const STATES = Object.keys(STATE_MAP);

module.exports = { STATE_MAP, STATES };

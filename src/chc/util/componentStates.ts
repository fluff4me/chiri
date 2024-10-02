export const STATE_MAP = {
	"hover": ":hover:not(:has(:hover))",
	"active": ":active:not(:has(:active))",
	"focus": ":focus-visible",
	"focus-any": ":focus",
	":hover": ":hover",
	":active": ":active",
	":focus": ":where(:focus-visible, :has(:focus-visible))",
	":focus-any": ":focus-within",
}

export type ComponentState = keyof typeof STATE_MAP

export const STATES = Object.keys(STATE_MAP) as ComponentState[]

export const STATE_MAP = {
	"hover": ":hover:not(:has(:hover))",
	"active": ":active:not(:has(:active))",
	"focus": ":focus-visible",
	"focus-any": ":focus",
	"popover": ":popover-open",
	"first": ":first-child",
	"last": ":last-child",
	":hover": ":hover",
	":active": ":active",
	":focus": ":focus-visible :has(:focus-visible)",
	":focus-any": ":focus-within",
}

export type ComponentState = keyof typeof STATE_MAP

export const STATES = Object.keys(STATE_MAP) as ComponentState[]

export const STATE_MAP_SPECIAL = {
	"start": "@starting-style",
}

export type ComponentStateSpecial = keyof typeof STATE_MAP_SPECIAL

export const STATES_SPECIAL = Object.keys(STATE_MAP_SPECIAL) as ComponentStateSpecial[]

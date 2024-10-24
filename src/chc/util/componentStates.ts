export const STATE_MAP = {
	"hover": ":where(:hover:not(:has(:hover)))",
	"active": ":where(:active:not(:has(:active)))",
	"focus": ":where(:focus-visible)",
	"focus-any": ":where(:focus)",
	"popover": ":where(:popover-open)",
	"first": ":where(:first-child)",
	"last": ":where(:last-child)",
	":hover": ":where(:hover)",
	":active": ":where(:active)",
	":focus": ":where(:focus-visible, :has(:focus-visible))",
	":focus-any": ":where(:focus-within)",
}

export type ComponentState = keyof typeof STATE_MAP

export const STATES = Object.keys(STATE_MAP) as ComponentState[]

export const STATE_MAP_SPECIAL = {
	"start": "@starting-style",
}

export type ComponentStateSpecial = keyof typeof STATE_MAP_SPECIAL

export const STATES_SPECIAL = Object.keys(STATE_MAP_SPECIAL) as ComponentStateSpecial[]

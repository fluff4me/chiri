export const STATE_MAP = {
	"hover": ":where(:hover:not(:has(:hover)))",
	"not:hover": ":where(:not(:hover), :has(:hover))",
	"active": ":where(:active:not(:has(:active)))",
	"not:active": ":where(:not(:active), :has(:active))",
	"focus": ":where(:focus-visible)",
	"not:focus": ":where(:not(:focus-visible))",
	"focus-any": ":where(:focus)",
	"not:focus-any": ":where(:not(:focus))",
	"popover": ":where(:popover-open)",
	"not:popover": ":where(:not(:popover-open))",
	"first": ":where(:first-child)",
	"not:first": ":where(:not(:first-child))",
	"last": ":where(:last-child)",
	"not:last": ":where(:not(:last-child))",
	":hover": ":where(:hover)",
	"not::hover": ":where(:not(:hover))",
	":active": ":where(:active)",
	"not::active": ":where(:not(:active))",
	":focus": ":where(:focus-visible, :has(:focus-visible))",
	"not::focus": ":where(:not(:focus-visible, :has(:focus-visible)))",
	":focus-any": ":where(:focus-within)",
	"not::focus-any": ":where(:not(:focus-within))",
}

export type ComponentState = keyof typeof STATE_MAP

export const STATES = Object.keys(STATE_MAP) as ComponentState[]

export const STATE_MAP_SPECIAL = {
	"start": "@starting-style",
}

export type ComponentStateSpecial = keyof typeof STATE_MAP_SPECIAL

export const STATES_SPECIAL = Object.keys(STATE_MAP_SPECIAL) as ComponentStateSpecial[]

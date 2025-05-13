export declare const STATE_MAP: {
    hover: string;
    active: string;
    focus: string;
    "focus-any": string;
    popover: string;
    first: string;
    last: string;
    "after-first": string;
    "before-last": string;
    middle: string;
    ":hover": string;
    ":active": string;
    ":focus": string;
    ":focus-any": string;
    empty: string;
    full: string;
    odd: string;
    even: string;
};
export type ComponentState = keyof typeof STATE_MAP;
export declare const STATES: ComponentState[];
export declare const STATE_MAP_SPECIAL: {
    start: string;
};
export type ComponentStateSpecial = keyof typeof STATE_MAP_SPECIAL;
export declare const STATES_SPECIAL: ComponentStateSpecial[];

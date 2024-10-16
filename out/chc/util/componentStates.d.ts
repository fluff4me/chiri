export declare const STATE_MAP: {
    hover: string;
    active: string;
    focus: string;
    "focus-any": string;
    popover: string;
    ":hover": string;
    ":active": string;
    ":focus": string;
    ":focus-any": string;
};
export type ComponentState = keyof typeof STATE_MAP;
export declare const STATES: ComponentState[];
export declare const STATE_MAP_SPECIAL: {
    start: string;
};
export type ComponentStateSpecial = keyof typeof STATE_MAP_SPECIAL;
export declare const STATES_SPECIAL: ComponentStateSpecial[];

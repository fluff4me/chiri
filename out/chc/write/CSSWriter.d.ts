import type { ChiriAST, ChiriPosition } from "../read/ChiriReader";
import type { ChiriKeyframe } from "../read/consume/consumeKeyframe";
import type { ChiriMixin } from "../read/consume/consumeMixinOptional";
import type { ChiriProperty } from "../read/consume/consumePropertyOptional";
import type { ChiriWord } from "../read/consume/consumeWord";
import type { ChiriAnimation } from "../read/consume/macro/macroAnimation";
import type { PseudoName } from "../read/consume/rule/Rule";
import type { ComponentStateSpecial } from "../util/componentStates";
import type ChiriCompiler from "./ChiriCompiler";
import type { ChiriWriteConfig } from "./Writer";
import Writer, { QueuedWrite } from "./Writer";
export interface ResolvedProperty extends Omit<ChiriProperty, "property" | "value"> {
    property: ChiriWord;
    value: string;
    merge?: true;
}
export interface ResolvedMixin extends Omit<ChiriMixin, "content" | "name"> {
    states: (string | undefined)[];
    specialState?: ComponentStateSpecial;
    pseudos: (PseudoName | undefined)[];
    containerQueries?: string[];
    mediaQueries?: ResolvedMediaQuery[];
    elementTypes: (string | undefined)[];
    name: ChiriWord;
    content: ResolvedProperty[];
    affects: string[];
    index: number;
    skip?: true;
}
export interface ResolvedMediaQuery {
    scheme?: "dark" | "light";
}
export interface ResolvedRootSpecial extends Omit<ResolvedMixin, "name" | "index" | "containerQueries" | "affects"> {
    name?: undefined;
    index?: undefined;
    containerQueries?: undefined;
    affects?: undefined;
}
export interface ResolvedAnimation extends Omit<ChiriAnimation, "content" | "name"> {
    name: ChiriWord;
    content: ResolvedAnimationKeyframe[];
}
export interface ResolvedAnimationKeyframe extends Omit<ChiriKeyframe, "at" | "content"> {
    at: number;
    content: ResolvedProperty[];
}
export interface ResolvedViewTransition {
    type: "view-transition" | "view-transition-class";
    subTypes: ("old" | "new" | "group" | "image-pair")[];
    name: ChiriWord;
    content: ResolvedProperty[];
    position: ChiriPosition;
}
export interface ResolvedFontFace {
    family: ChiriWord;
    content: ResolvedProperty[];
}
export interface ResolvedSelect {
    type: "select";
    selector: string;
    content: ResolvedProperty[];
    position: ChiriPosition;
}
export type CSSDocumentSection = "imports" | "property-definitions" | "font-faces" | "root-properties" | "root-styles" | "default" | "selects" | "view-transitions" | "animations";
export default class CSSWriter extends Writer {
    private currentSection;
    private queues;
    protected get queue(): QueuedWrite[];
    constructor(ast: ChiriAST, dest: string, config?: ChiriWriteConfig);
    createDestPath(outFile: string): string;
    writingTo(section: CSSDocumentSection, dowhile: () => any): void;
    writeProperty(compiler: ChiriCompiler, property: ResolvedProperty): void;
    writeMixin(compiler: ChiriCompiler, mixin: ResolvedMixin | ResolvedRootSpecial): void;
    writeSelect(compiler: ChiriCompiler, select: ResolvedSelect): void;
    writeAnimation(compiler: ChiriCompiler, animation: ResolvedAnimation): void;
    writeViewTransition(compiler: ChiriCompiler, viewTransition: ResolvedViewTransition): void;
    writeFontFace(compiler: ChiriCompiler, fontFace: ResolvedFontFace): void;
    onCompileEnd(compiler: ChiriCompiler): void;
}

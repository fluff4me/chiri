var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "path", "../../args", "../read/factory/makeWord", "../util/componentStates", "./Writer"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const path_1 = __importDefault(require("path"));
    const args_1 = __importDefault(require("../../args"));
    const makeWord_1 = __importDefault(require("../read/factory/makeWord"));
    const componentStates_1 = require("../util/componentStates");
    const Writer_1 = __importStar(require("./Writer"));
    const SPLIT_PSEUDO_MAP = {
        "range-thumb": ["-webkit-slider-thumb", "-moz-range-thumb"],
        "range-track": ["-webkit-slider-runnable-track", "-moz-range-track"],
        "swatch": ["-webkit-color-swatch", "-moz-color-swatch"],
        "swatch-wrapper": ["-webkit-color-swatch-wrapper"],
    };
    class CSSWriter extends Writer_1.default {
        currentSection = "default";
        queues = {
            "imports": Writer_1.QueuedWrite.makeQueue(),
            "property-definitions": Writer_1.QueuedWrite.makeQueue(),
            "font-faces": Writer_1.QueuedWrite.makeQueue(),
            "root-properties": Writer_1.QueuedWrite.makeQueue(),
            "root-styles": Writer_1.QueuedWrite.makeQueue(),
            "default": this.outputQueue,
            "selects": Writer_1.QueuedWrite.makeQueue(),
            "view-transitions": Writer_1.QueuedWrite.makeQueue(),
            "animations": Writer_1.QueuedWrite.makeQueue(),
        };
        get queue() {
            return this.queues[this.currentSection];
        }
        constructor(ast, dest, config) {
            super(ast, dest, { extension: ".css", ...config });
        }
        createDestPath(outFile) {
            return typeof args_1.default["out-css"] === "string" ? path_1.default.resolve(args_1.default["out-css"], outFile) : super.createDestPath(outFile);
        }
        writingTo(section, dowhile) {
            if (this.currentSection === section)
                return;
            const oldSection = this.currentSection;
            this.currentSection = section;
            dowhile();
            this.currentSection = oldSection;
        }
        writeProperty(compiler, property) {
            if (property.isCustomProperty)
                this.write("--");
            const aliases = property.isCustomProperty ? [property.property.value] : compiler.getAlias(property.property.value);
            for (const alias of aliases) {
                this.writeWord({ type: "word", value: alias, position: property.property.position });
                this.write(":");
                this.writeSpaceOptional();
                this.write(property.value);
                this.writeLine(";");
            }
        }
        writeMixin(compiler, mixin) {
            if (mixin.skip || !mixin.content.length)
                return;
            ////////////////////////////////////
            //#region Rule Start
            for (const query of mixin.containerQueries ?? []) {
                this.write(`@container ${query}`);
                this.writeSpaceOptional();
                this.writeLineStartBlock("{");
            }
            for (const query of mixin.mediaQueries ?? []) {
                if (typeof query === "string") {
                    this.write(`@media ${query}`);
                    this.writeSpaceOptional();
                    this.writeLineStartBlock("{");
                }
                else if (query.scheme) {
                    this.write(`@media (prefers-color-scheme: ${query.scheme})`);
                    this.writeSpaceOptional();
                    this.writeLineStartBlock("{");
                }
            }
            if (mixin.specialState) {
                this.write(componentStates_1.STATE_MAP_SPECIAL[mixin.specialState]);
                this.writeSpaceOptional();
                this.writeLineStartBlock("{");
            }
            if (!mixin.states.length)
                mixin.states.push(undefined);
            if (!mixin.pseudos.length)
                mixin.pseudos.push(undefined);
            if (!mixin.elementTypes.length)
                mixin.elementTypes.push(undefined);
            const splitPseudos = mixin.pseudos.flatMap(pseudo => SPLIT_PSEUDO_MAP[pseudo] ?? []);
            if (!splitPseudos.length)
                splitPseudos.push(undefined);
            for (const splitPseudo of splitPseudos) {
                const nonSplitPseudos = mixin.pseudos.filter(pseudo => !SPLIT_PSEUDO_MAP[pseudo]);
                if (!nonSplitPseudos.length)
                    nonSplitPseudos.push(undefined);
                let i = 0;
                for (const elementType of mixin.elementTypes) {
                    for (const state of mixin.states) {
                        for (const pseudo of nonSplitPseudos) {
                            if (i) {
                                this.write(",");
                                this.writeSpaceOptional();
                            }
                            if (mixin.name) {
                                this.write(".");
                                this.writeWord(mixin.name);
                            }
                            if (elementType)
                                this.write(` ${elementType}`);
                            if (state)
                                this.write(`:where(${state})`);
                            if (pseudo)
                                this.write(`::${pseudo}`);
                            if (splitPseudo)
                                this.write(`::${splitPseudo}`);
                            if (mixin.name || elementType || state || pseudo || splitPseudo)
                                i++;
                        }
                    }
                }
                if (!i)
                    this.write(":root");
                //#endregion
                ////////////////////////////////////
                this.writeSpaceOptional();
                this.writeLineStartBlock("{");
                for (const property of mergeProperties(mixin.content))
                    this.writeProperty(compiler, property);
                this.writeLineEndBlock("}");
            }
            ////////////////////////////////////
            //#region Rule End
            if (mixin.specialState)
                this.writeLineEndBlock("}");
            for (const query of mixin.containerQueries ?? [])
                this.writeLineEndBlock("}");
            for (const query of mixin.mediaQueries ?? [])
                this.writeLineEndBlock("}");
            //#endregion
            ////////////////////////////////////
        }
        writeSelect(compiler, select) {
            this.writingTo("selects", () => {
                this.writeWord((0, makeWord_1.default)(select.selector, select.position));
                this.writeSpaceOptional();
                this.writeLineStartBlock("{");
                for (const property of mergeProperties(select.content))
                    this.writeProperty(compiler, property);
                this.writeLineEndBlock("}");
            });
        }
        writeAnimation(compiler, animation) {
            this.writingTo("animations", () => {
                this.write("@keyframes ");
                this.writeWord(animation.name);
                this.writeSpaceOptional();
                this.writeBlock(() => {
                    for (const keyframe of animation.content) {
                        this.write(`${keyframe.at}%`);
                        this.writeSpaceOptional();
                        this.writeBlock(() => {
                            for (const property of keyframe.content)
                                this.writeProperty(compiler, property);
                        });
                    }
                });
            });
        }
        writeViewTransition(compiler, viewTransition) {
            this.writingTo("view-transitions", () => {
                const selector = viewTransition.type === "view-transition" ? viewTransition.name.value
                    : `*.${viewTransition.name.value}`;
                this.writeWord((0, makeWord_1.default)(`::view-transition-${viewTransition.subTypes[0]}(${selector})`, viewTransition.position));
                if (viewTransition.subTypes[1]) {
                    this.write(",");
                    this.writeSpaceOptional();
                    this.writeWord((0, makeWord_1.default)(`::view-transition-${viewTransition.subTypes[1]}(${selector})`, viewTransition.position));
                }
                this.writeSpaceOptional();
                this.writeBlock(() => {
                    for (const property of viewTransition.content)
                        this.writeProperty(compiler, property);
                });
            });
        }
        writeFontFace(compiler, fontFace) {
            this.writingTo("font-faces", () => {
                this.write("@font-face");
                this.writeSpaceOptional();
                this.writeBlock(() => {
                    this.writeProperty(compiler, {
                        type: "property",
                        property: (0, makeWord_1.default)("font-family", fontFace.family.position),
                        value: `"${fontFace.family.value}"`,
                        position: fontFace.family.position,
                    });
                    for (const property of fontFace.content)
                        this.writeProperty(compiler, property);
                });
            });
        }
        onCompileEnd(compiler) {
            const headerQueue = Writer_1.QueuedWrite.makeQueue();
            headerQueue.push(...this.queues.imports);
            headerQueue.push({ output: "\n" });
            headerQueue.push(...this.queues["property-definitions"]);
            headerQueue.push({ output: "\n" });
            headerQueue.push(...this.queues["font-faces"]);
            headerQueue.push({ output: "\n" });
            headerQueue.push({ output: ":root {\n\t" });
            headerQueue.push(...this.queues["root-properties"]
                .map(wr => ({ ...wr, output: wr.output.replaceAll("\n", "\n\t") })));
            headerQueue.at(-1).output = headerQueue.at(-1).output.slice(0, -1);
            headerQueue.push({ output: "\n\t" });
            headerQueue.push(...this.queues["root-styles"]
                .map(wr => ({ ...wr, output: wr.output.replaceAll("\n", "\n\t") })));
            headerQueue.at(-1).output = headerQueue.at(-1).output.slice(0, -1);
            headerQueue.push({ output: "}\n\n" });
            this.outputQueue.unshift(...headerQueue);
            if (this.currentSection !== "default")
                this.currentSection = "default";
            this.outputQueue.push({ output: "\n" });
            this.outputQueue.push(...this.queues["selects"]);
            this.outputQueue.push({ output: "\n" });
            this.outputQueue.push(...this.queues["view-transitions"]);
            this.outputQueue.push({ output: "\n" });
            this.outputQueue.push(...this.queues.animations);
            this.write(`\n/*# sourceMappingURL=data:application/json;base64,${btoa(this.map.toString())} */`);
        }
    }
    exports.default = CSSWriter;
    const alreadyEmitted = [];
    function mergeProperties(properties) {
        let mergeProperties;
        let newProperties;
        for (let i = 0; i < properties.length; i++) {
            const property = properties[i];
            if (!property.merge) {
                delete mergeProperties?.[property.property.value];
                newProperties?.push(property);
                continue;
            }
            newProperties ??= properties.slice(0, i);
            mergeProperties ??= {};
            const mergeProperty = mergeProperties[property.property.value];
            if (!mergeProperty) {
                mergeProperties[property.property.value] = property;
                newProperties.push(property);
                continue;
            }
            mergeProperty.value = `${mergeProperty.value}, ${property.value}`;
        }
        properties = newProperties ?? properties;
        newProperties = undefined;
        alreadyEmitted.length = 0;
        for (let i = properties.length - 1; i >= 0; i--) {
            const property = properties[i];
            const propertyId = `${property.isCustomProperty ? "$" : ""}${property.property.value}`;
            if (alreadyEmitted.includes(propertyId)) {
                newProperties ??= properties.slice(i + 1);
                continue;
            }
            newProperties?.unshift(property);
            alreadyEmitted.push(propertyId);
        }
        return newProperties ?? properties;
    }
});
//# sourceMappingURL=CSSWriter.js.map
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../ansi", "./ChiriType", "./typeBody", "./typeBool", "./typeDec", "./typeFunction", "./typeInt", "./typeList", "./typeRaw", "./typeRecord", "./typeString", "./typeUint"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const ansi_1 = __importDefault(require("../../ansi"));
    const ChiriType_1 = require("./ChiriType");
    const typeBody_1 = __importDefault(require("./typeBody"));
    const typeBool_1 = __importDefault(require("./typeBool"));
    const typeDec_1 = __importDefault(require("./typeDec"));
    const typeFunction_1 = __importDefault(require("./typeFunction"));
    const typeInt_1 = __importDefault(require("./typeInt"));
    const typeList_1 = __importDefault(require("./typeList"));
    const typeRaw_1 = __importDefault(require("./typeRaw"));
    const typeRecord_1 = __importDefault(require("./typeRecord"));
    const typeString_1 = __importDefault(require("./typeString"));
    const typeUint_1 = __importDefault(require("./typeUint"));
    const typesList = [
        typeString_1.default,
        typeDec_1.default,
        typeInt_1.default,
        typeUint_1.default,
        typeList_1.default,
        typeRecord_1.default,
        typeBody_1.default,
        typeBool_1.default,
        typeRaw_1.default,
        typeFunction_1.default,
    ];
    const types = Object.fromEntries(typesList.map(typedef => [typedef.type.name.value, typedef]));
    const numericTypes = ["uint", "int", "dec"];
    const isNumeric = (type) => numericTypes.includes(type);
    const binaryNumericOperators = ["**", "+", "-", "*", "/", "%", "==", "!=", "<=", ">=", "<", ">"];
    const unaryNumericOperators = ["+", "-"];
    const binaryBitwiseOperators = ["&", "|", "^", "<<", ">>", ">>>"];
    const unaryBitwiseOperators = ["~"];
    const binaryBooleanOperators = ["||", "&&", "==", "!="];
    const unaryBooleanOperators = ["!"];
    const binaryStringOperators = [".", "x", "==", "!="];
    const binaryOtherOperators = ["is"];
    const unaryOtherOperators = ["exists"];
    const minNumericPrecision2 = (typeA, typeB) => (typeA === "dec" || typeB === "dec") ? "dec"
        : (typeA === "int" || typeB === "int") ? "int"
            : "uint";
    const minNumericPrecision = (...types) => types.reduce(minNumericPrecision2, "uint");
    const operatorResults = {
        "+": (a, b = a) => minNumericPrecision(a, b),
        "-": (a, b = a) => minNumericPrecision("int", a, b),
        "*": (a, b = a) => minNumericPrecision(a, b),
        "/": "dec",
        "%": (a, b = a) => minNumericPrecision(a, b),
        "**": "dec",
        "<=": "bool",
        ">=": "bool",
        "<": "bool",
        ">": "bool",
        "==": "bool",
        "!=": "bool",
        "||": "bool",
        "&&": "bool",
        "!": "bool",
        "~": "int",
        "&": "int",
        "|": "int",
        "^": "int",
        "<<": "int",
        ">>": "int",
        ">>>": "int",
        ".": "string",
        "x": "string",
        "is": "bool",
        "exists": "bool",
    };
    const operatorPrecedence = [
        ["||"],
        ["&&"],
        ["|"],
        ["^"],
        ["&"],
        ["==", "!="],
        ["<", "<=", ">", ">="],
        ["is"],
        ["<<", ">>", ">>>"],
        ["x"],
        ["."],
        ["+", "-"],
        ["*", "/", "%"],
        ["**"],
        ["!"],
        ["~"],
        ["exists"],
    ];
    const binaryOperatorOperandCoercion = {
        ".": "string",
    };
    const unaryOperatorOperandCoercion = {
        "+": "dec",
        "-": "dec",
    };
    const operatorOperandBTypes = {
        "x": "uint",
    };
    class ChiriTypeManager {
        host;
        precedence = operatorPrecedence.map(a => a.slice());
        types = { ...types };
        binaryOperators = {};
        unaryOperators = {};
        binaryOperatorCoercion = {};
        unaryOperatorCoercion = {};
        registerBinaryOperator(typeA, operator, typeB = typeA, output, reversible = false) {
            const operatorsOfTypeA = this.binaryOperators[typeA] ??= {};
            let instancesOfThisOperator = operatorsOfTypeA[operator] ??= {};
            let result = output ?? operatorResults[operator];
            result = typeof result === "function" ? result(typeA, typeB) : result;
            if (!result)
                throw new Error(`Unable to determine output type of operation ${typeA}${operator}${typeB}`);
            if (instancesOfThisOperator[typeB] && instancesOfThisOperator[typeB] !== result)
                console.warn(ansi_1.default.err + `Operation ${typeA}${operator}${typeB}=${instancesOfThisOperator[typeB]} replaced with ${typeA}${operator}${typeB}=${result}`);
            instancesOfThisOperator[typeB] = result;
            if (!reversible)
                return;
            const operatorsOfTypeB = this.binaryOperators[typeB] ??= {};
            instancesOfThisOperator = operatorsOfTypeB[operator] ??= {};
            result = output ?? operatorResults[operator];
            result = typeof result === "function" ? result(typeB, typeA) : result;
            if (!result)
                throw new Error(`Unable to determine output type of operation ${typeB}${operator}${typeA}`);
            if (instancesOfThisOperator[typeA] && instancesOfThisOperator[typeA] !== result)
                console.warn(ansi_1.default.err + `Operation ${typeB}${operator}${typeA}=${instancesOfThisOperator[typeA]} replaced with ${typeB}${operator}${typeA}=${result}`);
            instancesOfThisOperator[typeA] = result;
        }
        registerUnaryOperator(operator, type, output) {
            const instancesOfThisOperator = this.unaryOperators[operator] ??= {};
            let result = output ?? operatorResults[operator];
            result = typeof result === "function" ? result(type) : result;
            if (!result)
                throw new Error(`Unable to determine output type of operation ${operator}${type}`);
            if (instancesOfThisOperator[type] && instancesOfThisOperator[type] !== result)
                console.warn(ansi_1.default.err + `Operation ${operator}${type}=${instancesOfThisOperator[type]} replaced with ${operator}${type}=${result}`);
            instancesOfThisOperator[type] = result;
        }
        registerBinaryCoercion(operator, coercion) {
            const coercibleTypes = Object.keys(types).filter((type) => type !== "body");
            const registerBinaryCoercion = (operandAType, operationsOfType) => {
                if (typeof coercion === "string" || coercion[1]) {
                    for (const operandBType of coercibleTypes) {
                        let result = operatorResults[operator];
                        result = typeof result === "function" ? result(operandAType, operandBType) : result;
                        this.registerBinaryOperator(operandAType, operator, operandBType, result);
                        const coercionsA = this.binaryOperatorCoercion[operandAType] ??= {};
                        const operations = coercionsA[operator] ??= {};
                        operations[operandBType] = coercion;
                    }
                }
                else {
                    for (const [operandBType, result] of Object.entries(operationsOfType)) {
                        this.registerBinaryOperator(operandAType, operator, operandBType, result);
                        const coercionsA = this.binaryOperatorCoercion[operandAType] ??= {};
                        const operations = coercionsA[operator] ??= {};
                        operations[operandBType] = coercion;
                    }
                }
            };
            if (typeof coercion === "string" || coercion[0]) {
                for (const operandAType of coercibleTypes) {
                    const operatorsOfTypeA = this.binaryOperators[operandAType] ??= {};
                    const instancesOfThisOperator = operatorsOfTypeA[operator] ??= {};
                    registerBinaryCoercion(operandAType, instancesOfThisOperator);
                }
            }
            else {
                for (const [operandAType, operators] of Object.entries(this.binaryOperators)) {
                    const existingOperation = operators[operator];
                    if (!existingOperation)
                        continue;
                    registerBinaryCoercion(operandAType, existingOperation);
                }
            }
        }
        registerUnaryCoercion(operator, coercion) {
            const coercibleTypes = Object.keys(types).filter((type) => type !== "body");
            for (const operandType of coercibleTypes) {
                let result = operatorResults[operator];
                result = typeof result === "function" ? result(operandType) : result;
                this.registerUnaryOperator(operator, operandType, result);
                const operations = this.unaryOperatorCoercion[operator] ??= {};
                operations[operandType] = coercion;
            }
        }
        constructor(host) {
            this.host = host;
            for (const operator of binaryNumericOperators)
                for (const typeA of numericTypes)
                    for (const typeB of numericTypes) {
                        this.registerBinaryOperator(typeA, operator, typeB);
                    }
            for (const operator of binaryBooleanOperators)
                this.registerBinaryOperator("bool", operator);
            for (const operator of unaryNumericOperators)
                for (const type of numericTypes)
                    this.registerUnaryOperator(operator, type);
            for (const operator of unaryBooleanOperators)
                this.registerUnaryOperator(operator, "bool");
            for (const operator of binaryStringOperators)
                this.registerBinaryOperator("string", operator, operatorOperandBTypes[operator] ?? "string");
            for (const [operator, coercion] of Object.entries(binaryOperatorOperandCoercion))
                this.registerBinaryCoercion(operator, coercion);
            for (const [operator, coercion] of Object.entries(unaryOperatorOperandCoercion))
                this.registerUnaryCoercion(operator, coercion);
            for (const type of Object.keys(types)) {
                this.registerBinaryOperator(type, "is", "string", "bool");
                this.registerBinaryOperator(type, "==", "undefined", "bool");
                this.registerBinaryOperator(type, "!=", "undefined", "bool");
                this.registerBinaryOperator("*", "==", type, "bool");
                this.registerBinaryOperator("*", "!=", type, "bool");
                this.registerUnaryOperator("exists", type, "bool");
            }
            this.registerBinaryOperator("*", "==", "undefined", "bool");
            this.registerBinaryOperator("*", "!=", "undefined", "bool");
        }
        registerGenerics(...generics) {
            for (const type of generics) {
                if (this.types[type.name.value]) {
                    if (this.types[type.name.value]?.type === type)
                        // reregistering due to sub reader
                        continue;
                    throw this.host.error(`Cannot redefine type "${type.name.value}"`);
                }
                if (type.generics.length === 1 && type.generics[0].name.value === "*")
                    type.generics = Object.values(this.types)
                        .map(typeDef => typeDef?.type)
                        .filter((type) => !!type && type.name.value !== "body");
                const componentTypeDefinitions = type.generics.map(component => {
                    const typeDef = this.types[component.name.value];
                    if (!typeDef)
                        throw this.host.error(`Type "${type.name.value}" depends on undefined type "${component.name.value}"`);
                    return typeDef;
                });
                this.types[type.name.value] = {
                    type,
                    stringable: componentTypeDefinitions.every(type => type.stringable) ? true : undefined,
                    consumeOptionalConstructor: reader => {
                        for (const type of componentTypeDefinitions) {
                            const result = type.consumeOptionalConstructor?.(reader);
                            if (result)
                                return result;
                        }
                        return undefined;
                    },
                };
                // register common operators for `generic OPERATOR value`
                for (const [typeA, operatorsOfTypeA] of Object.entries(this.binaryOperators)) {
                    if (!type.generics.some(generic => typeA === generic.name.value))
                        // skip, this isn't one of the component types
                        continue;
                    for (const [operator, instancesOfOperator] of Object.entries(operatorsOfTypeA)) {
                        for (const typeB of Object.keys(instancesOfOperator)) {
                            const returnTypes = [...new Set(type.generics.map(generic => this.binaryOperators[generic.name.value]?.[operator]?.[typeB]))];
                            if (returnTypes.includes(undefined))
                                // not common between all component types
                                continue;
                            if (returnTypes.length > 1 && !returnTypes.every(isNumeric))
                                // return types are not common between all component types
                                continue;
                            const returnType = returnTypes.length === 1 ? returnTypes[0] : minNumericPrecision(...returnTypes);
                            // this will register duplicates, but that's ok
                            this.registerBinaryOperator(type.name.value, operator, typeB, returnType);
                        }
                    }
                }
                // register common operators for `value OPERATOR generic`
                for (const [typeA, operatorsOfTypeA] of Object.entries(this.binaryOperators)) {
                    for (const [operator, instancesOfOperator] of Object.entries(operatorsOfTypeA)) {
                        for (const typeB of Object.keys(instancesOfOperator)) {
                            if (!type.generics.some(generic => typeB === generic.name.value))
                                // skip, this isn't one of the component types
                                continue;
                            const returnTypes = [...new Set(type.generics.map(generic => this.binaryOperators[generic.name.value]?.[operator]?.[typeB]))];
                            if (returnTypes.includes(undefined))
                                // not common between all component types
                                continue;
                            if (returnTypes.length > 1 && !returnTypes.every(isNumeric))
                                // return types are not common between all component types
                                continue;
                            const returnType = returnTypes.length === 1 ? returnTypes[0] : minNumericPrecision(...returnTypes);
                            // this will register duplicates, but that's ok
                            this.registerBinaryOperator(typeA, operator, type.name.value, returnType);
                        }
                    }
                }
                // register common operators for `OPERATOR value`
                for (const [operator, types] of Object.entries(this.unaryOperators)) {
                    const returnTypes = [...new Set(type.generics.map(generic => types[generic.name.value]))];
                    if (returnTypes.includes(undefined))
                        // not common between all component types
                        continue;
                    if (returnTypes.length > 1 && !returnTypes.every(isNumeric))
                        // return types are not common between all component types
                        continue;
                    const returnType = returnTypes.length === 1 ? returnTypes[0] : minNumericPrecision(...returnTypes);
                    this.registerUnaryOperator(operator, type.name.value, returnType);
                }
            }
        }
        deregisterGenerics(...generics) {
            for (const type of generics) {
                delete this.types[type.name.value];
                delete this.binaryOperators[type.name.value];
                for (const unaryOperator of Object.values(this.unaryOperators))
                    delete unaryOperator[type.name.value];
                for (const binaryOperators of Object.values(this.binaryOperators))
                    for (const binaryOperator of Object.values(binaryOperators))
                        delete binaryOperator[type.name.value];
            }
        }
        coerce(value, type, fromType) {
            const definition = this.types[type.name.value];
            if (!definition?.coerce)
                return value;
            return definition.coerce(value, () => {
                throw this.host.error(`Unable to coerce ${fromType ? `"${ChiriType_1.ChiriType.stringify(fromType)}"` : typeof value} to "${ChiriType_1.ChiriType.stringify(type)}"`);
            });
        }
        canCoerceOperandB(operandAType, operator, operandBType) {
            const coercion = this.binaryOperatorCoercion[operandAType]?.[operator]?.[operandBType];
            return typeof coercion === "string" || !!coercion?.[1];
        }
        isAssignable(type, ...toTypes) {
            if (toTypes.includes(type) || !toTypes.length)
                return true;
            toTypes = toTypes.flatMap(type => type.isGeneric ? type.generics : type);
            if (type.isGeneric && type.generics.every(type => toTypes.some(toType => this.isAssignable(type, toType))))
                // handle the case of generic assignability into generics
                return true;
            if (toTypes.length > 1) {
                if (this.isEveryType(toTypes))
                    return true;
                return toTypes.some(toType => this.isAssignable(type, toType));
            }
            // only 1 toType
            const [toType] = toTypes;
            if (toType.name.value === "*")
                return true;
            if (type.name.value === "*")
                // this should never happen
                throw new Error(`* is not a statically known type and therefore cannot be assigned to ${ChiriType_1.ChiriType.stringify(toType)}`);
            const typeDef = this.types[type.name.value];
            if (type.name.value === toType.name.value && type.generics && toType.generics && typeDef?.isAssignable)
                return typeDef.isAssignable(this, type, toType);
            if (isNumeric(type.name.value) && isNumeric(toType.name.value))
                // explicitly allow putting any numbers in contexts that expect specific types
                // they'll be clamped to what's valid(truncation for int, clamp to >= 0 for uint)
                return true; // minNumericPrecision(type.name.value, toType.name.value) === toType.name.value
            return type.name.value === toType.name.value
                && (false
                    // allow it if this is an "every" type
                    || this.isEveryType(type.generics)
                    // otherwise check if the generics are assignable
                    || type.generics.every((generic, i) => this.isAssignable(generic, toType.generics[i])));
        }
        isEveryType(types) {
            if (types.some(type => type.name.value === "*"))
                return true;
            return typesList.every(a => {
                if (a.type.name.value === "body")
                    return true; // skip
                const hasAssignableType = types.some(b => this.isAssignable(b, a.type));
                return hasAssignableType;
            });
        }
        dedupe(...types) {
            const result = [];
            for (const type of types)
                if (!result.some(test => test.name.value === type.name.value && test.generics.every((test, i) => test.name.value === type.generics[i].name.value)))
                    result.push(type);
            return result;
        }
        intersection(...types) {
            if (!types.length)
                throw this.host.error("Cannot form an intersection");
            types = this.dedupe(...types);
            if (types.length === 1)
                return types[0];
            const generics = types
                .filter(type => type.isGeneric)
                .sort((a, b) => b.generics.length - a.generics.length);
            const primaryType = generics[0];
            if (!primaryType) {
                if (types.every(type => isNumeric(type.name.value)))
                    return ChiriType_1.ChiriType.of(minNumericPrecision(...types.map(type => type.name.value)));
                throw this.host.error("Cannot form an intersection");
            }
            if (generics.length > 1)
                for (let i = 1; i < generics.length; i++)
                    if (generics[i].generics.some(generic => !primaryType.generics.some(primaryTypeGeneric => primaryTypeGeneric.name.value === generic.name.value)))
                        throw this.host.error(`Cannot form an intersection between types "${ChiriType_1.ChiriType.stringify(primaryType)}" and "${ChiriType_1.ChiriType.stringify(generics[i])}"`);
            const unableToIntersect = types.find(type => !type.isGeneric && !primaryType.generics.some(generic => generic.name.value === type.name.value));
            if (unableToIntersect)
                throw this.host.error(`Cannot form an intersection between types "${ChiriType_1.ChiriType.stringify(primaryType)}" and "${ChiriType_1.ChiriType.stringify(unableToIntersect)}"`);
            return primaryType;
        }
        with(...generics) {
            return {
                do: (handler) => {
                    this.registerGenerics(...generics);
                    const result = handler();
                    this.deregisterGenerics(...generics);
                    return result;
                },
            };
        }
        clone(reader) {
            const man = new ChiriTypeManager(reader);
            man.types = { ...this.types };
            man.unaryOperators = Object.fromEntries(Object.entries(this.unaryOperators)
                .map(([key, record]) => [key, { ...record }]));
            man.binaryOperators = Object.fromEntries(Object.entries(this.binaryOperators)
                .map(([key, record]) => [key, Object.fromEntries(Object.entries(record)
                    .map(([key, record]) => [key, { ...record }]))]));
            return man;
        }
    }
    exports.default = ChiriTypeManager;
});
//# sourceMappingURL=ChiriTypeManager.js.map
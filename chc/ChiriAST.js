/**
 * @typedef ChiriType
 * @property {"type"} type
 * @property {ChiriWord} name
 * @property {ChiriType[]} generics
 */

/**
 * @typedef ChiriBinaryExpression
 * @property {"expression"} type
 * @property {"binary"} subType
 * @property {ChiriExpressionOperand} operandA
 * @property {ChiriExpressionOperand} operandB
 * @property {string} operator
 * @property {string} valueType
 * @property {true=} wrapped
 */

/**
 * @typedef ChiriUnaryExpression
 * @property {"expression"} type
 * @property {"unary"} subType
 * @property {ChiriExpressionOperand} operand
 * @property {string} operator
 * @property {string} valueType
 */

/**
 * @typedef ChiriLiteralString
 * @property {"literal"} type
 * @property {"string"} subType
 * @property {(string | ChiriExpressionOperand)[]} segments
 */

/**
 * @typedef ChiriLiteralNumeric
 * @property {"literal"} type
 * @property {"uint" | "int" | "dec"} subType
 * @property {string} value
 * @property {ChiriPosition} position
 */

/**
 * @typedef ChiriLiteralBoolean
 * @property {"literal"} type
 * @property {"boolean"} subType
 * @property {boolean} value
 * @property {ChiriPosition} position
 */

/**
 * @typedef ChiriLiteralUndefined
 * @property {"literal"} type
 * @property {"undefined"} subType
 * @property {ChiriPosition} position
 * @property {undefined=} value
 */

/**
 * @typedef ChiriLiteralArray
 * @property {"literal"} type
 * @property {"array"} subType
 * @property {string} valueType
 * @property {ChiriExpressionOperand[]} value
 */

/**
 * @typedef {ChiriLiteralString | ChiriLiteralNumeric | ChiriLiteralBoolean | ChiriLiteralUndefined | ChiriLiteralArray} ChiriLiteralValue
 */

/**
 * @typedef ChiriVariableReference
 * @property {"get"} type
 * @property {ChiriWord} name
 * @property {string} valueType
 */

/**
 * @typedef {ChiriBinaryExpression | ChiriUnaryExpression | ChiriLiteralValue | ChiriVariableReference | ChiriValueText} ChiriExpressionOperand
 */

/**
 * @typedef ChiriCompilerVariable
 * @property {"variable"} type
 * @property {string} valueType
 * @property {ChiriWord} name
 * @property {ChiriExpressionOperand=} expression
 * @property {ChiriPosition} position
 * @property {"=" | "??="=} assignment
 */

/**
 * @typedef ChiriProperty
 * @property {"property"} type
 * @property {true=} isCustomProperty
 * @property {ChiriText} property
 * @property {ChiriValueText} value
 * @property {ChiriPosition} position
 */

/**
 * @typedef ChiriInterpolationVariable
 * @property {"interpolation-variable"} type
 * @property {ChiriWord} name
 * @property {ChiriPosition} position
 */

/**
 * @typedef ChiriInterpolationProperty
 * @property {"interpolation-property"} type
 * @property {ChiriText} name
 * @property {ChiriPosition} position
 */

/**
 * @typedef ChiriTextRaw
 * @property {"text-raw"} type
 * @property {string} text
 * @property {ChiriPosition} position
 */

/**
 * @typedef ChiriText
 * @property {"text"} type
 * @property {"string"} valueType
 * @property {(ChiriTextRaw | ChiriInterpolationVariable | ChiriExpressionOperand | string)[]} content
 * @property {ChiriPosition} position
 */

/**
 * @typedef ChiriValueText
 * @property {"text"} type
 * @property {"string"} valueType
 * @property {(ChiriTextRaw | ChiriInterpolationVariable | ChiriInterpolationProperty | ChiriExpressionOperand | string)[]} content
 * @property {ChiriPosition} position
 */

/**
 * @typedef ChiriPosition
 * @property {string} file
 * @property {number} line
 * @property {number} column
 */

/**
 * @typedef ChiriWord
 * @property {"word"} type
 * @property {string} value
 * @property {ChiriPosition} position
 */

/**
 * @typedef ChiriDocumentation
 * @property {"documentation"} type
 * @property {string} content
 */

/**
 * @typedef ChiriRoot
 * @property {"root"} type
 * @property {ChiriStatement[]} content
 */

/**
 * @typedef ChiriFunctionBase
 * @property {string} type
 * @property {ChiriWord} name
 * @property {ChiriStatement[]} content
 */

/**
 * @typedef ChiriFunction
 * @property {"function"} type
 * @property {ChiriWord} name
 * @property {ChiriStatement[]} content
 */

/**
 * @typedef ChiriFunctionUse
 * @property {"function-use"} type
 * @property {ChiriWord} name
 * @property {Record<string, ChiriExpressionOperand>} variables
 * @property {ChiriStatement[]} content
 */

/**
 * @typedef ChiriMixin
 * @property {"mixin"} type
 * @property {ChiriWord} name
 * @property {ChiriStatement[]} content
 * @property {boolean} used
 */

/**
 * @typedef ChiriMixinUse
 * @property {"mixin-use"} type
 * @property {ChiriWord} name
 * @property {Record<string, ChiriExpressionOperand>} variables
 */
//  * @property { ChiriStatement[] } content

/**
 * @typedef ChiriRule
 * @property {"rule"} type
 * @property {ChiriText | undefined} className
 * @property {ChiriText | undefined} state
 * @property {ChiriStatement[]} content
 */

/**
 * @typedef {"mixin" | "rule" | "function"} ChiriContext
 */

/**
 * @typedef ChiriPath
 * @property {string=} module
 * @property {string} path
 * @property {number} i
 */

/**
 * @typedef ChiriImport
 * @property {"import"} type
 * @property {ChiriPath[]} paths
 */

/**
 * @typedef ChiriBody
 * @property {ChiriStatement[]} content
 */

/**
 * @typedef {ChiriCompilerVariable | ChiriProperty | ChiriMixin | ChiriFunction | ChiriDocumentation | ChiriRule | ChiriMixinUse | ChiriFunctionUse | ChiriRoot} ChiriStatement
 */

/**
 * @typedef ChiriAST
 * @property {Record<string, string>} source Source file content keyed by file path
 * @property {ChiriStatement[]} statements
 */


/**
 * @typedef ChiriWriteConfig
 * @property {`.${string}`} extension
 */

/**
 * @typedef ChiriIIFE
 * @property {"iife"} type
 * @property {ChiriStatement[]} statements
 */

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

// /**
//  * @typedef ChiriLiteralOther
//  * @property {"literal"} type
//  * @property {"other"} subType
//  * @property {string} valueType
//  * @property {unknown} value
//  */

/**
 * @typedef {ChiriLiteralString | ChiriLiteralNumeric | ChiriLiteralBoolean | ChiriLiteralUndefined} ChiriLiteralValue
 */

/**
 * @typedef ChiriVariableReference
 * @property {"get"} type
 * @property {ChiriWord} name
 * @property {string} valueType
 */

/**
 * @typedef {ChiriBinaryExpression | ChiriUnaryExpression | ChiriLiteralValue | ChiriVariableReference} ChiriExpressionOperand
 */

/**
 * @typedef ChiriCompilerVariable
 * @property {"variable"} type
 * @property {string} valueType
 * @property {ChiriWord} name
 * @property {ChiriExpressionOperand=} expression
 * @property {ChiriPosition} position
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
 * @property {ChiriWord} name
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
 * @property {(ChiriTextRaw | ChiriInterpolationVariable | ChiriExpressionOperand)[]} content
 * @property {ChiriPosition} position
 */

/**
 * @typedef ChiriValueText
 * @property {"text"} type
 * @property {(ChiriTextRaw | ChiriInterpolationVariable | ChiriInterpolationProperty | ChiriExpressionOperand)[]} content
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
 * @typedef ChiriMixin
 * @property {"mixin"} type
 * @property {ChiriWord} name
 * @property {ChiriStatement[]} content
 */

/**
 * @typedef ChiriMixinUse
 * @property {"mixin-use"} type
 * @property {ChiriWord} name
 * @property {Record<string, ChiriExpressionOperand>} variables
 */

/**
 * @typedef ChiriRuleMain
 * @property {"rule"} type
 * @property {"main"} subType
 * @property {ChiriText} className
 * @property {ChiriStatement[]} content
 */

/**
 * @typedef ChiriRuleState
 * @property {"rule"} type
 * @property {"state"} subType
 * @property {string} state
 * @property {ChiriStatement[]} content
 */

/**
 * @typedef {ChiriRuleMain | ChiriRuleState} ChiriRule
 */

/**
 * @typedef ChiriBody
 * @property {ChiriStatement[]} content
 */

/**
 * @typedef {ChiriIIFE | ChiriCompilerVariable | ChiriProperty | ChiriMixin | ChiriDocumentation | ChiriRule | ChiriMixinUse} ChiriStatement
 */

/**
 * @typedef ChiriAST
 * @property {Record<string, string>} source Source file content keyed by file path
 * @property {ChiriStatement[]} statements
 */

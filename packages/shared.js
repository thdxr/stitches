export var { from, isArray } = Array

export var { stringify } = JSON

export var {
	assign,
	create,
	defineProperty,
	defineProperties,
	getOwnPropertyDescriptors,
	setPrototypeOf,
	toString: fToString,
	prototype: { toString: oToString },
} = Object

export var { ownKeys } = Reflect

export var { for: forSymbol, toPrimitive } = Symbol

// prettier-ignore

/** Returns the given value converted to kebab-case. */
export var toKebabCase = (/** @type {string} */ value) => (
	// ignore kebab-like values
	value.includes('-')
		? value
	// replace any upper-case letter with a dash and the lower-case variant
	: value.replace(/[A-Z]/g, (capital) => '-' + capital.toLowerCase())
)

// prettier-ignore

/** Returns the given value converted to camel-case. */
export var toCamelCase = (/** @type {string} */ value) => (
	/[A-Z]/.test(value)
		? value
	: value.replace(/-./g, (letter) => letter[1].toUpperCase())
)

// prettier-ignore

/** ... */
export var args = (name, data) => [
	typeof name === 'string' ? name : '',
	typeof name === 'object' && name || typeof data === 'object' && data || {},
]

export var $$composers = forSymbol('sxs.composers')

export var toSelector = (className) => '.' + className

import { toKebabCase } from '../../shared/toKebabCase.js'
import { getResolvedSelectors } from '../../stringify/src/getResolvedSelectors.js'

var { isArray } = Array
var { prototype, toString: fToString } = Object
var { toString: oToString } = prototype

var array = (knob, data) => (knob && isArray(data) ? data : [data])
var split = (name) => (name.includes(',') ? name.split(/\s*,\s*(?![^()]*\))/) : [name])

export function stringify(
	/** Object representing the current CSS. */
	value,
	/** Replacer function. */
	replacer = undefined,
) {
	/** Set used to manage the opened and closed state of rules. */
	var used = new WeakSet()

	var parse = (style, selectors, conditions, prevName, prevData) => {
		var cssText = ''

		each: for (var name in style) {
			var isAtRuleLike = name.charCodeAt(0) === 64

			for (var data of array(isAtRuleLike, style[name])) {
				if (replacer && (name !== prevName || data !== prevData)) {
					var next = replacer(name, data, style)

					if (next !== null) {
						// prettier-ignore
						cssText += (
							next == null
								? ''
							: (
								typeof next === 'function'
									? next.toString === fToString
								: typeof next === 'object'
									? next.toString === oToString
								: false
							)
								? parse(next, selectors, conditions, name, data)
							: next
						)

						continue each
					}
				}

				// prettier-ignore
				if (
					data === null
						? false
					: typeof data === 'function'
						? data.toString === fToString
					: typeof data === 'object'
						? data.toString === oToString
					: false
				) {
					if (used.has(selectors)) {
						used.delete(selectors)

						cssText += '}'
					}

					var usedName = Object(name)

					var nextSelectors = isAtRuleLike ? selectors : selectors.length ? getResolvedSelectors(selectors, split(name)) : split(name)

					cssText += parse(data, nextSelectors, isAtRuleLike ? conditions.concat(usedName) : conditions, undefined, undefined)

					if (used.has(usedName)) {
						used.delete(usedName)
						cssText += '}'
					}

					if (used.has(nextSelectors)) {
						used.delete(nextSelectors)
						cssText += '}'
					}
				} else {
					for (var i = 0; i < conditions.length; ++i) {
						if (!used.has(conditions[i])) {
							used.add(conditions[i])

							cssText += conditions[i] + '{'
						}
					}

					if (selectors.length && !used.has(selectors)) {
						used.add(selectors)

						cssText += selectors + '{'
					}

					cssText += (isAtRuleLike ? name + ' ' : toKebabCase(name) + ':') + String(data) + ';'
				}
			}
		}

		return cssText
	}

	return parse(value, [], [], undefined, undefined)
}

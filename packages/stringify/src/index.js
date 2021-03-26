import { toKebabCase } from './toCase.js'
import { getResolvedSelectors } from './getResolvedSelectors.js'

var functionStringifier = Function.call.bind(Function.toString)

var { isArray } = Array

var array = (knob, data) => (knob && isArray(data) ? data : [data])
var split = (name) => (name.includes(',') ? name.split(/\s*,\s*(?![^()]*\))/) : [name])

/** Returns a string of CSS from an object of CSS. */
export var stringify = (
	/** Object representing the current CSS. */
	value,
	/** Replacer function. */
	replacer = undefined,
) => {
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
						cssText += typeof next === 'object' && next ? parse(next, selectors, conditions, name, data) : next == null ? '' : next

						continue each
					}
				}

				var isObjectLike = typeof data === 'object' && data && data.length === undefined

				if (isObjectLike) {
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

					for (var each of array(name === '@import', data)) {
						cssText += (isAtRuleLike ? name + ' ' : toKebabCase(name) + ':') + String(each) + ';'
					}
				}
			}
		}

		return cssText
	}

	return parse(value, [], [], undefined, undefined)
}

import { toKebabCase } from '../../shared/toKebabCase.js'
import { getResolvedSelectors } from './getResolvedSelectors.js'
import { stringify as asJson } from '../../shared/JSON.js'

var functionStringifier = Function.call.bind(Function.toString)

var { create } = Object
var { isArray } = Array
var cache = create(null)
var array = (knob, data) => (knob && isArray(data) ? data : [data])
var split = (name) => (name.includes(',') ? name.split(/\s*,\s*(?![^()]*\))/) : [name])

/** Returns a string of CSS from an object of CSS. */
export function stringify(
	/** Object representing the current CSS. */
	value,
	/** Replacer function. */
	replacer = undefined,
) {
	var key1 = replacer ? functionStringifier(replacer) : ''
	var key2 = asJson(value)

	if (key1 in cache) {
		if (key2 in cache[key1]) {
			return cache[key1][key2]
		}
	} else {
		cache[key1] = create(null)
	}

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

	return (cache[key1][key2] = parse(value, [], [], undefined, undefined))
}

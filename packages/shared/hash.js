var { imul } = Math

/** ... */
export function hash(json) {
	/** @see https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript/52171480?#comment115384813_52171480 */
	for (var index = json.length, value = 9; index; ) {
		value = imul(value ^ json.charCodeAt(--index), 9 ** 9)
	}

	return ((value ^ (value >>> 9)) % 1e8).toString(36)
}

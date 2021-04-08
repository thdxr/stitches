import { useMemo } from '../../shared/useMemo.js'
import { Text, document } from '../../shared/dom.js'
import { hash } from '../../shared/hash.js'
import { stringify } from './stringify.js'
import { toSelector } from '../../shared/toSelector.js'

var { assign } = Object
var globalMemo = useMemo()
var defaultProps = {}
var $$composers = Symbol.for('sxs.composers')

/** @typedef {{ prefix?: string, media?: { [key: string]: string }, theme?: { [key: string]: string }, utils?: { [key: string]: string } }} InitConfig */
/** @typedef {{ prefix: string, media: { [key: string]: string }, theme: { [key: string]: string }, utils: { [key: string]: string } }} Config */
/** @typedef {<T, R>(data: T, make: (data: T, json: string) => R) => R} Memo */

export function createCss(/** @type {ConfigInit} */ config) {
	return globalMemo(config, initConfig)
}

function initConfig(/** @type {ConfigInit} */ config) {
	config = Object(config)

	config = {
		prefix: config.prefix || 's',
		media: {
			initial: 'all',
			...Object(config.media),
		},
		theme: {
			...Object(config.theme),
		},
		utils: {
			...Object(config.utils),
		},
	}

	return globalMemo(config, initInstance)
}

function initInstance(/** @type {Config} */ config) {
	var [importNode, globalNode, stylesNode, variesNode, inlineNode, cssContent] = globalMemo('sxs', () => {
		var bottle = /** @type {HTMLElement} */ (document.head.querySelector('.sxs-bottle') || document.head.appendChild(assign(document.createElement('sxs-style'), { className: 'sxs-bottle' })))

		var importNode = /** @type {HTMLStyleElement} */ (bottle.querySelector('.sxs-import') || bottle.appendChild(assign(document.createElement('style'), { className: 'sxs-import' })))
		var globalNode = /** @type {HTMLStyleElement} */ (bottle.querySelector('.sxs-global') || bottle.appendChild(assign(document.createElement('style'), { className: 'sxs-global' })))
		var stylesNode = /** @type {HTMLStyleElement} */ (bottle.querySelector('.sxs-styles') || bottle.appendChild(assign(document.createElement('style'), { className: 'sxs-styles' })))
		var variesNode = /** @type {HTMLStyleElement} */ (bottle.querySelector('.sxs-varies') || bottle.appendChild(assign(document.createElement('style'), { className: 'sxs-varies' })))
		var inlineNode = /** @type {HTMLStyleElement} */ (bottle.querySelector('.sxs-inline') || bottle.appendChild(assign(document.createElement('style'), { className: 'sxs-inline' })))

		var cssContent = {
			import: importNode.textContent,
			global: globalNode.textContent,
			styles: stylesNode.textContent,
			varies: variesNode.textContent,
			inline: inlineNode.textContent,
		}

		return /** @type {[HTMLStyleElement, HTMLStyleElement, HTMLStyleElement, HTMLStyleElement, HTMLStyleElement, { import: string, global: string, styles: string, varies: string, inline: string }]} */ ([
			importNode,
			globalNode,
			stylesNode,
			variesNode,
			inlineNode,
			cssContent,
		])
	})

	var memo = useMemo()

	// prettier-ignore
	return {
		config,
		flush() {
			importNode.replaceChildren()
			globalNode.replaceChildren()
			stylesNode.replaceChildren()
			variesNode.replaceChildren()
			inlineNode.replaceChildren()

			cssContent.import = ''
			cssContent.global = ''
			cssContent.styles = ''
			cssContent.varies = ''
			cssContent.inline = ''
		},
		global(style) {
			function render() {
				var node = memo(style, () => new Text(stringify(style)))

				if (!node.isConnected) {
					globalNode.appendChild(node)

					cssContent.global += node.data
				}

				return ''
			}

			render.toJSON = render
			render.toString = render

			return render
		},
		importUrl(/** @type {string[]} */ ...urls) {
			function render() {
				var node = memo(urls, (urls) => {
					var css = ''

					for (var url of urls) {
						css += `@import "${url}";`
					}

					return new Text(css)
				})

				if (!node.isConnected) {
					importNode.appendChild(node)

					cssContent.import += node.data
				}

				return ''
			}

			render.toJSON = render
			render.toString = render

			return render
		},
		css(...inits) {
			function render(props) {
				var [className, composers] = memo(inits, () => createComposers(memo, inits, config))

				props = typeof props === 'object' && props || defaultProps

				composers(props, {}, importNode, globalNode, stylesNode, variesNode, inlineNode, cssContent)

				var rendering = new String(className)

				rendering.className = className
				rendering.props = props
				rendering.selector = toSelector(className)

				return rendering
			}

			render.toJSON = () => render(defaultProps).className
			render.toString = () => render(defaultProps).className

			return render
		},
		toString() {
			return cssContent.import + cssContent.global + cssContent.styles + cssContent.varies + cssContent.inline
		},
	}
}

function createComposers(/** @type {Memo} */ memo, /** @type {any[]} */ inits, /** @type {Config} */ config) {
	var name = ''

	/** @type {((props: any) => void)[]>} */
	var composers = []

	for (var init of inits) {
		if (typeof init === 'function' || (typeof init === 'object' && init)) {
			if ($$composers in init) {
				// ...
			} else {
				var [composerName, composer] = memo(init, () => createComposer(memo, init, config))

				name = composerName

				composers.push(composer)
			}
		}
	}

	return /** @type {[string, (props) => void]} */ ([
		name,
		(...args) => {
			for (var composer of composers) {
				composer(...args)
			}
		},
	])
}

function createComposer(/** @type {Memo} */ memo, init, /** @type {Config} */ config) {
	var { variants, compoundVariants, defaultVariants = {}, ...style } = init

	void variants
	void compoundVariants
	void defaultVariants

	var [className, defaultText] = memo(style, (style, json) => {
		var className = config.prefix + hash(json)

		return /** @type {[String, Text]} */ ([
			className,
			new Text(
				stringify({
					[toSelector(className)]: style,
				}),
			),
		])
	})

	return /** @type {[string, (props, forwardProps) => void]} */ ([
		className,
		function composer(props, forwardProps, importNode, globalNode, stylesNode, variesNode, inlineNode, cssContent) {
			// ...
			console.log({ props, forwardProps })

			if (!defaultText.isConnected) {
				stylesNode.appendChild(defaultText)

				cssContent.global += defaultText.data
			}
		},
	])
}

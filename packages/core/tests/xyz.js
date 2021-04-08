import { createCss } from '../src/createCss.js'

const { css, global, flush, font, keyframes, toString } = createCss()

void css
void font
void global
void keyframes
void toString

console.clear()

const app = () => {
	flush()

	// const grow = keyframes({
	// 	'0%': { transform: 'scale(1)' },
	// 	'100%': { transform: 'scale(1.5)' },
	// })

	// const systemUi = font('system-ui', {
	// 	src: [
	// 		'local(".SFNS-Regular")',
	// 		'local(".SFNSText-Regular")',
	// 		'local(".HelveticaNeueDeskInterface-Regular")',
	// 		'local(".LucidaGrandeUI")',
	// 		'local("Segoe UI")',
	// 		'local("Ubuntu")',
	// 		'local("Roboto-Regular")',
	// 		'local("DroidSans")',
	// 		'local("Tahoma")',
	// 	],
	// })

	// const bodyStyle = global({
	// 	'.systemui': {
	// 		font: `100%/1.5 ${systemUi}`,
	// 	},
	// 	'.grow': {
	// 		animation: `1s ${grow}`,
	// 	},
	// })

	// bodyStyle()

	// global({
	// 	margin: 0,
	// })()

	const render = css({
		'margin': 0,
		'padding': 0,
		'&:hover, &:focus': {
			'textDecoration': 'none',
			'& span': {
				color: 'inherit',
			},
		},
		'variants': {
			color: {
				red: {
					color: 'tomato',
				},
			},
			size: {
				small: {},
				large: {
					fontSize: '125%',
				},
			},
		},
		'compoundVariants': [
			{
				color: 'red',
				size: 'small',
				css: {
					fontSize: '80%',
				},
			},
		],
	})

	console.log('render()', render({ color: 'red', size: 'small' }))

	console.log([toString()])
}

console.log('---')
console.log('app:')
app()

console.log('---')
console.log('app:')
app()

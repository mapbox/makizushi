import {spawn} from 'child_process'

import {createSVGWindow} from 'svgdom'
import {SVG, registerWindow} from '@svgdotjs/svg.js'
import beautify from 'xml-formatter'

const renderPath = './markers-src/alphanum'
const sizes = [11, 15, 20]

function createNewCanvas() {
	const window = createSVGWindow()
	const document = window.document
	registerWindow(window, document)
	const canvas = SVG(document.documentElement)
	return canvas
}

function renderTextToSvg(text) {
	const canvas = createNewCanvas().size(12, 12)
	const group = canvas.group()

	group.text(text)
		.x(6).y(-7)
		.font({
			size: '11px',
			family: 'Open Sans',
			weight: 'bold',
			'text-anchor': 'middle',
			'text-align': 'center',
			'text-rendering': 'optimizeLegibility',

			color: '#444444',
			'fill-opacity': '1',
		})

	return beautify(canvas.svg())
}

function renderSvgToPng(svg, outputPath, size) {
	const proc = spawn('inkscape', ['--pipe', '-o', outputPath, '-w', size, '-h', size])
	proc.stdin.write(svg)
	proc.stdin.end()
}

function renderAllPngs(text) {
	const svg = renderTextToSvg(text)
	const filename = text.toLowerCase()

	sizes.forEach(size => {
		renderSvgToPng(svg, `${renderPath}/${filename}-${size}.png`, size)
		renderSvgToPng(svg, `${renderPath}/${filename}-${size}@2x.png`, size * 2)
	})
}

for (let i = 1; i < 100; i++) {
	console.log(`rendering ${i}...`)
	renderAllPngs(`${i}`)
}
'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach((letter) => {
	console.log(`rendering ${letter}...`)
	renderAllPngs(`${letter}`)
})

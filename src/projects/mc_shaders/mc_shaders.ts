import { makeProject } from '@motion-canvas/core'

import { Code, LezerHighlighter } from '@motion-canvas/2d'
import { parser } from '../../lezer/glsl/parser'
import { codeStyle } from './styles'

import intro from './scenes/intro/intro?scene'
import glass from './scenes/glass/glass?scene'

Code.defaultHighlighter = new LezerHighlighter(
	parser.configure({
		dialect: 'glsl',
	}),
	codeStyle
)

export default makeProject({
	experimentalFeatures: true,
	scenes: [intro, glass],
})

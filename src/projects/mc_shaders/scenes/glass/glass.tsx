import {
	CODE,
	Circle,
	Code,
	Gradient,
	Img,
	Layout,
	Line,
	Node,
	Rect,
	Txt,
	lines,
	makeScene2D,
	word,
} from '@motion-canvas/2d'
import {
	Color,
	DEFAULT,
	Vector2,
	all,
	chain,
	createRef,
	createSignal,
	easeInOutCubic,
	sequence,
	usePlayback,
	waitFor,
} from '@motion-canvas/core'
import { CodeEditor } from '../../../../components/code_editor/code_editor'

import catppuccin from '../../../../backgrounds/catppuccin.glsl'
import { codeColors, theme } from '../../styles'

import glassShader from './glass.glsl'
import shader from './shader.glsl'
import { Taskbar } from '../../../../components/taskbar/taskbar'

import subjectImage from './image.png'
import { ShaderIcon } from '../../../../components/shader_icon/shader_icon'
import { ShaderPeeker } from '../../../../components/shader_peeker/shader_peeker'

const spacing = theme.spacing.windowTilingGap
const radius = theme.spacing.windowRadius
const c = theme.colors
const peekerFontSize = 17
const codeFontSize = 26

export default makeScene2D(function* (view) {
	view.add(<Rect size={view.size} shaders={catppuccin} />)

	view.add(<Txt y={500} text={() => a_step().toFixed(2)} />)
	view.fontFamily('JetBrains Mono')

	const uv_offset = createSignal(0)
	const duv_offset = createSignal(0)
	const a_step = createSignal(0)
	const uv_peek = createSignal(0)
	const d_field_peek = createSignal(0)
	const multiplier_peek = createSignal(0)

	const body = Code.createSignal(CODE`\
void main() {
    vec2 uv = sourceUV;
    uv += vec2(${() =>
			(uv_offset() < 0 ? '' : ' ') + uv_offset().toFixed(1)},${() =>
		(uv_offset() < 0 ? '' : ' ') + uv_offset().toFixed(1)});

    outColor = texture(sourceTexture, uv);
}`)

	const window = createRef<CodeEditor>()
	const code = createRef<Code>()
	const shaderPeekerContainer = createRef<Layout>()
	const codeContainerLayout = createRef<Layout>()
	const rightLayout = createRef<Layout>()
	const image = createRef<Img>()
	const taskbarSolidity = createSignal(0)
	const taskbarVisibility = createSignal(0)
	const windowActive = createSignal(0.01)
	view.add(
		<Layout
			size={view.size}
			layout
			direction={'column'}
			gap={() => taskbarSolidity() * spacing}
			padding={spacing}
		>
			<Node y={() => -60 + 60 * taskbarVisibility()}>
				<Taskbar taskbarHeight={35} height={() => taskbarSolidity() * 35} />
			</Node>
			<Layout width={'100%'} grow={1} gap={spacing} direction={'row'}>
				<Layout
					ref={shaderPeekerContainer}
					direction={'column'}
					// ? eyeballed to be look exactly like
					// ? space-between when all 3 peekers are revealed
					gap={40}
					// justifyContent={'space-between'} // ? only after all revealed
				/>
				<Layout
					ref={codeContainerLayout}
					grow={1}
					justifyContent={'center'}
					alignItems={'center'}
				>
					<CodeEditor
						ref={window}
						timer={usePlayback().time / 8 - 1 + 40}
						fontSize={codeFontSize}
						lineWidth={theme.spacing.lineNormal}
						title={'shader.glsl'}
						stroke={
							new Gradient({
								from: () => [window().width() / 1.9, 0],
								to: () => [-window().width() / 1.9, 0],
								stops: [
									{ color: codeColors.pink, offset: 0 },
									{
										color: codeColors.orange,
										offset: () => windowActive() / 2,
									},
									{ color: codeColors.lavender, offset: windowActive },
								],
							})
						}
					>
						<Code
							ref={code}
							fontFamily={'JetBrains Mono'}
							code={CODE`\
#version 300 es
precision highp float;

#include "@motion-canvas/core/shaders/common.glsl"

${body}`}
						/>
					</CodeEditor>
				</Layout>
				<Layout
					ref={rightLayout}
					direction={'column'}
					justifyContent={'center'}
				>
					<Img
						ref={image}
						src={subjectImage}
						width={'100%'}
						radius={radius}
						opacity={0}
					/>
					{/* <Layout
						ref={shaderPeekerContainer}
						// ? eyeballed to be look exactly like
						// ? space-between when all 3 peekers are revealed
						gap={40}
						// justifyContent={'space-between'} // ? only after all revealed
					/> */}
				</Layout>
			</Layout>
		</Layout>
	)

	const uvPeek = createRef<ShaderPeeker>()
	shaderPeekerContainer().add(
		<ShaderPeeker
			ref={uvPeek}
			fontSize={peekerFontSize}
			code={`vec4( uv, 0.0, 1.0 )`}
			shader={{
				fragment: shader,
				uniforms: {
					a_step,
					uv_offset,
					duv_offset,
					uv_peek: 1,
					d_field_peek: 0,
					multiplier_peek: 0,
				},
			}}
		/>
	)

	const distancePeek = createRef<ShaderPeeker>()
	shaderPeekerContainer().add(
		<ShaderPeeker
			ref={distancePeek}
			fontSize={peekerFontSize}
			code={`vec4( vec3( d ), 1.0 )`}
			shader={{
				fragment: shader,
				uniforms: {
					a_step,
					uv_offset,
					duv_offset,
					uv_peek: 0,
					d_field_peek: 1,
					multiplier_peek: 0,
				},
			}}
		/>
	)

	const multiplierPeek = createRef<ShaderPeeker>()
	shaderPeekerContainer().add(
		<ShaderPeeker
			ref={multiplierPeek}
			fontSize={peekerFontSize}
			code={`vec4( vec3( m ), 1.0 )`}
			shader={{
				fragment: shader,
				uniforms: {
					a_step,
					uv_offset,
					duv_offset,
					uv_peek: 0,
					d_field_peek: 0,
					multiplier_peek: 1,
				},
			}}
		/>
	)

	const chromatic = createSignal(0.001)
	const lens = createRef<Rect>()
	rightLayout().add(
		<Rect
			layout={false}
			ref={lens}
			size={0}
			stroke={
				new Gradient({
					from: () => [lens().width() / 1.9, 0],
					to: () => [-lens().width() / 1.9, 0],
					stops: [
						{ color: codeColors.pink, offset: 0 },
						{ color: codeColors.orange, offset: () => 0.5 },
						{ color: codeColors.lavender, offset: 1 },
					],
				})
			}
			fill={new Color(codeColors.orange).alpha(0.3)}
			lineWidth={5}
			shaders={{
				fragment: shader,
				uniforms: {
					// ? actual
					chromatic,

					// ? aux
					uv_offset,
					duv_offset,
					a_step,
					uv_peek,
					d_field_peek,
					multiplier_peek,
				},
			}}
			radius={1000}
		/>
	)

	const auxImg = createRef<Img>()
	view.add(
		<Img
			ref={auxImg}
			src={subjectImage}
			size={35}
			radius={35 / 2}
			position={() =>
				new Vector2({
					x: 1782.5000476837158,
					y: 42.5 - 60 + 60 * taskbarVisibility(),
				}).sub(view.size().div(2))
			}
			opacity={1}
		/>
	)

	const materialIcon = createRef<ShaderIcon>()
	view.add(
		<ShaderIcon
			zIndex={10}
			ref={materialIcon}
			position={() =>
				lens()
					.absolutePosition()
					.sub(view.size().div(2))
					.add(
						lens().getPointAtPercentage(
							0.75 + Math.sin(window().binaryTimer().timer()) / 10
						).position
					)
			}
			scale={0}
		/>
	)

	const shaderAnchor = createRef<Circle>()
	view.add(
		<Circle
			ref={shaderAnchor}
			size={30}
			fill={codeColors.pink}
			position={() =>
				window()
					.absolutePosition()
					.sub(view.size().div(2))
					.add(window().right())
					.addY(130 * Math.sin(window().binaryTimer().timer()))
			}
			scale={0}
		/>
	)

	const anchorLine = createRef<Line>()
	view.add(
		<Line
			ref={anchorLine}
			lineWidth={5}
			points={[shaderAnchor().position, materialIcon().position]}
			end={0}
		/>
	)

	yield* window().playTimer(8)

	yield* taskbarVisibility(1, 1)
	yield taskbarSolidity(1, 10)

	yield* all(
		rightLayout().grow(1, 1),
		codeContainerLayout().grow(0, 1),
		auxImg().size(image().size, 0.1),
		auxImg().absolutePosition(
			image().absolutePosition,
			1,
			easeInOutCubic,
			Vector2.polarLerp
		)
	)

	yield image().opacity(1)
	yield auxImg().remove()

	yield* all(
		lens().size(() => image().height() * 0.8, 1),

		window().title('magnifying_glass.glsl', 1),
		sequence(
			0.5,
			shaderAnchor().scale(1, 1),
			all(
				windowActive(1, 1),
				anchorLine().stroke(
					new Gradient({
						from: shaderAnchor().position,
						to: materialIcon().position,
						stops: [
							{ color: codeColors.pink, offset: 0 },
							{ color: '#fff', offset: 1 },
						],
					}),
					0.2
				),
				anchorLine().end(1, 1)
			),
			materialIcon().scale(1, 1)
		)
	)

	yield* code().selection(word(9, 23, 17), 1)

	yield* all(
		a_step(1, 1),
		body.replace(word(4, 23, 17), 'destinationTexture, destinationUV', 1),
		code().selection(word(9, 23, 33), 1)
	)

	// but what if we move the destinationUV around?
	yield* all(
		body.insert(
			[4, 56],
			CODE` ${() => (duv_offset() >= 0 ? '+' : '') + duv_offset().toFixed(1)}`,
			1
		),
		code().selection(word(9, 23, 38), 1)
	)

	yield* duv_offset(0.1, 1).wait(0.5).to(-0.1, 1)
	yield* duv_offset(0, 1)

	yield* all(
		a_step(2, 1),
		body.replace(word(4, 56, 5), ' + uv', 1),
		code().selection(word(9, 57, 4), 1).wait(0.5).to(word(7, 14, 11), 1)
	)

	yield* uv_offset(0.5, 1)

	yield* chain(
		code().selection(lines(7), 1),
		body.replace(word(2, 10, 15), CODE`${() => uv_offset().toFixed(1)}`, 1),
		code().selection(DEFAULT, 1)
	)

	// let's make both of these subtractions instead, for now they cancel out
	// but there's a reason we need this
	yield* chain(
		code().selection([word(7, 7, 2), word(9, 57, 1)], 1),
		all(
			body.replace(word(2, 7, 1), '-', 1),
			body.replace(word(4, 57, 1), '-', 1)
		),
		code().selection(DEFAULT, 1)
	)

	// proceed to explain centralizing the uv
	yield* all(
		uv_peek(1, 1),
		body.insert([4, 4], '// ', 1),
		body.insert([5, 0], '    outColor = vec4( uv, 0.0, 1.0 );\n', 1),
		code().selection([lines(7), lines(10)], 1)
	)

	// TODO: show coordinate arrows like in intro scene

	// the uv normally has 0 on the top left corner
	yield* chain(uv_offset(0, 1), code().selection(word(10, 15, 20), 1))

	const codeCloneRect = createRef<Rect>()
	const codeCloneCode = createRef<Code>()
	view.add(
		<Rect
			layout
			ref={codeCloneRect}
			fontSize={codeFontSize}
			padding={spacing / 2}
			radius={radius}
			topLeft={() =>
				code()
					.absolutePosition()
					.sub(view.size().div(2))
					.add(
						code()
							.getSelectionBBox(word(10, 15, 20))[0]
							.expand(spacing / 2).position
					)
			}
		>
			<Code
				ref={codeCloneCode}
				fontFamily={'JetBrains Mono'}
				code={'vec4( uv, 0.0, 1.0 )'}
			/>
		</Rect>
	)

	yield body.replace(word(5, 15, 20), ' '.repeat(20))

	yield* all(
		codeCloneRect().position(
			() => uvPeek().absolutePosition().sub(view.size().div(2)),
			1
		),
		codeCloneRect().fontSize(peekerFontSize, 1),
		codeCloneRect().opacity(1, 1).to(0, 0),
		codeCloneRect().fill(uvPeek().fill, 1),
		uvPeek().reveal()
	)

	// this is the distance from (0.0, 0.0)
	yield* all(
		d_field_peek(1, 1),
		uv_peek(0, 1),
		body.replace(
			word(5, 15, 20),
			'vec4( vec3( distance(uv, vec2(0.0) ), 1.0 )',
			1
		),
		code().selection(word(10, 15, 43), 1)
	)

	yield* code().selection(word(10, 27, 22), 1)

	yield* all(
		body.insert([3, 0], '\n    float d = distance(uv, vec2(0.0));\n', 1),
		code().selection([word(12, 27, 22), lines(9)], 1)
	)

	yield* all(
		body.replace(word(7, 27, 22), 'd', 1),
		code().selection([word(12, 27, 1), lines(9)], 1)
	)

	yield* code().selection(DEFAULT, 1)

	// we need to move the center to the center because we'll be distorting away from the center
	yield* uv_offset(0.5, 1)

	yield* code().selection(word(12, 15, 22), 1)

	codeCloneRect().topLeft(() =>
		code()
			.absolutePosition()
			.sub(view.size().div(2))
			.add(
				code()
					.getSelectionBBox(word(12, 15, 22))[0]
					.expand(spacing / 2).position
			)
	)
	codeCloneRect().opacity(1)
	codeCloneRect().fontSize(codeFontSize)
	codeCloneRect().fill(DEFAULT)
	codeCloneCode().code('vec4( vec3( d ), 1.0 )')

	yield body.replace(word(7, 15, 22), ' '.repeat(22))
	yield* all(
		codeCloneRect().position(
			() => distancePeek().absolutePosition().sub(view.size().div(2)),
			1
		),
		codeCloneRect().fontSize(peekerFontSize, 1),
		codeCloneRect().opacity(1, 1).to(0, 0),
		codeCloneRect().fill(distancePeek().fill, 1),
		distancePeek().reveal()
	)

	// back to showing the actual shader
	yield* all(
		d_field_peek(0, 1),
		// remove comment
		body.remove(word(6, 4, 3), 1),
		// remove distance line
		body.remove(lines(7), 1),
		code().selection(DEFAULT, 1)
	)

	const divisor = createSignal<number>(1)
	yield* all(
		body.insert([5, 0], CODE`\n    uv /= ${() => divisor().toFixed(1)};\n`, 1),
		code().selection(lines(11), 1)
	)

	yield* all(a_step(3, 3), divisor(10, 3))

	yield* code().selection(DEFAULT, 1)

	yield* all(
		body.insert([5, 0], '    float multiplier = 1.0 - pow(d, 3.0) * 8.0;\n', 1),
		code().selection(lines(10), 1)
	)

	yield* all(
		body.insert([9, 4], '// ', 1),
		body.insert(
			[10, 0],
			'    outColor = vec4( vec3( multiplier ), 1.0 );\n',
			1
		),
		code().selection([lines(15), lines(10)], 1),
		multiplier_peek(1, 1)
	)

	yield* all(
		body.replace(word(5, 10, 10), 'm', 1),
		body.replace(word(10, 27, 10), 'm', 1)
	)

	codeCloneRect().topLeft(() =>
		code()
			.absolutePosition()
			.sub(view.size().div(2))
			.add(
				code()
					.getSelectionBBox(word(15, 15, 22))[0]
					.expand(spacing / 2).position
			)
	)
	// ! SET TO 1 LATER
	codeCloneRect().opacity(1)
	codeCloneRect().fontSize(codeFontSize)
	codeCloneRect().fill(DEFAULT)
	codeCloneCode().code('vec4( vec3( m ), 1.0 )')

	yield body.replace(word(10, 15, 22), ' '.repeat(22))

	yield* all(
		codeCloneRect().position(
			() => multiplierPeek().absolutePosition().sub(view.size().div(2)),
			1
		),
		codeCloneRect().fontSize(peekerFontSize, 1),
		codeCloneRect().opacity(1, 1).to(0, 0),
		codeCloneRect().fill(multiplierPeek().fill, 1),
		multiplierPeek().reveal()
	)

	// back to showing the actual shader
	yield* all(
		multiplier_peek(0, 1),
		// remove comment
		body.remove(word(9, 4, 3), 1),
		// remove multiplier line
		body.remove(lines(10), 1),
		code().selection(DEFAULT, 1)
	)

	// apply multiplier
	yield* all(a_step(4, 1), body.insert([6, 0], '\n    uv *= m;', 1))

	// map multiplier to range [0, 1]
	yield* all(
		a_step(5, 1),
		body.insert([5, 14], 'smoothstep( 0.0, 1.0, ', 1),
		body.insert([5, 37], ' )', 1)
	)

	// reveal the outline
	yield* all(
		a_step(6, 1),
		body.insert(
			[11, 0],
			`
    vec4 source = texture(sourceTexture, sourceUV);
    outColor = mix(source, outColor, 1. - floor(source.a));\n`,
			1
		)
	)

	// but it still doesn't work for all sizes
	yield lens().save()
	yield* lens().size(lens().size().mul(2), 1).to(50, 1)
	yield* lens().restore(1)

	// modulate the uv based on texture size instead of dividing by 10
	yield* all(
		body.insert(
			[8, 0],
			'    vec2 size = vec2(textureSize(sourceTexture, 0));\n',
			1
		),
		code().selection(lines(13), 1).to(lines(13, 14), 1)
	)
	yield* all(a_step(7, 1), body.replace(word(9, 7, 7), '*= size / 3500.0', 1))
	yield* code().selection(DEFAULT, 1)
	yield lens().save()
	yield* lens().size(lens().size().mul(2), 1).to(50, 1)
	yield* lens().restore(1)

	shaderPeekerContainer().justifyContent('space-between')
	yield* all(uvPeek().hide(), distancePeek().hide(), multiplierPeek().hide())

	yield* waitFor(1)
})

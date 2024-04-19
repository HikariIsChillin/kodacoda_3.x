import {
	CODE,
	Circle,
	Code,
	Gradient,
	Line,
	LineProps,
	Rect,
	brightness,
	lines,
	makeScene2D,
	useScene2D,
	word,
} from '@motion-canvas/2d'
import {
	DEFAULT,
	Vector2,
	all,
	chain,
	createRef,
	createSignal,
	delay,
	easeInCubic,
	easeOutBack,
	easeOutCubic,
	easeOutElastic,
	linear,
	range,
	sequence,
	waitFor,
} from '@motion-canvas/core'
import { ShaderIcon } from '../../../../components/shader_icon/shader_icon'

import catppuccin from '../../../../backgrounds/catppuccin_dark.glsl'
import neumorphism from '../../shaders/neumorphism.glsl'
import { CodeEditor } from '../../../../components/code_editor/code_editor'
import { codeColors, theme } from '../../styles'

import shader from './shader.glsl'
import rulerShader from './ruler.glsl'

export default makeScene2D(function* (view) {
	view.add(
		<Rect
			size={useScene2D().getSize()}
			shaders={catppuccin}
			zIndex={-Infinity}
		/>
	)

	view.fontFamily('JetBrains Mono')

	view.size(1920 * 2)

	const waveDistance = createSignal(0)
	const waveDiff = createSignal(0.01)

	const material = createRef<ShaderIcon>()
	view.add(
		<ShaderIcon
			ref={material}
			scale={50}
			zIndex={10}
			filters={[brightness(0)]}
		/>
	)

	const wave = createRef<Rect>()
	view.add(
		<Rect
			ref={wave}
			zIndex={-10}
			size={1920}
			shaders={{
				fragment: neumorphism,
				uniforms: {
					size: () => material().size().mul(material().scale()),
					radius: () =>
						range(4).map(() => material().width() * material().scale().x * 0.5),
					waveDistance,
					waveDiff,
				},
			}}
		/>
	)

	yield* all(
		material().scale(15, 1, linear),
		material().filters([brightness(1)], 1)
	)
	yield* all(
		waveDistance(0.25, 3, easeOutElastic),
		waveDiff(0.005, 3, easeOutBack)
	)

	const body = Code.createSignal(`\
void main() {
    outColor = texture(sourceTexture, sourceUV);
}`)

	const windowActive = createSignal(0.01)
	const window = createRef<CodeEditor>()
	const code = createRef<Code>()
	view.add(
		<CodeEditor
			ref={window}
			timer={40}
			opacity={0}
			right={() => 0}
			fontSize={25}
			lineWidth={theme.spacing.lineNormal}
			title={'shader.glsl'}
			stroke={
				new Gradient({
					from: () => [window().width() / 1.9, 0],
					to: () => [-window().width() / 1.9, 0],
					stops: [
						{ color: codeColors.pink, offset: 0 },
						{ color: codeColors.orange, offset: () => windowActive() / 2 },
						{ color: codeColors.lavender, offset: windowActive },
					],
				})
			}
		>
			<Code
				ref={code}
				fontFamily={'JetBrains Mono'}
				opacity={0}
				code={CODE`\
#version 300 es
precision highp float;

#include "@motion-canvas/core/shaders/common.glsl"

${body}`}
			/>
		</CodeEditor>
	)

	yield* window().playTimer(8)

	const a_step = createSignal(0)
	const delta = Vector2.createSignal(0)

	const object = createRef<Rect>()
	view.add(
		<Rect
			ref={object}
			size={500}
			fill={theme.colors.darkBlue}
			stroke={codeColors.lavender}
			lineWidth={theme.spacing.lineNormal}
			shaders={{
				fragment: shader,
				uniforms: {
					a_step,
					delta,
				},
			}}
		/>
	)

	function* updateShader() {
		object().shaders(
			`#version 300 es
			precision highp float;
			
			uniform sampler2D sourceTexture;
			in vec2 sourceUV;
			out vec4 outColor;
			
			${body().fragments.join(' ')}`
		)

		yield* waitFor(0.5)
	}

	yield* all(
		waveDiff(0, 1),
		material().scale(1, 4),
		material().position(
			() =>
				object()
					.position()
					.add(
						object().getPointAtPercentage(
							0.875 + Math.sin(window().binaryTimer().timer()) / 16
						).position
					),
			4
		)
	)

	wave().shaders({
		fragment: neumorphism,
		uniforms: {
			size: object().size,
			radius: object().radius,
			waveDistance,
			waveDiff,
		},
	})

	wave().position(object().position)

	const anchorLine = createRef<Line>()
	view.add(
		<Line
			ref={anchorLine}
			stroke={
				new Gradient({
					from: object().left,
					to: window().right,
					stops: [
						{ color: '#fff', offset: 0 },
						{ color: codeColors.pink, offset: 1 },
					],
				})
			}
			lineWidth={5}
			points={[
				material().position,
				() =>
					window()
						.right()
						.add([0, Math.sin(window().binaryTimer().timer()) * 50]),
			]}
			end={0}
		/>
	)

	const anchorEnd = createRef<Circle>()
	view.add(
		<Circle
			ref={anchorEnd}
			size={30}
			fill={codeColors.pink}
			layout={false}
			position={() =>
				window()
					.right()
					.add([0, Math.sin(window().binaryTimer().timer()) * 50])
			}
			scale={0}
		/>
	)

	yield* sequence(
		0.25,
		object().left([200, 0], 2),
		window().opacity(1, 1.5),
		chain(
			anchorLine().end(1, 1, easeInCubic),
			all(
				anchorEnd().scale(1, 0.5, easeOutBack),
				windowActive(1, 1),
				code().opacity(1, 1),
				waveDiff(0.0025, 1),
				waveDistance(-0.0, 0).to(0.065, 1)
			)
		)
	)

	// view.add(<Txt text={() => step().toFixed(1)} y={300} />)

	yield* all(
		body.replace(word(1, 15), 'vec4(sourceUV.x, 0.0, 0.0, 1.0);\n', 1),
		code().selection(word(6, 15), 1),
		a_step(1, 1)
	)

	const u = createRef<Line>()
	const v = createRef<Line>()
	const axesProps: LineProps = {
		lineWidth: 15,
		stroke: '#fff',
		endArrow: true,
		startArrow: true,
		end: 0.5,
		start: 0.5,
	}

	view.add(
		<>
			<Line
				ref={u}
				{...axesProps}
				shaders={{
					fragment: rulerShader,
					uniforms: {
						delta: () => [delta().x, -1],
					},
				}}
				points={() => [
					object().topLeft().add([0, -100]),
					object().topRight().add([0, -100]),
				]}
			/>
			<Line
				ref={v}
				{...axesProps}
				shaders={{
					fragment: rulerShader,
					uniforms: {
						delta: () => [-1, delta().y],
					},
				}}
				points={() => [
					object().topRight().add([100, 0]),
					object().bottomRight().add([100, 0]),
				]}
			/>
		</>
	)

	u().add(
		<>
			{range(5).map((i) => {
				const axisVisibility = () => u().end() - u().start()
				const offset = () => (i / 4 - delta().x + 2000) % 1
				const edgeCloseness = () =>
					1 - Math.pow(2 * Math.abs(offset() - 0.5), 4)

				return (
					<Rect
						size={() => [5, axisVisibility() * edgeCloseness() * 40]}
						fill="#fff"
						position={() => u().getPointAtPercentage(offset()).position}
					/>
				)
			})}
		</>
	)

	v().add(
		<>
			{range(5).map((i) => {
				const axisVisibility = () => v().end() - v().start()
				const offset = () => (i / 4 - delta().y + 2000) % 1
				const edgeCloseness = () =>
					1 - Math.pow(2 * Math.abs(offset() - 0.5), 4)

				return (
					<Rect
						size={() => [axisVisibility() * edgeCloseness() * 40, 5]}
						fill="#fff"
						position={() => v().getPointAtPercentage(offset()).position}
					/>
				)
			})}
		</>
	)

	yield* all(u().end(1, 1), u().start(0, 1))

	yield* all(
		body.replace(word(1, 32, 3), 'sourceUV.y', 1),
		a_step(2, 1),
		v().end(1, 1),
		v().start(0, 1)
	)

	yield* code().selection(word(6, 20, 22), 1)

	yield* all(
		body.replace(word(1, 20, 22), 'sourceUV', 1),
		code().selection(word(6, 20, 8), 1)
	)

	yield* all(
		body.insert([1, 0], `    vec2 uv = sourceUV;\n\n`, 1),
		body.replace(word(1, 20, 8), 'uv', 1),
		code().selection(() => code().findAllRanges(/uv|vec2 uv = sourceUV;/gi), 1)
	)

	yield* code().selection(DEFAULT, 1)

	yield* all(
		body.insert(
			[2, 0],
			CODE`    uv += vec2(${() =>
				(delta().x < 0 ? '' : ' ') + delta().x.toFixed(1)},${() =>
				(delta().y < 0 ? '' : ' ') + delta().y.toFixed(1)});\n`,
			1
		),
		code().selection(lines(7), 1)
	)

	yield* delta([-1, 0], 1)
		.to([0, -1], 1)
		.to(0, 1)
		.to(0.5, 1)
		.to(-0.5, 1)
		.to(0, 1)

	yield* code().selection(DEFAULT, 1)

	yield* all(
		a_step(3, 1),
		body.replace(word(4, 15), 'texture(sourceTexture, uv);\n', 1),
		code().selection(lines(9), 1)
	)

	yield* code().selection(DEFAULT, 1)
	yield* code().selection(lines(7), 1)

	yield object().save()
	yield object().cachePadding(500)
	yield object().shaders({
		fragment: shader,
		uniforms: {
			step: a_step,
			delta: () => delta().div(3),
		},
	})

	yield* delta([-1, 0], 1)
		.to([0, -1], 1)
		.to(0, 1)
		.to(0.5, 1)
		.to(-0.5, 1)
		.to(0, 1)

	yield object().restore()
	yield* code().selection(DEFAULT, 1)

	yield* sequence(
		0.5,
		windowActive(0.01, 1),
		anchorEnd().scale(0, 1),
		anchorLine().end(0, 1),
		all(
			material().scale(0, 0.5),
			u().end(0.5, 0.7),
			u().start(0.5, 0.7),
			v().end(0.5, 0.7),
			v().start(0.5, 0.7),
			object().radius(() => object().width() / 2, 1),
			object().size(0, 1.5),
			delay(0.5, waveDistance(0, 1.5, easeInCubic).to(0.5, 1, easeOutCubic)),
			delay(1.5, waveDiff(0, 1.5))
		),
		window().position(0, 1)
	)

	yield* waitFor(1)
})

import {
	Code,
	CodeSignal,
	Layout,
	PossibleCodeScope,
	Rect,
	RectProps,
	codeSignal,
} from '@motion-canvas/2d'
import { theme } from '../theme'
import {
	Color,
	SignalValue,
	all,
	createRef,
	createSignal,
} from '@motion-canvas/core'
import { PossibleShaderConfig } from '@motion-canvas/2d/lib/partials/ShaderConfig'

export interface ShaderPeekerProps extends RectProps {
	code: SignalValue<PossibleCodeScope>
	shader: PossibleShaderConfig
}

export class ShaderPeeker extends Rect {
	@codeSignal()
	public declare readonly code: CodeSignal<this>

	private readonly lineVisibility = createSignal(0)
	private readonly rectVisibility = createSignal(0)

	private readonly codeRef = createRef<Code>()

	constructor({ ...props }: ShaderPeekerProps) {
		super({
			fill: new Color(theme.colors.lightBlue).darken(4).alpha(0.5),
			radius: theme.spacing.windowRadius,
			...props,
			clip: true,
			layout: true,
			direction: 'column',
		})

		this.opacity(() => (this.lineVisibility() > 0.99999 ? 1 : 0))

		this.add(
			<Layout
				size={() =>
					this.codeRef()
						.size()
						.add(theme.spacing.windowTilingGap)
						.mul(this.lineVisibility())
				}
			>
				<Code
					fontFamily={'JetBrains Mono'}
					layout={false}
					ref={this.codeRef}
					fontSize={this.fontSize}
					code={this.code}
				/>
			</Layout>
		)

		this.add(
			<Rect
				ratio={() => 1 / this.rectVisibility()}
				opacity={this.rectVisibility}
				shaders={props.shader}
			/>
		)
	}

	public *reveal() {
		yield* this.lineVisibility(1, 1)
		yield* this.rectVisibility(1, 1)
	}

	public *hide() {
		yield this.opacity(1)
		yield* all(this.lineVisibility(0, 1), this.rectVisibility(0, 1))
		yield this.opacity(() => (this.lineVisibility() > 0.99999 ? 1 : 0))
	}
}

import {
	Layout,
	Rect,
	RectProps,
	Txt,
	initial,
	signal,
} from '@motion-canvas/2d'
import { codeColors } from '../../projects/mc_shaders/styles'
import { SignalValue, SimpleSignal, createRef } from '@motion-canvas/core'
import { BinaryTimer } from '../binary_timer/binary_timer'

export interface CodeEditorProps extends RectProps {
	title?: SignalValue<string>
	timer?: SignalValue<number>
}

export class CodeEditor extends Rect {
	@initial('coda.koda')
	@signal()
	public declare readonly title: SimpleSignal<string, this>

	@initial(0)
	@signal()
	public declare readonly timer: SimpleSignal<number, this>

	@initial(true)
	@signal()
	public declare readonly timerAutoplay: SimpleSignal<boolean, this>

	public readonly binaryTimer = createRef<BinaryTimer>()

	public constructor(props?: CodeEditorProps) {
		super({
			// shaders: acrylic, // todo
			lineWidth: 2,
			stroke: codeColors.lavender,
			fill: '#000000b5',
			padding: 20,
			radius: 10,
			...props,
			layout: true,
			gap: props.fontSize,
			direction: 'column',
		})

		this.add(
			<Layout grow={1} clip>
				{props.children}
			</Layout>
		)

		this.add(
			<Layout
				direction={'row'}
				height={this.fontSize}
				justifyContent={'space-between'}
			>
				<Layout>
					<Rect
						height={this.fontSize}
						width={40}
						fill={codeColors.pink}
						radius={() => [this.fontSize() / 2, 0, 0, this.fontSize() / 2]}
					/>
					<Rect
						height={this.fontSize}
						width={30}
						fill={codeColors.pink}
						marginLeft={-10}
						marginRight={20}
						skew={[-30, 0]}
					/>
					<Layout
						direction={'column'}
						justifyContent={'space-between'}
						marginRight={10}
					>
						<Rect
							fill={codeColors.gray}
							width={20}
							height={() => this.fontSize() / 8}
						/>
						<Rect
							fill={codeColors.gray}
							width={10}
							height={() => this.fontSize() / 8}
						/>
						<Rect
							fill={codeColors.gray}
							width={20}
							height={() => this.fontSize() / 8}
						/>
						<Rect
							fill={codeColors.gray}
							width={15}
							height={() => this.fontSize() / 8}
						/>
					</Layout>
					<Txt
						fontSize={this.fontSize}
						fill={codeColors.pink}
						text={this.title}
					/>
				</Layout>

				<Layout>
					<BinaryTimer
						targetHeight={this.fontSize}
						ref={this.binaryTimer}
						timer={this.timer}
					/>

					<Rect
						height={this.fontSize}
						width={30}
						marginLeft={15}
						radius={() => [0, this.fontSize() / 2, this.fontSize() / 2, 0]}
						fill={codeColors.blue}
					/>
				</Layout>
			</Layout>
		)
	}

	public *playTimer(delta: number = 1, maxAnimateTime: number = 0.5) {
		yield* this.binaryTimer().playTimer(delta, maxAnimateTime)
	}

	public *stopTimer() {
		yield* this.binaryTimer().stopTimer()
	}
}

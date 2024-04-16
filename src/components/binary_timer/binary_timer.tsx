import {
	Layout,
	LayoutProps,
	Rect,
	Txt,
	initial,
	signal,
} from '@motion-canvas/2d'
import { codeColors } from '../../projects/mc_shaders/styles'
import {
	SignalValue,
	SimpleSignal,
	ThreadGenerator,
	all,
	cancel,
	chain,
	createSignal,
	linear,
	loop,
	range,
	waitFor,
} from '@motion-canvas/core'

export interface BinaryTimerProps extends LayoutProps {
	timer?: SignalValue<number>
	targetHeight?: SignalValue<number>
}

export class BinaryTimer extends Layout {
	@initial(0)
	@signal()
	public declare readonly timer: SimpleSignal<number, this>

	@initial(23)
	@signal()
	public declare readonly targetHeight: SimpleSignal<number, this>

	private timerTask: ThreadGenerator
	private declare readonly bits: SimpleSignal<number, void>[]

	public constructor(props?: BinaryTimerProps) {
		super({
			...props,
			layout: true,
			gap: 5,
			alignItems: 'center',
		})

		this.bits = range(8).map((_, i) =>
			createSignal(this.timer() & (1 << i) ? 1 : 0)
		)

		this.add(
			<>
				{range(8).map((i) => {
					const MVB = i % 4 === 0 && i !== 0

					return (
						<Rect
							width={10}
							height={() => 10 + this.bits[i]() * (this.targetHeight() - 10)}
							fill={codeColors.blue}
							radius={5}
							marginLeft={MVB ? 15 : 0}
						>
							{MVB && (
								<Layout layout={false}>
									<Txt
										// opacity={MVB ? 1 : 0}
										x={-15}
										fontSize={this.fontSize}
										fill={codeColors.blue}
										text={':'}
									/>
								</Layout>
							)}
						</Rect>
					)
				})}
			</>
		)
	}

	public *playTimer(delta: number = 1, maxAnimateTime: number = 0.5) {
		cancel(this.timerTask)

		const animateTime = Math.min(delta / 2, maxAnimateTime)
		const restTime = delta - animateTime

		this.timerTask = yield loop(() =>
			all(
				this.timer(this.timer() + 1, delta * 0.98, linear),
				chain(
					all(
						...this.bits.map((b, i) =>
							b(this.timer() & (1 << i) ? 1 : 0, animateTime)
						)
					),
					waitFor(restTime)
				)
			)
		)
	}

	public *stopTimer() {
		cancel(this.timerTask)
	}
}

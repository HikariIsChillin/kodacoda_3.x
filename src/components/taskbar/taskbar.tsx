import {
	Circle,
	Gradient,
	Layout,
	LayoutProps,
	Rect,
	initial,
	signal,
} from '@motion-canvas/2d'
import { codeColors, theme } from '../theme'
import { SignalValue, SimpleSignal } from '@motion-canvas/core'

export interface TaskbarProps extends LayoutProps {
	taskbarHeight?: SignalValue<number>
}

export class Taskbar extends Layout {
	@initial(35)
	@signal()
	public declare readonly taskbarHeight: SimpleSignal<number, this>

	public constructor(props?: TaskbarProps) {
		super({
			gap: theme.spacing.windowTilingGap,
			...props,
			layout: true,
			justifyContent: 'space-between',
		})

		this.add(
			// @ts-ignore
			<Layout gap={this.gap}>
				<Circle
					width={this.taskbarHeight}
					height={() => (this.clip() ? '100%' : this.taskbarHeight())}
					fill={theme.colors.pink}
				/>
				<Circle
					width={this.taskbarHeight}
					height={() => (this.clip() ? '100%' : this.taskbarHeight())}
					fill={theme.colors.pink}
				/>
				<Circle
					width={this.taskbarHeight}
					height={() => (this.clip() ? '100%' : this.taskbarHeight())}
					fill={theme.colors.pink}
				/>
				<Circle
					width={this.taskbarHeight}
					height={() => (this.clip() ? '100%' : this.taskbarHeight())}
					fill={theme.colors.pink}
				/>
			</Layout>
		)

		this.add(
			<Rect
				radius={() => this.taskbarHeight() / 2}
				height={() => (this.clip() ? '100%' : this.taskbarHeight())}
				width={400}
				fill={theme.colors.lightGreen}
			/>
		)

		this.add(
			// @ts-ignore
			<Layout gap={this.gap}>
				<Rect
					radius={() => this.taskbarHeight() / 2}
					height={() => (this.clip() ? '100%' : this.taskbarHeight())}
					width={50}
					fill={theme.colors.lightPurple}
				/>
				<Rect
					radius={() => this.taskbarHeight() / 2}
					height={() => (this.clip() ? '100%' : this.taskbarHeight())}
					width={100}
					fill={
						new Gradient({
							from: () => [-100 / 2, -this.taskbarHeight() / 2],
							to: () => [100 / 2, this.taskbarHeight() / 2],
							stops: [
								{ color: codeColors.orange, offset: 0 },
								{ color: codeColors.orange, offset: 0.2 - 0.02 },
								{ color: codeColors.purple, offset: 0.2 + 0.02 },
								{ color: codeColors.purple, offset: 0.4 - 0.02 },
								{ color: codeColors.orange, offset: 0.4 + 0.02 },
								{ color: codeColors.orange, offset: 0.6 - 0.02 },
								{ color: codeColors.purple, offset: 0.6 + 0.02 },
								{ color: codeColors.purple, offset: 0.8 - 0.02 },
								{ color: codeColors.orange, offset: 0.8 + 0.02 },
								{ color: codeColors.orange, offset: 1 },
							],
						})
					}
				/>
				<Rect
					radius={() => this.taskbarHeight() / 2}
					height={() => (this.clip() ? '100%' : this.taskbarHeight())}
					width={35}
					fill={theme.colors.indigo}
				/>
				<Rect
					radius={() => this.taskbarHeight() / 2}
					height={() => (this.clip() ? '100%' : this.taskbarHeight())}
					width={70}
					fill={theme.colors.darkBlue}
				/>
			</Layout>
		)
	}
}

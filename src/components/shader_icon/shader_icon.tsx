import { Circle, CircleProps, Gradient } from '@motion-canvas/2d'
import shader from './shader.glsl'

export interface ShaderIconProps extends CircleProps {}

export class ShaderIcon extends Circle {
	public constructor(props?: ShaderIconProps) {
		super({
			...props,
			lineWidth: 5,
			stroke: '#fff',
			size: 50,
			shaders: shader,
		})

		this.fill(
			() =>
				new Gradient({
					from: [0, -this.width() / 2],
					to: [0, this.width() / 2],
					stops: [
						{ color: '#ff003e', offset: 0.1 },
						{ color: '#ff6470', offset: 0.35 },
						{ color: '#ffc66d', offset: 0.48 },
						{ color: '#ffc66d', offset: 0.52 },
						{ color: '#99c47a', offset: 0.65 },
						{ color: '#68abdf', offset: 0.9 },
					],
				})
		)
	}
}

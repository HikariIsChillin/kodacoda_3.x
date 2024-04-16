import { Path, PathProps } from '@motion-canvas/2d'
import { K } from '../constants/kodacoda'

export interface KodaIconProps extends Omit<PathProps, 'data'> {}

export class KodaIcon extends Path {
	public constructor(props?: KodaIconProps) {
		super({
			fill: '#fff',
			offset: 1,
			...props,
			data: K,
		})
	}
}

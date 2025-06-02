import { APaddle } from './APaddle'
import { Ball } from './Ball'

export class LeftPlayer extends APaddle {
	faceTouched(ball: Ball): boolean {
		return this._isAtSameHeightOf(ball) &&
			ball.x - ball.radius <= this.x + APaddle.width &&
			ball.x > this.x;
	}
}

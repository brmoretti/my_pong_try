import { APaddle } from './APaddle'
import { Ball } from './Ball'

export class RightPlayer extends APaddle {
	faceTouched(ball: Ball): boolean {
		return this._isAtSameHeightOf(ball) &&
			ball.x + ball.radius >= this.x &&
			ball.x < this.x + APaddle.width;
	}
}

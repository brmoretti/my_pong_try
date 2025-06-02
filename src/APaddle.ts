import { Board } from './Board'
import { Ball } from './Ball'

export abstract class APaddle {
	readonly x: number
	y: number
	static readonly height: number = Board.height / 4;
	static readonly width: number = Board.width / 5;
	isDown = false;
	isUp = false;

	constructor(x: number, y: number) {
		this.x = x
		this.y = y - APaddle.height / 2
	}

	up() {
		if (this.y >= 0) {
			this.y -= Board.height / 100;
		}
	}

	down() {
		if (this.y + APaddle.height <= Board.height) {
			this.y += Board.height / 100;
		}
	}

	update() {
		if (this.isUp) {
			this.up();
		} else if (this.isDown) {
			this.down();
		}
	}

	abstract faceTouched(ball: Ball): boolean

	private _isSideBySideWith(ball: Ball): boolean {
		return ball.x > this.x &&
				ball.x < this.x + APaddle.width;
	}

	topTouched(ball: Ball): boolean {
		return this._isSideBySideWith(ball) &&
				this._isAtHeightofTop(ball)
	}

	bottonTouched(ball: Ball): boolean {
		return this._isSideBySideWith(ball) &&
				this._isAtHeightofBotton(ball)
	}

	protected _isAtSameHeightOf(ball: Ball): boolean {
		return ball.y >= this.y && ball.y <= this.y + APaddle.height;
	}

	private _isAtHeightofTop(ball: Ball): boolean {
		return ball.y + ball.radius >= this.y &&
				ball.y - ball.radius < this.y
	}

	private _isAtHeightofBotton(ball: Ball): boolean {
		return ball.y - ball.radius <= this.y + APaddle.height &&
				ball.y + ball.radius > this.y + APaddle.height
	}
}

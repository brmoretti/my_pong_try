import { Board } from './Board'

export class Paddle {
	readonly x: number
	y: number
	static readonly height: number = Board.height / 4;
	static readonly width: number = Board.width / 50;
	static readonly speed: number = Board.height / 100;
	currentSpeed = 0;
	isDown = false;
	isUp = false;

	constructor(x: number, y: number) {
		this.x = x
		this.y = y - Paddle.height / 2
	}

	up() {
		if (this.y >= 0) {
			this.y -= Paddle.speed;
		}
	}

	down() {
		if (this.y + Paddle.height <= Board.height) {
			this.y += Paddle.speed;
		}
	}

	update() {
		if (this.isUp) {
			this.up();
			this.currentSpeed = -Paddle.speed;
		} else if (this.isDown) {
			this.down();
			this.currentSpeed = Paddle.speed;
		} else {
			this.currentSpeed = 0;
		}
	}

}

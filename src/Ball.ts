import { Board } from "./Board"

export class Ball {
	readonly radius: number = Math.min(Board.width, Board.height) / 50;
	readonly startSpeed: number = Math.sqrt(Board.height ** 2 + Board.width ** 2) / 200;
	x: number;
	y: number;
	private ySpeed: number;
	private xSpeed: number;

	constructor(side: boolean) {
		this.x = 0;
		this.y = 0;
		this.ySpeed = 0;
		this.xSpeed = 0;
		this.reset(side);
	}

	reset(side: boolean) {
		this.x = Board.width / 2;
		this.y = Board.height / 2;
		this.xSpeed = this.randomBetween(0.3 * this.startSpeed, 0.9 * this.startSpeed);
		this.ySpeed = Math.sqrt(this.startSpeed ** 2 - this.xSpeed ** 2);
		this.xSpeed *= side ? 1 : -1;
		this.ySpeed *= Math.random() < 0.5 ? -1 : 1;
	}

	update() {
		if (this.y - this.radius <= 0 ||
			this.y + this.radius >= Board.height) {
			this.ySpeed *= -1;
		}

		if (this.x - this.radius <= 0) {
			this.reset(true);
			return;
		} else if (this.x + this.radius >= Board.width) {
			this.reset(false);
			return;
		}

		this.x += this.xSpeed;
		this.y += this.ySpeed;
	}

	invertXSpeed() {
		this.xSpeed *= -1;
	}

	invertYSpeed() {
		this.ySpeed *= -1;
	}

	setY(newY: number) {
		this.y = newY;
	}

	randomBetween(min: number, max: number) {
		return Math.random() * (max - min) + min;
	}
}

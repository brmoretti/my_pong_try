import { Board } from "./Board"
import { Paddle } from "./Paddle";

export enum Side {
	Left,
	Right
}

export class Ball {
	readonly radius: number = Math.min(Board.width, Board.height) / 50;
	readonly startSpeed: number = Board.diag / 200;
	readonly xAcceleration: number = 1.05;
	readonly drag: number = 0.3;
	x: number;
	y: number;
	private ySpeed: number;
	private xSpeed: number;

	constructor(side: Side) {
		this.x = 0;
		this.y = 0;
		this.ySpeed = 0;
		this.xSpeed = 0;
		this.reset(side);
	}

	reset(side: Side) {
		this.x = Board.width / 2;
		this.y = Board.height / 2;
		this.xSpeed = this.randomBetween(0.4 * this.startSpeed, 0.8 * this.startSpeed);
		this.ySpeed = Math.sqrt(this.startSpeed ** 2 - this.xSpeed ** 2);
		this.xSpeed *= side === Side.Right ? 1 : -1;
		this.ySpeed *= Math.random() < 0.5 ? -1 : 1;
	}

	update(player1: Paddle, player2: Paddle) {
		this.collisionFromBottonToTop(0);
		this.collisionFromTopToBotton(Board.height);

		if (this.x - this.radius <= 0) {
			this.reset(Side.Left);
			player2.scoreUp();
			return;
		} else if (this.x + this.radius >= Board.width) {
			this.reset(Side.Right);
			player1.scoreUp();
			return;
		}

		this.x += this.xSpeed;
		this.y += this.ySpeed;
	}

	invertXSpeed() {
		this.xSpeed *= -this.xAcceleration;
	}

	invertYSpeed() {
		this.xSpeed *= this.xAcceleration;
		this.ySpeed *= -1;
	}

	setY(newY: number) {
		this.y = newY;
	}

	collisionFromBottonToTop(y_level: number): boolean {
		if (this.ySpeed < 0 && this.y <= y_level) {
			this.y = y_level;
			this.invertYSpeed();
			return true;
		}
		return false;
	}

	collisionFromTopToBotton(y_level: number): boolean {
		if (this.ySpeed > 0 && this.y +  2 * this.radius >= y_level) {
			this.y = y_level - 2 * this.radius;
			this.invertYSpeed();
			return true;
		}
		return false;
	}

	collisionFromRightToLeft(x_level: number): boolean {
		if (this.xSpeed < 0 && this.x <= x_level) {
			this.x = x_level;
			this.invertXSpeed();
			return true;
		}
		return false;
	}

	collisionFromLeftToRight(x_level: number): boolean {
		if (this.xSpeed > 0 && this.x + 2 * this.radius >= x_level) {
			this.x = x_level - 2 * this.radius;
			this.invertXSpeed();
			return true;
		}
		return false;
	}

	isInFrontOf(lower_y: number, higher_y: number): boolean {
		return this.y + 2 * this.radius >= higher_y && this.y <= lower_y;
	}

	ballDrag(yDrag: number) {
		if (yDrag != 0) {
			const xDirection = Math.sign(this.xSpeed);
			const absoluteSpeed = Math.sqrt(this.xSpeed ** 2 + this.ySpeed ** 2);

			this.ySpeed = this.ySpeed * (1 - this.drag) + yDrag * this.drag;

			const xSpeedSquared = absoluteSpeed ** 2 - this.ySpeed ** 2;

			if (xSpeedSquared >= 0) {
				this.xSpeed = Math.sqrt(xSpeedSquared) * xDirection;
			} else {
				this.ySpeed = Math.sign(this.ySpeed) * absoluteSpeed * 0.99;
				this.xSpeed = Math.sqrt(absoluteSpeed ** 2 - this.ySpeed ** 2) * xDirection;
			}
		}
	}

	randomBetween(min: number, max: number) {
		return Math.random() * (max - min) + min;
	}
}

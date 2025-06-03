import { Board } from "./Board"

export enum Side {
	Left,
	Right
}

export class Ball {
	readonly radius: number = Math.min(Board.width, Board.height) / 50;
	readonly startSpeed: number = Math.sqrt(Board.height ** 2 + Board.width ** 2) / 100;
	readonly xAcceleration: number = 1.03;
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
		this.xSpeed = this.randomBetween(0.3 * this.startSpeed, 0.9 * this.startSpeed);
		this.ySpeed = Math.sqrt(this.startSpeed ** 2 - this.xSpeed ** 2);
		this.xSpeed *= side === Side.Right ? 1 : -1;
		this.ySpeed *= Math.random() < 0.5 ? -1 : 1;
	}

	update() {
		this.collisionFromBottonToTop(0);
		this.collisionFromTopToBotton(Board.height);

		if (this.x - this.radius <= 0) {
			this.reset(Side.Left);
			return;
		} else if (this.x + this.radius >= Board.width) {
			this.reset(Side.Right);
			return;
		}

		this.x += this.xSpeed;
		this.y += this.ySpeed;
	}

	invertXSpeed() {
		this.xSpeed *= -1 * this.xAcceleration;
	}

	invertYSpeed() {
		this.ySpeed *= -1;
	}

	setY(newY: number) {
		this.y = newY;
	}

	collisionFromBottonToTop(y_level: number): boolean {
		if (this.ySpeed <= 0 && this.y - this.radius <= y_level) {
			this.y = y_level + this.radius;
			this.invertYSpeed();
			return true;
		}
		return false;
	}

	collisionFromTopToBotton(y_level: number): boolean {
		if (this.ySpeed >= 0 && this.y + this.radius >= y_level) {
			this.y = y_level - this.radius;
			this.invertYSpeed();
			return true;
		}
		return false;
	}

	collisionFromRightToLeft(x_level: number): boolean {
		if (this.xSpeed <= 0 && this.x - this.radius <= x_level) {
			this.x = x_level + this.radius + this.xSpeed;
			this.invertXSpeed();
			return true;
		}
		return false;
	}

	collisionFromLeftToRight(x_level: number): boolean {
		if (this.xSpeed >= 0 && this.x + this.radius >= x_level) {
			this.x = x_level - this.radius;
			this.invertXSpeed();
			return true;
		}
		return false;
	}

	isInFrontOf(lower_y: number, higher_y: number): boolean {
		return this.y >= higher_y && this.y <= lower_y;
	}

	isOnTheSideOf(leftmost_x: number, rightmost_x: number): boolean {
		return this.x >= leftmost_x && this.x <= rightmost_x;
	}

	ballDrag(yDrag: number) {
		if (yDrag != 0) {
			this.ySpeed = this.ySpeed * (1 - this.drag) + yDrag * this.drag;
		}
	}

	randomBetween(min: number, max: number) {
		return Math.random() * (max - min) + min;
	}
}

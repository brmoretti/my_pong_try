import { Board } from "./Board"

export abstract class ABall {
	static readonly radius: number = Math.min(Board.width, Board.height) / 50;
	static readonly startSpeed: number = Board.diag / 200;
	static readonly acceleration: number = 1.02;
	static readonly drag: number = 0.2;
	protected		x: number = 0;
	protected		y: number = 0;
	protected		ySpeed: number = 0;
	protected		xSpeed: number = 0;

	constructor() {
	}

	abstract update(): void;

	accelerate() {
		this.xSpeed *= ABall.acceleration;
		this.ySpeed *= ABall.acceleration;
	}

	invertXSpeed() {
		this.xSpeed *= -1;
		this.accelerate();
	}

	invertYSpeed() {
		this.ySpeed *= -1;
		this.accelerate();
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
		if (this.ySpeed > 0 && this.y +  2 * ABall.radius >= y_level) {
			this.y = y_level - 2 * ABall.radius;
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
		if (this.xSpeed > 0 && this.x + 2 * ABall.radius >= x_level) {
			this.x = x_level - 2 * ABall.radius;
			this.invertXSpeed();
			return true;
		}
		return false;
	}

	isInFrontOf(lower_y: number, higher_y: number): boolean {
		return this.y + 2 * ABall.radius >= higher_y && this.y <= lower_y;
	}

	ballPaddleHit(paddleSpeed: number) {
		this.ySpeed += paddleSpeed * ABall.drag;

		const maxYSpeed = ABall.startSpeed;
		this.ySpeed = Math.max(-maxYSpeed, Math.min(maxYSpeed, this.ySpeed));
	}

	get currentX(): number {
		return this.x;
	}

	get currentY(): number {
		return this.y;
	}

	get currentXSpeed(): number {
		return this.xSpeed;
	}

	get currentYSpeed(): number {
		return this.ySpeed;
	}
}

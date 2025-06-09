import { Board } from "./Board";
import { ABall } from "./ABall";

export enum Side {
	Left,
	Right
}

export class Ball extends ABall {

	constructor() {
		super();
	}

	reset(side: Side) {
		this.x = Board.width / 2 - ABall.radius;
		this.y = Board.height / 2 - ABall.radius;
		this.xSpeed = Ball.randomBetween(0.4 * ABall.startSpeed, 0.8 * ABall.startSpeed);
		this.ySpeed = Math.sqrt(ABall.startSpeed ** 2 - this.xSpeed ** 2);
		this.xSpeed *= side === Side.Right ? 1 : -1;
		this.ySpeed *= Math.random() < 0.5 ? -1 : 1;
	}

	update() {
		if (this.xSpeed === 0 && this.ySpeed === 0) {
			this.reset(Side.Left);
		}

		this.x += this.xSpeed;
		this.y += this.ySpeed;
	}

	static randomBetween(min: number, max: number) {
		return Math.random() * (max - min) + min;
	}
}

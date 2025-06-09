import { ABall } from "./ABall";

export class AIBall extends ABall {

	constructor() {
		super();
	}

	update() {
		this.x += this.xSpeed;
		this.y += this.ySpeed;
	}

	copyBall(ball: ABall) {
		this.x = ball.currentX;
		this.y = ball.currentY;
		this.xSpeed = ball.currentX;
		this.ySpeed = ball.currentY;
	}

}

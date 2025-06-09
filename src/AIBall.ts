import { ABall } from "./ABall";

export class AIBall extends ABall {

	constructor(ball: ABall) {
		super();
		this.x = ball.currentX;
		this.y = ball.currentY;
		this.xSpeed = ball.currentX;
		this.ySpeed = ball.currentY;
	}

	update() {
		this.x += this.xSpeed;
		this.y += this.ySpeed;
	}

}

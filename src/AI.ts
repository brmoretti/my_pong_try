import { Board, Side } from './Board'
import { Ball } from './Ball'
import { Paddle } from './Paddle';

export class AI {
	protected aiTargetY: number = Board.height / 2;
	protected aiPlayer: Paddle;
	protected aiOpponent: Paddle;
	protected aiSide: Side;
	protected aiX: number;
	protected opponentX: number;


	constructor(ball: Ball, aiPlayer: Paddle, aiOpponent: Paddle) {
		this.aiPlayer = aiPlayer;
		this.aiOpponent = aiOpponent;
		if (aiPlayer.x > aiOpponent.x) {
			this.aiSide = Side.Right;
			this.aiX = aiPlayer.x;
			this.opponentX = aiOpponent.x + Paddle.width;
		} else {
			this.aiSide = Side.Left;
			this.aiX = aiPlayer.x + Paddle.width;
			this.opponentX = aiOpponent.x;
		}
	}

	predict(ball: Ball) {
		if (ball.currentXSpeed === 0 && ball.currentYSpeed === 0) {
			this.aiTargetY = Board.height / 2;
			return;
		}

		let timeToReach: number;
		if (this.aiSide === Side.Left) {
			timeToReach = (this.aiX - ball.rightX) / ball.currentXSpeed;
		} else {
			timeToReach = -((ball.leftX - this.aiX) / ball.currentXSpeed);
		}

		if (timeToReach < 0) {
			this.aiTargetY = Board.height / 2;
			return;
		}

		let newBall: Ball = new Ball(ball);

		if (this.isBallMovingAway(newBall)) {
			const predictedY: number = this.predictBallComming(newBall, timeToReach);
			if (newBall.currentXSpeed < 0) {
				newBall.setBallPosition(this.opponentX, predictedY - Ball.radius)
			} else {
				newBall.setBallPosition(this.opponentX - 2 * Ball.radius, predictedY - Ball.radius)
			}
			newBall.invertXSpeed();
			newBall.accelerate();
			const distBetweenPaddles: number = Math.abs(this.aiX - this.opponentX);
			timeToReach = distBetweenPaddles / newBall.currentXSpeed;
		}
		this.aiTargetY = this.predictBallComming(newBall, timeToReach);

	}

	isBallMovingAway(ball: Ball): Boolean {
		if (this.aiSide === Side.Left && ball.currentXSpeed > 0) return true;
		if (this.aiSide === Side.Right && ball.currentXSpeed < 0) return true;
		return false;
	}

	predictBallComming(ball: Ball, timeToReach: number): number {
		let predictedY: number = ball.centerY + (ball.currentYSpeed * timeToReach);

		let bounces = 0;
		const maxBounces = 10;

		if (ball.currentYSpeed === 0) {
			return Math.max(Ball.radius, Math.min(Board.height - Ball.radius, predictedY));
		}

		while ((predictedY - Ball.radius < 0 || predictedY + Ball.radius > Board.height) && bounces < maxBounces) {
			if (predictedY - Ball.radius < 0) {
				predictedY = -(predictedY - Ball.radius) + Ball.radius;
			}
			if (predictedY + Ball.radius > Board.height) {
				predictedY = 2 * Board.height - predictedY;
			}
			bounces++;
		}

		if (predictedY - Ball.radius < 0) predictedY = Ball.radius;
		if (predictedY + Ball.radius > Board.height) predictedY = Board.height - Ball.radius;

		return predictedY;
	}

	movePaddle() {
		const current_y: number = this.aiPlayer.y + (Paddle.height / 2);
		const tolerance = Board.height / 50;

		if (current_y < this.aiTargetY - tolerance) {
			this.aiPlayer.goDown = true;
			this.aiPlayer.goUp = false;
		} else if (current_y > this.aiTargetY + tolerance) {
			this.aiPlayer.goUp = true;
			this.aiPlayer.goDown = false;
		} else {
			this.aiPlayer.goDown = false;
			this.aiPlayer.goUp = false;
		}
	}

}

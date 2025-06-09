import { Board, Side } from './Board'
import { Ball } from './Ball';
import { Paddle } from './Paddle';
import { AIBall } from './AIBall'
import { ABall } from './ABall';

export class AI {
	protected		aiTargetY: number = Board.height / 2;
	protected		aiPlayer: Paddle;
	protected		aiOpponent: Paddle;
	protected		aiSide: Side;
	protected		aiX: number;
	protected		opponentX: number;
	protected		aiBall: AIBall;


	constructor(ball: Ball, aiPlayer: Paddle, aiOpponent: Paddle) {
		this.aiBall = new AIBall();
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

		this.aiBall.copyBall(ball);

		while (this.aiBall.currentX + 2 * ABall.radius < this.aiX) {
			this.aiBall.update();
			this.aiBall.collisionFromBottonToTop(0);
			this.aiBall.collisionFromTopToBotton(Board.height);
			this.aiBall.collisionFromRightToLeft(this.opponentX);
		}
		this.aiTargetY = this.aiBall.currentY + Ball.radius;
	}

	movePaddle() {
		while (this.aiPlayer.y + Paddle.height / 2 < this.aiTargetY) {
			this.aiPlayer.isDown = true;
		}
		this.aiPlayer.isDown = false;
		while (this.aiPlayer.y + Paddle.height / 2 > this.aiTargetY) {
			this.aiPlayer.isUp = true;
		}
		this.aiPlayer.isUp = false;
	}

}

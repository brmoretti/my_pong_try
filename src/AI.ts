import { Board } from './Board'
import { Ball } from './Ball';
import { Paddle } from './Paddle';
import { AIBall } from './AIBall'

export class AI {
	static readonly timer: number = 1000;
	protected		aiTargetY: number = Board.height / 2;
	protected		aiTimer: number = 0;
	protected		aiBall: AIBall;
	protected		player: Paddle;

	constructor(ball: Ball, player: Paddle) {
		this.aiBall = new AIBall(ball);
		this.player = player;
	}

}

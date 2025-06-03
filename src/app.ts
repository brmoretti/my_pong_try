import p5 from 'p5';
import 'p5/lib/addons/p5.dom'
import './styles.scss';
import { Paddle } from './Paddle';
import { Board } from './Board';
import { Ball } from './Ball'
import { Side } from './Ball'

const sketch = (p: p5) => {
	let player1: Paddle;
	let player2: Paddle;
	let ball: Ball;

	p.setup = () => {
		const canvas = p.createCanvas(Board.width, Board.height);
		canvas.parent('app');
		player1 = new Paddle(Board.backBorder, p.height / 2);
		player2 = new Paddle(Board.width - Board.backBorder - Paddle.width, p.height / 2);
		ball = new Ball(Side.Left);
	};

	p.draw = () => {
		p.clear();
		p.background(0);
		displayCenterLine();
		displayPaddle(player1);
		displayPaddle(player2);
		displayBall(ball);
		handleCollision(player1, player2, ball);
		player1.update();
		player2.update();
		ball.update();
	};

	p.keyPressed = () => {
		switch (p.key) {
			case 'a':
			case 'A': {
				player1.isUp = true;
				break;
			}
			case 'z':
			case 'Z': {
				player1.isDown = true;
				break;
			}
		}
		switch (p.keyCode) {
			case p.UP_ARROW: {
				player2.isUp = true;
				break;
			}
			case p.DOWN_ARROW: {
				player2.isDown = true;
				break;
			}
		}
	}

	p.keyReleased = () => {
		switch (p.key) {
			case 'a':
			case 'A': {
				player1.isUp = false;
				break;
			}
			case 'z':
			case 'Z': {
				player1.isDown = false;
				break;
			}
		}
		switch (p.keyCode) {
			case p.UP_ARROW: {
				player2.isUp = false;
				break;
			}
			case p.DOWN_ARROW: {
				player2.isDown = false;
				break;
			}
		}
	}

	function displayPaddle(paddle: Paddle) {
		p.stroke(255);
		p.rect(paddle.x, paddle.y, Paddle.width, Paddle.height)
	}

	function displayBall(ball: Ball) {
		p.stroke(255);
		p.circle(ball.x, ball.y, 2 * ball.radius);
	}

	function displayCenterLine() {
		p.stroke(255);
		p.line(Board.width / 2, 0, p.width / 2, Board.height);
	}

	function handleCollision(player1: Paddle, player2: Paddle, ball: Ball) {
		if (ball.isInFrontOf(player1.y + Paddle.height, player1.y) &&
			ball.collisionFromRightToLeft(player1.x + Paddle.width)) {
				ball.ballDrag(player1.currentSpeed);
				return;
			}
		if (ball.isInFrontOf(player2.y + Paddle.height, player2.y) &&
			ball.collisionFromLeftToRight(player2.x)) {
				ball.ballDrag(player2.currentSpeed);
				return;
			}
	}
};

new p5(sketch, document.getElementById('app') as HTMLElement);

import p5 from 'p5';
import 'p5/lib/addons/p5.dom'
import './styles.scss';
import { APaddle } from './APaddle';
import { Board } from './Board';
import { Ball } from './Ball'
import { LeftPlayer } from './LeftPlayer';
import { RightPlayer } from './RightPlayer';

const sketch = (p: p5) => {
	let player1: LeftPlayer;
	let player2: RightPlayer;
	let ball: Ball;

	p.setup = () => {
		const canvas = p.createCanvas(Board.width, Board.height);
		canvas.parent('app');
		player1 = new LeftPlayer(Board.backBorder, p.height / 2);
		player2 = new RightPlayer(Board.width - Board.backBorder - APaddle.width, p.height / 2);
		ball = new Ball(false);
	};

	p.draw = () => {
		p.clear();
		p.background(0);
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
			}z
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

	function displayPaddle(paddle: APaddle) {
		p.rect(paddle.x, paddle.y, APaddle.width, APaddle.height)
	}

	function displayBall(ball: Ball) {
		p.circle(ball.x, ball.y, 2 * ball.radius);
	}

	function handleCollision(player1: LeftPlayer, player2: RightPlayer, ball: Ball) {
		if (player1.faceTouched(ball) || player2.faceTouched(ball)) {
			ball.invertXSpeed();
		} else if (player1.topTouched(ball) {
			ball.setY(player1.y - ball.radius);
			ball.invertYSpeed;
		}
	}
};

new p5(sketch, document.getElementById('app') as HTMLElement);

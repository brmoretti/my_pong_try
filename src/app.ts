import p5 from 'p5';
import 'p5/lib/addons/p5.dom';
import 'p5/lib/addons/p5.sound'
import './styles.scss';
import { Paddle } from './Paddle';
import { Board } from './Board';
import { Ball } from './Ball'
import { Side } from './Ball'
import fontUrl from '../public/PressStart2P-Regular.ttf';
import { ABall } from './ABall';

let retroFont: p5.Font;

const sketch = (p: p5) => {
	enum GameState {
		StartScreen,
		Countdown,
		Playing,
		End
	}

	let gameState: GameState = GameState.StartScreen;
	let player1: Paddle;
	let player2: Paddle;
	let ball: Ball;
	let countdownStartTime: number = 0;
	const textSize: number = Board.diag / 10;
	const countdownDuration = 4000;

	p.preload = () => {
		retroFont = p.loadFont(fontUrl);
	};

	p.setup = () => {
		const canvas = p.createCanvas(Board.width, Board.height);
		canvas.parent('app');
		player1 = new Paddle(Board.backBorder, p.height / 2);
		player2 = new Paddle(Board.width - Board.backBorder - Paddle.width, p.height / 2);
		ball = new Ball();
	};

	p.draw = () => {
		p.clear();
		p.background(0);
		if (gameState === GameState.StartScreen) {
			displayStartScreen();
			return;
		}
		displayGameElements(player1, player2);
		if (gameState === GameState.Countdown) {
			displayCountdown();
		}
		player1.update();
		player2.update();
		if (gameState === GameState.Playing) {
			ball.update();
			handleCollision(player1, player2, ball);
			checkForPoint(player1, player2, ball);
			displayBall(ball);
		}
		checkScore(player1, player2);
		if (gameState === GameState.End) {
			displayWinnerScreen(player1, player2);
		}
	};

	p.keyPressed = () => {
		if (gameState === GameState.StartScreen) {
			if (p.key === ' ') {
				gameState = GameState.Countdown;
				countdownStartTime = p.millis();
			}
		}
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

	function displayStartScreen() {
		p.textFont(retroFont);
		p.textAlign(p.CENTER, p.CENTER);
		p.fill(255);
		p.textSize(textSize);
		p.text('PONG', Board.width / 2, Board.height / 2 - textSize / 2);
		p.textSize(textSize / 3);
		p.text('Press SPACE to Start!', Board.width / 2, Board.height / 2 + textSize / 3);
	}

	function displayWinnerScreen(player1: Paddle, player2: Paddle) {
		p.textFont(retroFont);
		const arrow: string = player1.currentScore > player2.currentScore ? "<---" : "--->";
		p.textAlign(p.CENTER, p.CENTER);
		p.fill(255);
		p.textSize(textSize / 2);
		p.text(arrow, Board.width / 2, Board.height / 2 - textSize / 2);
		p.textSize(textSize / 3);
		p.text('Won the game', Board.width / 2, Board.height / 2 + textSize / 3);
	}

	function displayCountdown() {
		p.textFont(retroFont);
		const elapsed = p.millis() - countdownStartTime;
		let count = 3 - Math.floor(elapsed / 1000);
		p.textAlign(p.CENTER, p.CENTER);
		p.stroke(255);
		p.fill(255);
		p.textSize(textSize);
		if (count > 0) {
			p.text(count.toString(), Board.width / 2, Board.height / 2);
		} else if (elapsed < countdownDuration) {
			p.text('GO!', Board.width / 2, Board.height / 2);
		} else {
			gameState = GameState.Playing;
		}
		return;
	}

	function displayPaddle(paddle: Paddle) {
		p.stroke(255);
		p.fill(255);
		p.rect(paddle.x, paddle.y, Paddle.width, Paddle.height)
	}

	function displayBall(ball: Ball) {
		p.stroke(255);
		p.fill(255);
		p.square(ball.currentX, ball.currentY, 2 * ABall.radius);
	}

	function displayCenterLine() {
		p.stroke(100);
		p.strokeWeight(4);
		p.strokeCap(p.SQUARE);
		p.fill(255);
		const dashLength = Board.height / 500 * 20;
		const gapLength = Board.height / 500 * 15;
		const totalSegment = dashLength + gapLength;

		for (let y = 0; y < Board.height; y += totalSegment) {
			const dashEnd = Math.min(y + dashLength, Board.height);
			p.line(Board.width / 2, y, Board.width / 2, dashEnd);
		}
		p.strokeWeight(1);
	}

	function displayScore(player: Paddle, side: Side) {
		p.textFont(retroFont);
		p.stroke(100);
		p.fill(100);
		p.textSize(textSize);
		const x_pos: number = - textSize / 4 + Board.width / 4;
		const y_pos: number = Board.height / 4;
		if (side === Side.Left) {
			p.text(player.currentScore, x_pos, y_pos);
		} else if (side === Side.Right) {
			p.text(player.currentScore, Board.width / 2 + x_pos, y_pos);
		}
	}

	function displayGameElements(player1: Paddle, player2: Paddle) {
		displayCenterLine()
		displayScore(player1, Side.Left);
		displayScore(player2, Side.Right);
		displayPaddle(player1);
		displayPaddle(player2);
	}

	function handleCollision(player1: Paddle, player2: Paddle, ball: Ball) {
		ball.collisionFromBottonToTop(0);
		ball.collisionFromTopToBotton(Board.height);
		if (ball.isInFrontOf(player1.y + Paddle.height, player1.y) &&
			ball.collisionFromRightToLeft(player1.x + Paddle.width)) {
			ball.ballPaddleHit(player1.currentSpeed);
			return;
		}
		if (ball.isInFrontOf(player2.y + Paddle.height, player2.y) &&
			ball.collisionFromLeftToRight(player2.x)) {
			ball.ballPaddleHit(player2.currentSpeed)
			return;
		}
	}

	function checkForPoint(player1: Paddle, player2: Paddle, ball: Ball) {
		if (ball.currentX <= 0) {
			ball.reset(Side.Left);
			player2.scoreUp();
		} else if (ball.currentX + 2 * ABall.radius >= Board.width) {
			ball.reset(Side.Right);
			player1.scoreUp();
		}
	}

	function checkScore(player1: Paddle, player2: Paddle) {
		if (player1.currentScore < 3 && player2.currentScore < 3) return;
		if (Math.abs(player1.currentScore - player2.currentScore) >= 2) {
			gameState = GameState.End;
		}
	}
};

new p5(sketch, document.getElementById('app') as HTMLElement);

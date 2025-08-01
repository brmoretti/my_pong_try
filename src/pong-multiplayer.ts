import p5 from 'p5';
import './styles.scss';
import { Config } from './config/Config';
import { Paddle } from './Paddle';
import { Board } from './Board';
import { Ball } from './Ball'
import { Side } from './Board'
import { AI } from './AI';
import { loadConfigFromJson } from './config/ConfigLoader';
import { MultiplayerClient, MultiplayerGameState } from './MultiplayerClient';

const fontUrl = new URL('../public/PressStart2P-Regular.ttf?url', import.meta.url).href;
let retroFont: p5.Font;

const sketch = (p: p5) => {

	const targetFrameRate = 144;

	enum GameMode {
		LocalSinglePlayer,
		LocalMultiplayer,
		OnlineMultiplayer
	}

	enum GameState {
		ModeSelection,
		StartScreen,
		Countdown,
		Playing,
		WaitingForPlayer,
		End
	}

	let gameMode: GameMode = GameMode.LocalSinglePlayer;
	let gameState: GameState = GameState.ModeSelection;
	let player1: Paddle;
	let player2: Paddle;
	let ball: Ball;
	const textSize: number = Board.diag / 10;
	let countdownStartTime: number = 0;
	let countdownValue: number = 3;

	// Multiplayer variables
	let multiplayerClient: MultiplayerClient | null = null;
	let myPlayerId: number | null = null;
	let isConnected: boolean = false;
	let gameEndedAndScoreExported: boolean = false;

	// Key state tracking for online multiplayer
	let keyState = {
		up: false,
		down: false
	};

	// Local game variables (for single player and local multiplayer)
	let config: Config;

	// AI variables for single player mode
	let ai2: AI | null = null;
	let aiUpdateTimer: number = 0;

	p.preload = () => {
		retroFont = p.loadFont(fontUrl);
	};

	p.setup = async () => {
		const canvas = p.createCanvas(Board.width, Board.height);
		canvas.parent('pong');

		p.frameRate(targetFrameRate);

		// Load config for local games
		config = await loadConfigFromJson();

		// Initialize paddles and ball for local games
		player1 = new Paddle(Board.backBorder, p.height / 2);
		player2 = new Paddle(Board.width - Board.backBorder - Paddle.width, p.height / 2);
		ball = new Ball();

		// Initialize AI for single player mode
		if (config.player2IsAI) {
			ai2 = new AI(ball, player2, player1);
		}
		aiUpdateTimer = p.millis();
	};

	p.draw = () => {
		p.clear();
		p.background(0);

		switch (gameState) {
			case GameState.ModeSelection:
				displayModeSelection();
				break;
			case GameState.StartScreen:
				displayStartScreen();
				break;
			case GameState.WaitingForPlayer:
				displayWaitingScreen();
				break;
			case GameState.Countdown:
				displayCountdown();
				break;
			case GameState.Playing:
				if (gameMode === GameMode.OnlineMultiplayer) {
					// For online multiplayer, game state is managed by server
					displayGameElements(player1, player2);
					displayBall(ball);
				} else {
					// Local game logic
					handleLocalGame();
				}
				break;
			case GameState.End:
				displayGameElements(player1, player2);
				displayWinnerScreen(player1, player2);
				break;
		}
	};

	function handleLocalGame(): void {
		displayGameElements(player1, player2);

		// Handle AI for single player mode
		if (gameMode === GameMode.LocalSinglePlayer && ai2) {
			const currentTime = p.millis();
			if (currentTime - aiUpdateTimer >= config.aiUpdateInterval) {
				ai2.predict(ball);
				aiUpdateTimer = currentTime;
			}
			ai2.movePaddle();
		}

		player1.update();
		player2.update();

		ball.update();
		handleCollision(player1, player2, ball);
		checkForPoint(player1, player2, ball);
		displayBall(ball);

		checkScore(player1, player2);
	}

	p.keyPressed = () => {
		if (gameState === GameState.ModeSelection) {
			switch (p.key) {
				case '1':
					gameMode = GameMode.LocalSinglePlayer;
					gameState = GameState.StartScreen;
					break;
				case '2':
					gameMode = GameMode.LocalMultiplayer;
					gameState = GameState.StartScreen;
					break;
				case '3':
					startOnlineMultiplayer();
					break;
			}
			return;
		}

		if (gameState === GameState.StartScreen) {
			if (p.key === ' ') {
				gameState = GameState.Countdown;
				countdownStartTime = p.millis();
				countdownValue = 3;
			}
			return;
		}

		if (gameState === GameState.End && p.key === 'r') {
			restartGame();
			return;
		}

		// Handle player input for key press
		if (gameMode === GameMode.OnlineMultiplayer) {
			// Update key state and send to server
			if (multiplayerClient && myPlayerId) {
				if (myPlayerId === 1) {
					if (p.key === 'a' || p.key === 'A') keyState.up = true;
					if (p.key === 'z' || p.key === 'Z') keyState.down = true;
				} else if (myPlayerId === 2) {
					if (p.keyCode === p.UP_ARROW) keyState.up = true;
					if (p.keyCode === p.DOWN_ARROW) keyState.down = true;
				}

				multiplayerClient.sendPaddleMove(keyState.up, keyState.down);
			}
		} else {
			// Local input handling for key press
			// Player 1 controls
			if (p.key === 'a' || p.key === 'A') {
				player1.direction = 1;
			}
			if (p.key === 'z' || p.key === 'Z') {
				player1.direction = -1;
			}

			// Player 2 controls (only in local multiplayer mode)
			if (gameMode === GameMode.LocalMultiplayer) {
				if (p.keyCode === p.UP_ARROW) {
					player2.direction = 1;
				}
				if (p.keyCode === p.DOWN_ARROW) {
					player2.direction = -1;
				}
			}
		}
	};

	p.keyReleased = () => {
		// Handle player input for key release
		if (gameMode === GameMode.OnlineMultiplayer) {
			// Update key state and send to server
			if (multiplayerClient && myPlayerId) {
				if (myPlayerId === 1) {
					if (p.key === 'a' || p.key === 'A') keyState.up = false;
					if (p.key === 'z' || p.key === 'Z') keyState.down = false;
				} else if (myPlayerId === 2) {
					if (p.keyCode === p.UP_ARROW) keyState.up = false;
					if (p.keyCode === p.DOWN_ARROW) keyState.down = false;
				}

				multiplayerClient.sendPaddleMove(keyState.up, keyState.down);
			}
		} else {
			// Local input handling for key release
			// Player 1 controls
			if (p.key === 'a' || p.key === 'A') {
				player1.direction = 0;
			}
			if (p.key === 'z' || p.key === 'Z') {
				player1.direction = 0;
			}

			// Player 2 controls (only in local multiplayer mode)
			if (gameMode === GameMode.LocalMultiplayer) {
				if (p.keyCode === p.UP_ARROW) {
					player2.direction = 0;
				}
				if (p.keyCode === p.DOWN_ARROW) {
					player2.direction = 0;
				}
			}
		}
	};

	function startOnlineMultiplayer(): void {
		gameMode = GameMode.OnlineMultiplayer;
		gameState = GameState.WaitingForPlayer;

		// Reset key state
		keyState.up = false;
		keyState.down = false;

		// Initialize multiplayer client
		multiplayerClient = new MultiplayerClient();

		// Set up event handlers
		multiplayerClient.setOnConnectionStatus((connected: boolean) => {
			isConnected = connected;
			if (connected) {
				// Join game with player name
				const playerName = config.player1 || `Player_${Math.floor(Math.random() * 1000)}`;
				multiplayerClient!.joinGame(playerName);
			}
		});

		multiplayerClient.setOnPlayerAssigned((playerId: number) => {
			myPlayerId = playerId;
			console.log(`I am Player ${playerId}`);
		});

		multiplayerClient.setOnGameStateUpdate((state: MultiplayerGameState) => {
			updateFromServerState(state);
		});

		multiplayerClient.setOnCountdown((value: number) => {
			countdownValue = value;
			gameState = GameState.Countdown;
		});

		multiplayerClient.setOnGameEnd((winner: string) => {
			gameState = GameState.End;
			if (!gameEndedAndScoreExported) {
				exportScoreToJson(player1, player2);
				gameEndedAndScoreExported = true;
			}
		});
	}

	function updateFromServerState(state: MultiplayerGameState): void {
		// Update paddles
		player1.setPosition(state.player1.y);
		player1.setScore(state.player1.score);

		player2.setPosition(state.player2.y);
		player2.setScore(state.player2.score);

		// Update ball
		ball.setBallPosition(state.ball.x, state.ball.y);
		ball.setBallSpeed(state.ball.xSpeed, state.ball.ySpeed);

		// Update game state
		switch (state.gameStatus) {
			case 'playing':
				gameState = GameState.Playing;
				break;
			case 'countdown':
				gameState = GameState.Countdown;
				if (state.countdownValue !== undefined) {
					countdownValue = state.countdownValue;
				}
				break;
			case 'ended':
				gameState = GameState.End;
				break;
			case 'waiting':
				gameState = GameState.WaitingForPlayer;
				break;
		}
	}

	function restartGame(): void {
		gameEndedAndScoreExported = false;

		// Reset key state
		keyState.up = false;
		keyState.down = false;

		if (gameMode === GameMode.OnlineMultiplayer && multiplayerClient) {
			multiplayerClient.restartGame();
		} else {
			// Local restart
			player1 = new Paddle(Board.backBorder, p.height / 2);
			player2 = new Paddle(Board.width - Board.backBorder - Paddle.width, p.height / 2);
			ball = new Ball();

			// Reinitialize AI for single player mode
			if (gameMode === GameMode.LocalSinglePlayer && config.player2IsAI) {
				ai2 = new AI(ball, player2, player1);
			} else {
				ai2 = null;
			}

			gameState = GameState.StartScreen;
		}
	}

	// Display functions
	function displayModeSelection(): void {
		p.textFont(retroFont);
		p.textAlign(p.CENTER, p.CENTER);
		p.fill(255);
		p.noStroke();
		p.textSize(textSize / 2);
		p.text('SELECT GAME MODE', Board.width / 2, Board.height / 4);

		p.textSize(textSize / 3);
		p.text('1 - Single Player (vs AI)', Board.width / 2, Board.height / 2 - textSize / 3);
		p.text('2 - Local Multiplayer', Board.width / 2, Board.height / 2);
		p.text('3 - Online Multiplayer', Board.width / 2, Board.height / 2 + textSize / 3);

		p.textSize(textSize / 4);
		p.text('Press the corresponding number', Board.width / 2, 3 * Board.height / 4);
	}

	function displayWaitingScreen(): void {
		p.textFont(retroFont);
		p.textAlign(p.CENTER, p.CENTER);
		p.fill(255);
		p.noStroke();
		p.textSize(textSize / 2);
		p.text('ONLINE MULTIPLAYER', Board.width / 2, Board.height / 3);

		p.textSize(textSize / 3);
		if (!isConnected) {
			p.text('Connecting to server...', Board.width / 2, Board.height / 2);
		} else {
			p.text('Waiting for another player...', Board.width / 2, Board.height / 2);
			p.textSize(textSize / 4);
			p.text(`You are Player ${myPlayerId || '?'}`, Board.width / 2, Board.height / 2 + textSize / 3);
		}
	}

	function displayStartScreen(): void {
		p.textFont(retroFont);
		p.textAlign(p.CENTER, p.CENTER);
		p.fill(255);
		p.noStroke();
		p.textSize(textSize);
		p.text('PONG', Board.width / 2, Board.height / 2 - textSize / 2);
		p.textSize(textSize / 3);

		let modeText = '';
		switch (gameMode) {
			case GameMode.LocalSinglePlayer:
				modeText = '';
				break;
			case GameMode.LocalMultiplayer:
				modeText = 'Local Multiplayer Mode';
				break;
		}

		p.text(modeText, Board.width / 2, Board.height / 2);
		p.text('Press SPACE to Start!', Board.width / 2, Board.height / 2 + textSize / 3);
	}

	function displayWinnerScreen(player1: Paddle, player2: Paddle): void {
		p.textFont(retroFont);
		const arrow: string = player1.currentScore > player2.currentScore ? "<---" : "--->";
		p.textAlign(p.CENTER, p.CENTER);
		p.fill(255);
		p.noStroke();
		p.textSize(textSize / 2);
		p.text(arrow, Board.width / 2, Board.height / 2 - textSize / 2);
		p.textSize(textSize / 3);
		p.text('Won the game', Board.width / 2, Board.height / 2 + textSize / 3);
		p.textSize(textSize / 4);
		p.text('Press R to restart', Board.width / 2, Board.height / 2 + 1.5 * textSize);
	}

	function displayCountdown(): void {
		const countdownDuration: number = 4000;

		p.textFont(retroFont);
		let count: number;

		if (gameMode === GameMode.OnlineMultiplayer) {
			count = countdownValue;
		} else {
			const elapsed = p.millis() - countdownStartTime;
			count = 3 - Math.floor(elapsed / 1000);

			if (elapsed >= countdownDuration) {
				gameState = GameState.Playing;
				return;
			}
		}

		p.textAlign(p.CENTER, p.CENTER);
		p.noStroke();
		p.fill(255);
		p.textSize(textSize);

		if (count > 0) {
			p.text(count.toString(), Board.width / 2, Board.height / 2);
		} else {
			p.text('GO!', Board.width / 2, Board.height / 2);
		}
	}

	function displayPaddle(paddle: Paddle): void {
		p.stroke(255);
		p.fill(255);
		p.rect(paddle.x, paddle.y, Paddle.width, Paddle.height)
	}

	function displayBall(ball: Ball): void {
		p.stroke(255);
		p.fill(255);
		p.square(ball.currentX, ball.currentY, 2 * Ball.radius);
	}

	function displayCenterLine(): void {
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

	function displayScore(player: Paddle, side: Side): void {
		p.textFont(retroFont);
		p.textAlign(p.CENTER, p.CENTER);
		p.fill(100);
		p.noStroke();
		p.textSize(textSize);
		const x_pos: number = - textSize / 4 + Board.width / 4;
		const y_pos: number = Board.height / 4;
		if (side === Side.Left) {
			p.text(player.currentScore, x_pos, y_pos);
		} else if (side === Side.Right) {
			p.text(player.currentScore, Board.width / 2 + x_pos, y_pos);
		}
	}

	function displayPlayerNames(): void {
		p.textFont(retroFont);
		p.textAlign(p.CENTER, p.CENTER);
		p.fill(100);
		p.noStroke();
		p.textSize(textSize / 8);
		const textHeight: number = 0.95 * Board.height;

		let player1Name = '';
		let player2Name = '';

		if (gameMode === GameMode.OnlineMultiplayer) {
			player1Name = 'Player 1';
			player2Name = 'Player 2';
		} else {
			player1Name = config.player1 || 'Player 1';
			player2Name = config.player2 || 'Player 2';
		}

		p.text(player1Name, Board.width / 4, textHeight);
		p.text(player2Name, 3 * Board.width / 4, textHeight);
	}

	function displayGameElements(player1: Paddle, player2: Paddle): void {
		displayCenterLine()
		displayScore(player1, Side.Left);
		displayScore(player2, Side.Right);
		displayPaddle(player1);
		displayPaddle(player2);
		displayPlayerNames();
	}

	function handleCollision(player1: Paddle, player2: Paddle, ball: Ball): void {
		ball.collisionFromBottomToTop(0);
		ball.collisionFromTopToBottom(Board.height);
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

	function checkForPoint(player1: Paddle, player2: Paddle, ball: Ball): void {
		if (ball.currentX <= 0) {
			ball.reset(Side.Left);
			player2.scoreUp();
		} else if (ball.currentX + 2 * Ball.radius >= Board.width) {
			ball.reset(Side.Right);
			player1.scoreUp();
		}
	}

	function checkScore(player1: Paddle, player2: Paddle): void {
		if (player1.currentScore < 3 && player2.currentScore < 3) return;
		if (Math.abs(player1.currentScore - player2.currentScore) >= 2) {
			gameState = GameState.End;
			if (!gameEndedAndScoreExported) {
				exportScoreToJson(player1, player2);
				gameEndedAndScoreExported = true;
			}
		}
	}

	function exportScoreToJson(player1: Paddle, player2: Paddle): void {
		const scoreData = {
			timestamp: new Date().toISOString(),
			gameMode: GameMode[gameMode],
			scores: {
				player1: {
					name: config?.player1 || 'Player 1',
					score: player1.currentScore
				},
				player2: {
					name: config?.player2 || 'Player 2',
					score: player2.currentScore
				}
			},
			winner: player1.currentScore > player2.currentScore ? 'player1' : 'player2'
		};

		const dataStr = JSON.stringify(scoreData, null, 2);
		const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

		const exportFileDefaultName = 'pong_score.json';

		const linkElement = document.createElement('a');
		linkElement.setAttribute('href', dataUri);
		linkElement.setAttribute('download', exportFileDefaultName);
		linkElement.click();
	}
};

new p5(sketch, document.getElementById('pong') as HTMLElement);

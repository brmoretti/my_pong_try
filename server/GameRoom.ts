import { Ball } from '../src/Ball.js';
import { Paddle } from '../src/Paddle.js';
import { Board } from '../src/Board.js';
import { Side } from '../src/Board.js';
import { GameState, PlayerInput } from './types.js';

export class GameRoom {
  private player1: Paddle;
  private player2: Paddle;
  private ball: Ball;
  private gameState: 'waiting' | 'countdown' | 'playing' | 'paused' | 'ended' = 'waiting';
  private countdownValue: number = 3;
  private countdownTimer: any | null = null;
  private gameLoop: any | null = null;
  private readonly targetFPS = 60;
  private readonly frameTime = 1000 / this.targetFPS;
  private players: Set<any> = new Set();
  private playerNames: { player1: string; player2: string } = { player1: '', player2: '' };

  constructor() {
    this.player1 = new Paddle(Board.backBorder, Board.height / 2);
    this.player2 = new Paddle(Board.width - Board.backBorder - Paddle.width, Board.height / 2);
    this.ball = new Ball();
  }

  addPlayer(socket: any): number | null {
    if (this.players.size >= 2) {
      return null; // Room is full
    }

    this.players.add(socket);
    const playerId = this.players.size;
    
    if (this.players.size === 2) {
      this.startCountdown();
    }

    return playerId;
  }

  removePlayer(socket: any): void {
    this.players.delete(socket);
    if (this.players.size < 2) {
      this.pauseGame();
    }
  }

  setPlayerName(playerId: number, name: string): void {
    if (playerId === 1) {
      this.playerNames.player1 = name;
    } else if (playerId === 2) {
      this.playerNames.player2 = name;
    }
  }

  handlePlayerInput(input: PlayerInput): void {
    const paddle = input.playerId === 1 ? this.player1 : this.player2;
    paddle.goUp = input.goUp;
    paddle.goDown = input.goDown;
  }

  private startCountdown(): void {
    this.gameState = 'countdown';
    this.countdownValue = 3;
    
    this.countdownTimer = setInterval(() => {
      this.countdownValue--;
      this.broadcastCountdown();
      
      if (this.countdownValue <= 0) {
        this.startGame();
      }
    }, 1000);
  }

  private startGame(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }

    this.gameState = 'playing';
    this.ball.reset(Side.Left);
    
    this.gameLoop = setInterval(() => {
      this.updateGame();
    }, this.frameTime);
  }

  private updateGame(): void {
    if (this.gameState !== 'playing') return;

    // Update paddles
    this.player1.update();
    this.player2.update();

    // Update ball
    this.ball.update();

    // Handle collisions
    this.handleCollision();

    // Check for points
    this.checkForPoint();

    // Check for game end
    this.checkScore();

    // Broadcast game state
    this.broadcastGameState();
  }

  private handleCollision(): void {
    this.ball.collisionFromBottomToTop(0);
    this.ball.collisionFromTopToBottom(Board.height);
    
    if (this.ball.isInFrontOf(this.player1.y + Paddle.height, this.player1.y) &&
        this.ball.collisionFromRightToLeft(this.player1.x + Paddle.width)) {
      this.ball.ballPaddleHit(this.player1.currentSpeed);
      return;
    }
    
    if (this.ball.isInFrontOf(this.player2.y + Paddle.height, this.player2.y) &&
        this.ball.collisionFromLeftToRight(this.player2.x)) {
      this.ball.ballPaddleHit(this.player2.currentSpeed);
      return;
    }
  }

  private checkForPoint(): void {
    if (this.ball.currentX <= 0) {
      this.ball.reset(Side.Left);
      this.player2.scoreUp();
    } else if (this.ball.currentX + 2 * Ball.radius >= Board.width) {
      this.ball.reset(Side.Right);
      this.player1.scoreUp();
    }
  }

  private checkScore(): void {
    if (this.player1.currentScore < 3 && this.player2.currentScore < 3) return;
    if (Math.abs(this.player1.currentScore - this.player2.currentScore) >= 2) {
      this.endGame();
    }
  }

  private endGame(): void {
    this.gameState = 'ended';
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }

    const winner = this.player1.currentScore > this.player2.currentScore 
      ? this.playerNames.player1 
      : this.playerNames.player2;

    this.broadcastGameEnd(winner);
  }

  private pauseGame(): void {
    this.gameState = 'paused';
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
  }

  restart(): void {
    this.player1 = new Paddle(Board.backBorder, Board.height / 2);
    this.player2 = new Paddle(Board.width - Board.backBorder - Paddle.width, Board.height / 2);
    this.ball = new Ball();
    
    if (this.players.size === 2) {
      this.startCountdown();
    } else {
      this.gameState = 'waiting';
    }
  }

  getGameState(): GameState {
    return {
      player1: {
        x: this.player1.x,
        y: this.player1.y,
        score: this.player1.currentScore,
        name: this.playerNames.player1
      },
      player2: {
        x: this.player2.x,
        y: this.player2.y,
        score: this.player2.currentScore,
        name: this.playerNames.player2
      },
      ball: {
        x: this.ball.currentX,
        y: this.ball.currentY,
        xSpeed: this.ball.currentXSpeed,
        ySpeed: this.ball.currentYSpeed
      },
      gameStatus: this.gameState,
      countdownValue: this.countdownValue
    };
  }

  private broadcastGameState(): void {
    const gameState = this.getGameState();
    this.players.forEach(socket => {
      socket.send(JSON.stringify({
        type: 'game_state',
        data: gameState
      }));
    });
  }

  private broadcastCountdown(): void {
    this.players.forEach(socket => {
      socket.send(JSON.stringify({
        type: 'countdown',
        data: { value: this.countdownValue }
      }));
    });
  }

  private broadcastGameEnd(winner: string): void {
    this.players.forEach(socket => {
      socket.send(JSON.stringify({
        type: 'game_end',
        data: { winner }
      }));
    });
  }

  isEmpty(): boolean {
    return this.players.size === 0;
  }

  isFull(): boolean {
    return this.players.size >= 2;
  }
}

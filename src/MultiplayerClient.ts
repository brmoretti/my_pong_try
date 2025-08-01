export interface MultiplayerGameState {
  player1: {
    x: number;
    y: number;
    score: number;
    name: string;
  };
  player2: {
    x: number;
    y: number;
    score: number;
    name: string;
  };
  ball: {
    x: number;
    y: number;
    xSpeed: number;
    ySpeed: number;
  };
  gameStatus: 'waiting' | 'countdown' | 'playing' | 'paused' | 'ended';
  countdownValue?: number;
  winner?: string;
}

export class MultiplayerClient {
  private ws: WebSocket | null = null;
  private playerId: number | null = null;
  private roomId: string | null = null;
  private gameStateCallback: ((state: MultiplayerGameState) => void) | null = null;
  private playerAssignedCallback: ((playerId: number) => void) | null = null;
  private countdownCallback: ((value: number) => void) | null = null;
  private gameEndCallback: ((winner: string) => void) | null = null;
  private connectionStatusCallback: ((connected: boolean) => void) | null = null;

  constructor() {
    this.connect();
  }

  private connect(): void {
    try {
      // Use environment variable or default to localhost
      // For Docker, we need to use the host's localhost, not container's localhost
      const wsHost = window.location.hostname || 'localhost';
      const wsPort = '8080';
      const wsUrl = `ws://${wsHost}:${wsPort}`;
      console.log('Connecting to WebSocket:', wsUrl);
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('Connected to game server');
        if (this.connectionStatusCallback) {
          this.connectionStatusCallback(true);
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleServerMessage(message);
        } catch (error) {
          console.error('Error parsing server message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('Disconnected from game server');
        if (this.connectionStatusCallback) {
          this.connectionStatusCallback(false);
        }
        // Attempt to reconnect after 3 seconds
        setTimeout(() => this.connect(), 3000);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect to server:', error);
      // Retry connection after 3 seconds
      setTimeout(() => this.connect(), 3000);
    }
  }

  private handleServerMessage(message: any): void {
    switch (message.type) {
      case 'player_assigned':
        this.playerId = message.data.playerId;
        this.roomId = message.data.roomId;
        console.log(`Assigned as Player ${this.playerId} in room ${this.roomId}`);
        if (this.playerAssignedCallback && this.playerId) {
          this.playerAssignedCallback(this.playerId);
        }
        break;

      case 'game_state':
        if (this.gameStateCallback) {
          this.gameStateCallback(message.data);
        }
        break;

      case 'countdown':
        if (this.countdownCallback) {
          this.countdownCallback(message.data.value);
        }
        break;

      case 'game_end':
        if (this.gameEndCallback) {
          this.gameEndCallback(message.data.winner);
        }
        break;

      case 'game_full':
        console.log('Game room is full');
        break;

      default:
        console.log('Unknown message type:', message.type);
    }
  }

  joinGame(playerName: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'join',
        data: { playerName }
      }));
    }
  }

  sendPaddleMove(goUp: boolean, goDown: boolean): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'paddle_move',
        data: { goUp, goDown }
      }));
    }
  }

  restartGame(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'restart'
      }));
    }
  }

  // Event handlers
  setOnGameStateUpdate(callback: (state: MultiplayerGameState) => void): void {
    this.gameStateCallback = callback;
  }

  setOnPlayerAssigned(callback: (playerId: number) => void): void {
    this.playerAssignedCallback = callback;
  }

  setOnCountdown(callback: (value: number) => void): void {
    this.countdownCallback = callback;
  }

  setOnGameEnd(callback: (winner: string) => void): void {
    this.gameEndCallback = callback;
  }

  setOnConnectionStatus(callback: (connected: boolean) => void): void {
    this.connectionStatusCallback = callback;
  }

  getPlayerId(): number | null {
    return this.playerId;
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

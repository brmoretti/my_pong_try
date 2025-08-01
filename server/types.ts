export interface GameState {
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

export interface ClientMessage {
  type: 'join' | 'paddle_move' | 'ready' | 'restart';
  data?: any;
}

export interface ServerMessage {
  type: 'game_state' | 'player_assigned' | 'game_full' | 'countdown' | 'game_end';
  data?: any;
}

export interface PlayerInput {
  playerId: number;
  goUp: boolean;
  goDown: boolean;
}

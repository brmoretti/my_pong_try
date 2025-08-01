import { WebSocket, WebSocketServer } from 'ws';
import { GameRoom } from './GameRoom.js';
import { ClientMessage, PlayerInput } from './types.js';

class GameServer {
  private wss: WebSocketServer;
  private rooms: Map<string, GameRoom> = new Map();
  private playerRooms: Map<WebSocket, string> = new Map();
  private playerIds: Map<WebSocket, number> = new Map();

  constructor(port: number = 8080, host: string = '0.0.0.0') {
    this.wss = new WebSocketServer({ port, host });
    console.log(`WebSocket server started on ${host}:${port}`);

    this.wss.on('connection', (ws: WebSocket) => {
      console.log('New client connected');
      this.handleConnection(ws);
    });
  }

  private handleConnection(ws: WebSocket): void {
    ws.on('message', (data: Buffer) => {
      try {
        const message: ClientMessage = JSON.parse(data.toString());
        this.handleMessage(ws, message);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
      this.handleDisconnection(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  private handleMessage(ws: WebSocket, message: ClientMessage): void {
    switch (message.type) {
      case 'join':
        this.handleJoin(ws, message.data?.playerName || 'Anonymous');
        break;
      case 'paddle_move':
        this.handlePaddleMove(ws, message.data);
        break;
      case 'ready':
        this.handleReady(ws);
        break;
      case 'restart':
        this.handleRestart(ws);
        break;
    }
  }

  private handleJoin(ws: WebSocket, playerName: string): void {
    // Find an available room or create a new one
    let roomId = this.findAvailableRoom();
    if (!roomId) {
      roomId = this.createRoom();
    }

    const room = this.rooms.get(roomId)!;
    const playerId = room.addPlayer(ws);

    if (playerId === null) {
      // Room is full
      ws.send(JSON.stringify({
        type: 'game_full',
        data: { message: 'Game room is full' }
      }));
      return;
    }

    // Store player information
    this.playerRooms.set(ws, roomId);
    this.playerIds.set(ws, playerId);
    room.setPlayerName(playerId, playerName);

    // Send player assignment
    ws.send(JSON.stringify({
      type: 'player_assigned',
      data: { playerId, roomId }
    }));

    // Send initial game state
    ws.send(JSON.stringify({
      type: 'game_state',
      data: room.getGameState()
    }));

    console.log(`Player ${playerId} (${playerName}) joined room ${roomId}`);
  }

  private handlePaddleMove(ws: WebSocket, inputData: any): void {
    const roomId = this.playerRooms.get(ws);
    const playerId = this.playerIds.get(ws);

    if (!roomId || !playerId) return;

    const room = this.rooms.get(roomId);
    if (!room) return;

    const playerInput: PlayerInput = {
      playerId,
      goUp: inputData.goUp || false,
      goDown: inputData.goDown || false
    };

    room.handlePlayerInput(playerInput);
  }

  private handleReady(ws: WebSocket): void {
    const roomId = this.playerRooms.get(ws);
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (!room) return;

    // Logic for when player is ready (could trigger countdown if both players ready)
    console.log('Player ready in room:', roomId);
  }

  private handleRestart(ws: WebSocket): void {
    const roomId = this.playerRooms.get(ws);
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (!room) return;

    room.restart();
    console.log('Game restarted in room:', roomId);
  }

  private handleDisconnection(ws: WebSocket): void {
    const roomId = this.playerRooms.get(ws);
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (room) {
      room.removePlayer(ws);

      // Clean up empty rooms
      if (room.isEmpty()) {
        this.rooms.delete(roomId);
        console.log(`Room ${roomId} deleted (empty)`);
      }
    }

    this.playerRooms.delete(ws);
    this.playerIds.delete(ws);
  }

  private findAvailableRoom(): string | null {
    for (const [roomId, room] of this.rooms.entries()) {
      if (!room.isFull()) {
        return roomId;
      }
    }
    return null;
  }

  private createRoom(): string {
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.rooms.set(roomId, new GameRoom());
    console.log(`Created new room: ${roomId}`);
    return roomId;
  }
}

// Start the server
const server = new GameServer(8080);

export default GameServer;

# 🎮 Pong Classic 🎮

A modern implementation of the classic Pong game, built with p5.js, TypeScript, and Parcel. Challenge a friend or test your skills against an AI opponent!

## ✨ Features

*   **Classic Pong Gameplay:** Relive the timeless arcade experience.
*   **Multiple Game Modes:**
    *   **Single Player:** Play against an AI opponent
    *   **Local Multiplayer:** Compete against a friend on the same keyboard
    *   **Online Multiplayer:** Play against another player over the internet using WebSockets
*   **Configurable Experience:**
    *   Set custom player names or let the game generate random ones.
    *   Configure which player is AI-controlled (single player mode).
    *   Adjust AI update interval via `public/config.json`.
*   **Score Export:** Automatically exports the final score to a JSON file when the game ends.
*   **Custom Retro Font:** Uses "Press Start 2P" for an authentic arcade feel.
*   **Built with Modern Tools:** TypeScript for type safety and Parcel for efficient bundling.
*   **Real-time Multiplayer:** WebSocket-based multiplayer with automatic room management.

## 🛠️ Tech Stack

*   **Core Logic & Rendering:** [p5.js](https://p5js.org/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Build Tool / Bundler:** [Parcel 2](https://parceljs.org/)
*   **Package Manager:** [npm](https://www.npmjs.com/)
*   **Styling:** SCSS (minimally used for core structure)
*   **Multiplayer:** WebSockets with [ws](https://github.com/websockets/ws) library
*   **Containerization:** Docker & Docker Compose

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

*   [Node.js](https://nodejs.org/) (LTS version recommended, which includes npm)
*   A modern web browser (e.g., Chrome, Firefox, Edge, Safari)

## 🚀 Getting Started

Follow these steps to get the game up and running on your local machine.

### 1. Clone the Repository

If you haven't already, clone the project to your local machine.
```bash
git clone https://github.com/brmoretti/my_pong_try.git
cd my_pong_try
```

### 2. Install Dependencies

Open your terminal in the project root directory (`your-pong-repository`) and run:

```bash
npm install
```

This command will download and install all the necessary packages defined in `package.json`, including p5.js, Parcel, TypeScript, and Sass.

### 3. Running the Project (Development Mode)

To start the game in development mode with live reloading:

1.  Open your terminal in the project root directory.
2.  Run the following command:
    ```bash
    npm start
    ```
    This will start the Parcel development server, typically at `http://localhost:1234`. Parcel will automatically open the game in your default web browser. If it doesn't, navigate to the URL shown in your terminal.

    Any changes you make to the source code (e.g., in the `src` directory) will trigger an automatic rebuild and refresh the page in your browser.

### 4. Building for Production

To create an optimized build of the game for deployment:

1.  Open your terminal in the project root directory.
2.  Run the following command:
    ```bash
    npm run build
    ```
    This command will compile and bundle all assets into the `dist` directory. You can then deploy the contents of the `dist` folder to any static web hosting service.

## 🐳 Running with Docker

The project includes Docker support for easy deployment and consistent environments:

### Using Docker Compose (Recommended)

```bash
# Build and start both client and server
docker-compose up

# Run in detached mode
docker-compose up -d

# Stop the containers
docker-compose down

# Rebuild containers (after dependency changes)
docker-compose up --build
```

### Manual Docker Commands

```bash
# Build the image
docker build -t pong-game .

# Run the container with port mapping
docker run -p 1234:1234 -p 8080:8080 pong-game
```

### Access Points

The game will be available at:
- **Client:** `http://localhost:1234`
- **WebSocket Server:** `ws://localhost:8080` (automatically handled by the client)

### Network Configuration

The multiplayer client automatically detects the correct WebSocket server URL:
- **Local Development:** Connects to `ws://localhost:8080`
- **Docker/Production:** Connects using the browser's current hostname
- **Custom Server:** Set the `WS_HOST` environment variable if needed

### Troubleshooting

If you can't connect to the multiplayer server:

1. **Check if both ports are accessible:**
   ```bash
   # Test HTTP client
   curl http://localhost:1234
   
   # Run the connection test script
   ./test-connection.sh
   ```

2. **Docker Network Issues:**
   ```bash
   # Check if containers are running
   docker ps
   
   # Check container logs
   docker logs <container-name>
   
   # Rebuild with fresh network
   docker-compose down
   docker-compose up --build
   ```

3. **WebSocket Connection Issues:**
   - The client automatically detects the correct WebSocket URL
   - In Docker: Client uses `ws://localhost:8080` (mapped from container)
   - The server binds to `0.0.0.0:8080` to accept external connections
   - Check browser console for WebSocket connection errors

4. **Port Conflicts:**
   ```bash
   # Check if ports are already in use
   netstat -tuln | grep -E ':(1234|8080)'
   
   # Kill conflicting processes if needed
   sudo lsof -ti:1234 | xargs kill -9
   sudo lsof -ti:8080 | xargs kill -9
   ```

5. **Firewall Issues:** Ensure ports 1234 and 8080 are not blocked by your firewall

## 🌐 Deployment

For production deployment:

1. **Static Hosting (Single Player/Local Multiplayer only):**
   - Build the project: `npm run build`
   - Deploy the `dist` folder to services like Netlify, Vercel, or GitHub Pages

2. **Full Stack Deployment (with Online Multiplayer):**
   - Deploy using Docker to platforms like Heroku, AWS, DigitalOcean, or any VPS
   - Ensure both ports 1234 (HTTP) and 8080 (WebSocket) are accessible
   - Update the WebSocket URL in `MultiplayerClient.ts` to match your production domain

## Technologies Used

*   **[p5.js](https://p5js.org/):** A JavaScript library for creative coding, used here for rendering the game and handling user input.
*   **[TypeScript](https://www.typescriptlang.org/):** A superset of JavaScript that adds static typing, improving code quality and maintainability.
*   **[Parcel](https://parceljs.org/):** A blazing fast, zero-configuration web application bundler.
*   **[Sass](https://sass-lang.com/):** A CSS preprocessor, adding features like variables and nesting to CSS.
*   **HTML5**
*   **CSS3**

## Project Structure

```
my_pong_try/
├── public/                  # Static assets (config, CSV, fonts)
│   ├── config.json
│   ├── player_names.csv
│   └── PressStart2P-Regular.ttf
├── server/                  # WebSocket server for multiplayer
│   ├── GameRoom.ts          # Game room management and logic
│   ├── server.ts            # WebSocket server implementation
│   └── types.ts             # Server-side type definitions
├── src/                     # Client source code
│   ├── config/              # Configuration and name generation logic
│   │   ├── Config.ts
│   │   ├── ConfigLoader.ts
│   │   └── nameGenerator.ts
│   ├── AI.ts                # AI logic
│   ├── Ball.ts              # Ball object and physics
│   ├── Board.ts             # Game board setup
│   ├── MultiplayerClient.ts # WebSocket client for online multiplayer
│   ├── Paddle.ts            # Paddle object and movement
│   ├── pong.ts              # Original single-player game logic
│   ├── pong-multiplayer.ts  # Enhanced multiplayer game logic
│   ├── styles.scss          # Main stylesheet
│   └── types.d.ts           # Custom type definitions
├── .dockerignore
├── .gitignore
├── docker-compose.yml       # Docker Compose configuration
├── Dockerfile               # Docker container configuration
├── index.html               # Main HTML entry point
├── LICENSE                  # MIT License
├── package.json             # Project metadata and dependencies
├── package-lock.json
├── README.md                # This file
└── tsconfig.json            # TypeScript compiler configuration
```

## 🎮 How to Play

When you start the game, you'll see a mode selection screen:

1. **Press `1`** for Single Player (vs AI)
2. **Press `2`** for Local Multiplayer (same keyboard)
3. **Press `3`** for Online Multiplayer (WebSocket-based)

### Controls

*   **Player 1 (Left Paddle):**
    *   Move Up: `A` key
    *   Move Down: `Z` key
*   **Player 2 (Right Paddle, local multiplayer only):**
    *   Move Up: `ArrowUp` key
    *   Move Down: `ArrowDown` key

### Game Rules

*   First player to reach 3 points wins (with a 2-point lead)
*   The ball speeds up after each paddle hit
*   When the game ends, the score is automatically downloaded as `pong_score.json`
*   Press `R` to restart the game at any time

### Online Multiplayer

*   Players are automatically matched when they join
*   The game starts automatically when both players are connected
*   If a player disconnects, the game pauses and waits for reconnection
*   Each player controls their paddle using the same controls as local multiplayer

### Configuration

You can modify game settings by editing the `public/config.json` file:

```json
{
  "player1": "",          // Leave empty for random name, or set a specific name
  "player2": "",          // Leave empty for random name, or set a specific name
  "player1IsAI": false,   // Set to true for Player 1 to be AI
  "player2IsAI": true,    // Set to true for Player 2 to be AI
  "aiUpdateInterval": 1000 // Interval in milliseconds for AI paddle updates
}
```
Changes to `config.json` will be applied when the game is reloaded or restarted.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## License

This project is open source and available under the [MIT License](LICENSE).

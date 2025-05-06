// Game constants
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 20;
const NEXT_PIECE_SIZE = 16;
const LOCK_DELAY = 500; // ms
const MAX_LOCK_DELAY_MOVES = 15;

// Tetromino shapes (SRS rotation system)
const SHAPES = [
    [], // 0 - no block
    [[1, 1, 1, 1]], // I
    [[1, 1], [1, 1]], // O
    [[0, 1, 0], [1, 1, 1]], // T
    [[1, 1, 0], [0, 1, 1]], // Z
    [[0, 1, 1], [1, 1, 0]], // S
    [[1, 0, 0], [1, 1, 1]], // L
    [[0, 0, 1], [1, 1, 1]]  // J
];

// Colors for tetrominos (Tetr.io inspired)
const COLORS = [
    '',
    '#00f0f0', // I - cyan
    '#f0f000', // O - yellow
    '#a000f0', // T - purple
    '#f00000', // Z - red
    '#00f000', // S - green
    '#f0a000', // L - orange
    '#0000f0'  // J - blue
];

// Garbage colors
const GARBAGE_COLOR = '#888888';

// Player class
class Player {
    constructor(id, opponentId) {
        this.id = id;
        this.opponentId = opponentId;
        this.grid = this.createGrid();
        this.currentPiece = null;
        this.nextPieces = [];
        this.holdPiece = null;
        this.canHold = true;
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.wins = 0;
        this.gameOver = false;
        this.garbageQueue = 0;
        this.dropCounter = 0;
        this.dropInterval = 1000;
        this.lastTime = 0;
        this.comboCount = 0;
        this.b2bCount = 0;
        this.lastClearWasB2B = false;
        this.clearingLines = [];
        this.clearAnimationProgress = 0;
        
        // Initialize canvases
        this.gridCanvas = document.getElementById(`grid-canvas-${id}`);
        this.blockCanvas = document.getElementById(`block-canvas-${id}`);
        this.uiCanvas = document.getElementById(`ui-canvas-${id}`);
        
        // Set canvas sizes
        this.gridCanvas.width = COLS * BLOCK_SIZE;
        this.gridCanvas.height = ROWS * BLOCK_SIZE;
        this.blockCanvas.width = COLS * BLOCK_SIZE;
        this.blockCanvas.height = ROWS * BLOCK_SIZE;
        this.uiCanvas.width = COLS * BLOCK_SIZE;
        this.uiCanvas.height = ROWS * BLOCK_SIZE;
        
        // Get contexts
        this.gridCtx = this.gridCanvas.getContext('2d');
        this.blockCtx = this.blockCanvas.getContext('2d');
        this.uiCtx = this.uiCanvas.getContext('2d');
        
        // Scale for crisp rendering
        this.gridCtx.scale(BLOCK_SIZE, BLOCK_SIZE);
        this.blockCtx.scale(BLOCK_SIZE, BLOCK_SIZE);
        this.uiCtx.scale(BLOCK_SIZE, BLOCK_SIZE);
        
        // Initialize game
        this.reset();
        this.drawGrid();
        this.updateDisplay();
    }
    
    createGrid() {
        return Array.from(Array(ROWS), () => Array(COLS).fill(0));
    }
    
    reset() {
        this.grid = this.createGrid();
        this.nextPieces = [];
        for (let i = 0; i < 5; i++) {
            this.nextPieces.push(this.randomPiece());
        }
        this.spawnPiece();
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.dropInterval = 1000;
        this.gameOver = false;
        this.garbageQueue = 0;
        this.canHold = true;
        this.comboCount = 0;
        this.b2bCount = 0;
        document.getElementById(`game-over-${this.id}`).style.display = 'none';
        this.updateGarbageDisplay();
    }
    
    randomPiece() {
        // 7-bag randomizer like Tetr.io
        if (this.nextPieces.length < 7) {
            const bag = [1, 2, 3, 4, 5, 6, 7];
            // Fisher-Yates shuffle
            for (let i = bag.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [bag[i], bag[j]] = [bag[j], bag[i]];
            }
            this.nextPieces = this.nextPieces.concat(bag);
        }
        return this.nextPieces.shift();
    }
    
    spawnPiece() {
        if (this.nextPieces.length === 0) {
            for (let i = 0; i < 5; i++) {
                this.nextPieces.push(this.randomPiece());
            }
        }
        
        const pieceId = this.nextPieces.shift();
        this.nextPieces.push(this.randomPiece());
        this.updateNextDisplay();
        
        this.currentPiece = {
            id: pieceId,
            shape: SHAPES[pieceId],
            x: Math.floor(COLS / 2) - Math.floor(SHAPES[pieceId][0].length / 2),
            y: 0
        };
        
        // Check if game over
        if (this.collision()) {
            this.gameOver = true;
            document.getElementById(`game-over-${this.id}`).style.display = 'flex';
            if (window.twoPlayerGame) {
                window.twoPlayerGame.handlePlayerGameOver(this.id);
            }
        }
    }
    
    hold() {
        if (!this.canHold) return;

        if (this.holdPiece === null) {
            this.holdPiece = this.currentPiece.id;
            this.spawnPiece();
        } else {
            const temp = this.currentPiece.id;
            this.currentPiece.id = this.holdPiece;
            this.currentPiece.shape = SHAPES[this.holdPiece];
            this.currentPiece.x = Math.floor(COLS / 2) - Math.floor(SHAPES[this.holdPiece][0].length / 2);
            this.currentPiece.y = 0;
            this.holdPiece = temp;
        }

        this.updateHoldDisplay();
        this.canHold = false;
    }
    
    movePiece(direction) {
        if (this.gameOver) return;
        
        switch (direction) {
            case 'left':
                this.currentPiece.x--;
                if (this.collision()) this.currentPiece.x++;
                break;
            case 'right':
                this.currentPiece.x++;
                if (this.collision()) this.currentPiece.x--;
                break;
            case 'down':
                this.currentPiece.y++;
                if (this.collision()) {
                    this.currentPiece.y--;
                    this.lockPiece();
                }
                break;
            case 'rotate':
                this.rotatePiece();
                break;
            case 'rotateCCW':
                this.rotatePieceCCW();
                break;
            case 'hardDrop':
                this.hardDrop();
                break;
        }
        
        this.draw();
    }
    
    rotatePiece() {
        const originalShape = this.currentPiece.shape;
        const rows = originalShape.length;
        const cols = originalShape[0].length;
        
        // Create new rotated shape (clockwise)
        const newShape = Array.from(Array(cols), () => Array(rows).fill(0));
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                newShape[x][rows - 1 - y] = originalShape[y][x];
            }
        }
        
        this.currentPiece.shape = newShape;
        
        // Wall kick if needed (simplified SRS)
        if (this.collision()) {
            const kicks = [
                {x: -1, y: 0}, {x: 1, y: 0},  // Left/right
                {x: 0, y: -1}, {x: 0, y: 1},   // Up/down
                {x: -1, y: -1}, {x: 1, y: -1}, // Diagonal
                {x: -1, y: 1}, {x: 1, y: 1}
            ];
            
            for (const kick of kicks) {
                this.currentPiece.x += kick.x;
                this.currentPiece.y += kick.y;
                if (!this.collision()) return true;
                this.currentPiece.x -= kick.x;
                this.currentPiece.y -= kick.y;
            }
            
            // If all kicks fail, revert rotation
            this.currentPiece.shape = originalShape;
            return false;
        }
        return true;
    }
    
    rotatePieceCCW() {
        const originalShape = this.currentPiece.shape;
        const rows = originalShape.length;
        const cols = originalShape[0].length;
        
        // Create new rotated shape (counter-clockwise)
        const newShape = Array.from(Array(cols), () => Array(rows).fill(0));
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                newShape[cols - 1 - x][y] = originalShape[y][x];
            }
        }
        
        this.currentPiece.shape = newShape;
        
        // Wall kick if needed
        if (this.collision()) {
            const kicks = [
                {x: 1, y: 0}, {x: -1, y: 0},  // Right/left
                {x: 0, y: 1}, {x: 0, y: -1},   // Down/up
                {x: 1, y: 1}, {x: -1, y: 1},   // Diagonal
                {x: 1, y: -1}, {x: -1, y: -1}
            ];
            
            for (const kick of kicks) {
                this.currentPiece.x += kick.x;
                this.currentPiece.y += kick.y;
                if (!this.collision()) return true;
                this.currentPiece.x -= kick.x;
                this.currentPiece.y -= kick.y;
            }
            
            // If all kicks fail, revert rotation
            this.currentPiece.shape = originalShape;
            return false;
        }
        return true;
    }
    
    hardDrop() {
        while (!this.collision(0, 1)) {
            this.currentPiece.y++;
        }
        this.lockPiece();
    }
    
    collision(offsetX = 0, offsetY = 0) {
        const { shape, x, y } = this.currentPiece;
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col] !== 0) {
                    const newX = x + col + offsetX;
                    const newY = y + row + offsetY;
                    
                    if (
                        newX < 0 || 
                        newX >= COLS || 
                        newY >= ROWS ||
                        (newY >= 0 && this.grid[newY][newX] !== 0)
                    ) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    lockPiece() {
        const { id, shape, x, y } = this.currentPiece;
        let linesCleared = 0;
        
        // Lock the piece
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col] !== 0) {
                    const gridY = y + row;
                    if (gridY >= 0) {
                        this.grid[gridY][x + col] = id;
                    }
                }
            }
        }
        
        // Check for completed lines
        linesCleared = this.clearLines();
        
        // Handle scoring and garbage
        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += this.calculateScore(linesCleared);
            
            // Check for level up
            const newLevel = Math.floor(this.lines / 10) + 1;
            if (newLevel > this.level) {
                this.level = newLevel;
                this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
            }
            
            // Send garbage to opponent
            if (this.opponentId && window.twoPlayerGame) {
                const garbageLines = this.calculateGarbage(linesCleared);
                window.twoPlayerGame.players[this.opponentId].receiveGarbage(garbageLines);
            }
            
            this.updateDisplay();
        } else {
            this.comboCount = 0;
            this.lastClearWasB2B = false;
        }
        
        // Spawn new piece
        this.spawnPiece();
        this.canHold = true;
    }
    
    clearLines() {
        if (this.clearingLines.length > 0) return 0; // Prevent clearing during animation
        
        let linesCleared = 0;
        this.clearingLines = [];
        
        outer: for (let y = ROWS - 1; y >= 0; y--) {
            for (let x = 0; x < COLS; x++) {
                if (this.grid[y][x] === 0) {
                    continue outer;
                }
            }
            
            this.clearingLines.push(y);
            linesCleared++;
            y++; // Check the same row again
        }
        
        if (linesCleared > 0) {
            this.clearAnimationProgress = 1.0;
        }
        
        return linesCleared;
    }
    
    calculateScore(linesCleared) {
        // Simplified scoring system similar to Tetr.io
        let score = 0;
        const isB2B = linesCleared >= 4 || (linesCleared > 0 && this.lastClearWasB2B);
        
        switch (linesCleared) {
            case 1:
                score = 100 * this.level;
                break;
            case 2:
                score = 300 * this.level;
                break;
            case 3:
                score = 500 * this.level;
                break;
            case 4: // Tetris
                score = 800 * this.level;
                break;
        }
        
        // Back-to-back bonus
        if (isB2B) {
            score = Math.floor(score * 1.5);
            this.b2bCount++;
        } else {
            this.b2bCount = 0;
        }
        
        // Combo bonus
        if (this.comboCount > 0) {
            score += 50 * this.comboCount * this.level;
        }
        
        this.lastClearWasB2B = linesCleared >= 4;
        this.comboCount++;
        
        return score;
    }
    
    calculateGarbage(linesCleared) {
        // Simplified garbage calculation
        let garbage = 0;
        
        switch (linesCleared) {
            case 1: garbage = 0; break; // No garbage for single
            case 2: garbage = 1; break;
            case 3: garbage = 2; break;
            case 4: garbage = 4; break; // Tetris sends more
        }
        
        // Back-to-back bonus
        if (this.lastClearWasB2B && linesCleared >= 4) {
            garbage += 1;
        }
        
        // Combo bonus
        if (this.comboCount > 0) {
            garbage += Math.floor(this.comboCount / 2);
        }
        
        return garbage;
    }
    
    receiveGarbage(lines) {
        if (lines <= 0) return;
        
        this.garbageQueue += lines;
        this.updateGarbageDisplay();
        
        // Show attack effect
        const effect = document.getElementById(`attack-effect-${this.id}`);
        effect.style.opacity = '0.5';
        setTimeout(() => {
            effect.style.opacity = '0';
        }, 300);
    }
    
    processGarbage() {
        if (this.garbageQueue <= 0) return;
        
        const linesToAdd = Math.min(this.garbageQueue, 5);
        this.garbageQueue -= linesToAdd;
        
        // Shift grid up and add garbage with hole
        for (let i = 0; i < linesToAdd; i++) {
            this.grid.shift();
            
            // Create garbage line with one hole
            const garbageLine = Array(COLS).fill(8); // 8 for garbage
            const holePos = Math.floor(Math.random() * COLS);
            garbageLine[holePos] = 0;
            
            this.grid.push(garbageLine);
        }
        
        this.updateGarbageDisplay();
    }
    
    update(time = 0) {
        if (this.gameOver) return;
        
        const deltaTime = time - this.lastTime;
        this.lastTime = time;
        
        this.dropCounter += deltaTime;
        if (this.dropCounter > this.dropInterval) {
            this.movePiece('down');
            this.dropCounter = 0;
        }
        
        this.processGarbage();
        
        // Handle line clear animation
        if (this.clearAnimationProgress > 0) {
            this.clearAnimationProgress -= 0.05;
            if (this.clearAnimationProgress <= 0) {
                // Animation complete - actually clear the lines
                this.clearingLines.forEach(y => {
                    this.grid.splice(y, 1);
                    this.grid.unshift(Array(COLS).fill(0));
                });
                this.clearingLines = [];
            }
        }
        
        this.draw();
        requestAnimationFrame(this.update.bind(this));
    }
    
    draw() {
        // Clear block canvas
        this.blockCtx.clearRect(0, 0, COLS, ROWS);
        
        // Draw current piece
        this.drawPiece(this.currentPiece);
        
        // Draw ghost piece
        if (!this.gameOver) {
            const ghostY = this.getGhostY();
            this.blockCtx.globalAlpha = 0.3;
            this.drawPiece({...this.currentPiece, y: ghostY});
            this.blockCtx.globalAlpha = 1.0;
        }
        
        // Draw grid
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                if (this.grid[y][x] !== 0) {
                    if (this.grid[y][x] === 8) {
                        // Draw garbage block
                        this.blockCtx.fillStyle = GARBAGE_COLOR;
                    } else {
                        // Draw normal block
                        this.blockCtx.fillStyle = COLORS[this.grid[y][x]];
                    }
                    this.blockCtx.fillRect(x, y, 1, 1);
                    
                    // Draw border
                    this.blockCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                    this.blockCtx.lineWidth = 0.05;
                    this.blockCtx.strokeRect(x, y, 1, 1);
                }
            }
        }
    }
    
    drawGrid() {
        this.gridCtx.clearRect(0, 0, COLS, ROWS);
        
        // Draw grid lines
        this.gridCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.gridCtx.lineWidth = 0.05;
        
        for (let x = 0; x <= COLS; x++) {
            this.gridCtx.beginPath();
            this.gridCtx.moveTo(x, 0);
            this.gridCtx.lineTo(x, ROWS);
            this.gridCtx.stroke();
        }
        
        for (let y = 0; y <= ROWS; y++) {
            this.gridCtx.beginPath();
            this.gridCtx.moveTo(0, y);
            this.gridCtx.lineTo(COLS, y);
            this.gridCtx.stroke();
        }
    }
    
    drawPiece(piece) {
        if (!piece) return;
        
        this.blockCtx.fillStyle = COLORS[piece.id];
        
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x] !== 0) {
                    const drawX = piece.x + x;
                    const drawY = piece.y + y;
                    
                    if (drawY >= 0) {
                        this.blockCtx.fillRect(drawX, drawY, 1, 1);
                        
                        // Draw border
                        this.blockCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                        this.blockCtx.lineWidth = 0.05;
                        this.blockCtx.strokeRect(drawX, drawY, 1, 1);
                    }
                }
            }
        }
    }
    
    drawGhostPiece() {
        // Removed as ghost piece is drawn in draw() now
    }
    
    updateDisplay() {
        document.getElementById(`lines-display-${this.id}`).textContent = this.lines;
        document.getElementById(`wins-display-${this.id}`).textContent = this.wins;
    }
    
    updateNextDisplay() {
        for (let i = 0; i < 3; i++) {
            const container = document.getElementById(`next-piece-${this.id}-${i+1}`);
            container.innerHTML = '';
            
            if (i < this.nextPieces.length) {
                const pieceId = this.nextPieces[i];
                const shape = SHAPES[pieceId];
                const canvas = document.createElement('canvas');
                canvas.width = shape[0].length * NEXT_PIECE_SIZE;
                canvas.height = shape.length * NEXT_PIECE_SIZE;
                const ctx = canvas.getContext('2d');
                
                ctx.fillStyle = COLORS[pieceId];
                
                for (let y = 0; y < shape.length; y++) {
                    for (let x = 0; x < shape[y].length; x++) {
                        if (shape[y][x] !== 0) {
                            ctx.fillRect(
                                x * NEXT_PIECE_SIZE, 
                                y * NEXT_PIECE_SIZE, 
                                NEXT_PIECE_SIZE, 
                                NEXT_PIECE_SIZE
                            );
                        }
                    }
                }
                
                container.appendChild(canvas);
            }
        }
    }
    
    updateHoldDisplay() {
        const container = document.getElementById(`hold-container-${this.id}`);
        container.innerHTML = '';
        
        if (this.holdPiece) {
            const pieceId = this.holdPiece;
            const shape = SHAPES[pieceId];
            const canvas = document.createElement('canvas');
            canvas.width = shape[0].length * NEXT_PIECE_SIZE;
            canvas.height = shape.length * NEXT_PIECE_SIZE;
            const ctx = canvas.getContext('2d');
            
            ctx.fillStyle = COLORS[pieceId];
            
            for (let y = 0; y < shape.length; y++) {
                for (let x = 0; x < shape[y].length; x++) {
                    if (shape[y][x] !== 0) {
                        ctx.fillRect(
                            x * NEXT_PIECE_SIZE, 
                            y * NEXT_PIECE_SIZE, 
                            NEXT_PIECE_SIZE, 
                            NEXT_PIECE_SIZE
                        );
                    }
                }
            }
            
            container.appendChild(canvas);
        }
    }
    
    updateGarbageDisplay() {
        const percentage = Math.min(100, this.garbageQueue * 10);
        document.getElementById(`garbage-meter-${this.id}`).style.width = `${percentage}%`;
    }
}

class TwoPlayerGame {
    constructor() {
        this.players = {
            1: new Player(1, 2),
            2: new Player(2, 1)
        };
        this.matchWinner = null;
        
        this.setupControls();
        this.startGame();
    }
    
    setupControls() {
        document.addEventListener('keydown', event => {
            if (this.matchWinner) return;
            
            switch (event.key) {
                // Player 1 controls (WASD + Q/E for rotation, Space for hold)
                case 'a':
                    this.players[1].movePiece('left');
                    break;
                case 'd':
                    this.players[1].movePiece('right');
                    break;
                case 's':
                    this.players[1].movePiece('down');
                    break;
                case 'w':
                    this.players[1].movePiece('rotate');
                    break;
                case 'q':
                    this.players[1].movePiece('rotateCCW');
                    break;
                case ' ':
                    this.players[1].hold();
                    break;
                case 'f':
                    this.players[1].movePiece('hardDrop');
                    break;
                
                // Player 2 controls (Arrow keys + / and . for rotation, Shift for hold)
                case 'ArrowLeft':
                    this.players[2].movePiece('left');
                    break;
                case 'ArrowRight':
                    this.players[2].movePiece('right');
                    break;
                case 'ArrowDown':
                    this.players[2].movePiece('down');
                    break;
                case 'ArrowUp':
                    this.players[2].movePiece('rotate');
                    break;
                case '/':
                    this.players[2].movePiece('rotateCCW');
                    break;
                case 'Shift':
                    this.players[2].hold();
                    break;
                case 'Enter':
                    this.players[2].movePiece('hardDrop');
                    break;
            }
            
            this.players[1].draw();
            this.players[2].draw();
        });
    }
    
    startGame() {
        this.matchWinner = null;
        this.players[1].reset();
        this.players[2].reset();
        this.players[1].update();
        this.players[2].update();
    }
    
    handlePlayerGameOver(playerId) {
        if (this.matchWinner) return;
        
        const winnerId = playerId === 1 ? 2 : 1;
        this.players[winnerId].wins++;
        this.players[winnerId].updateDisplay();
        
        if (this.players[winnerId].wins >= 3) {
            this.matchWinner = winnerId;
            alert(`Player ${winnerId} wins the match!`);
        } else {
            // Reset for next round
            setTimeout(() => {
                this.players[1].reset();
                this.players[2].reset();
            }, 2000);
        }
    }
}

const urlParams = new URLSearchParams(window.location.search);
const onlineMode = urlParams.get('online') === '1';

let socket = null;

if (onlineMode) {
    socket = io();

    socket.on('connect', () => {
        console.log('Connected to server with id:', socket.id);
    });

    socket.on('gameStart', (data) => {
        console.log('Game started as player:', data.playerId);
        window.playerId = data.playerId;
        startOnlineGame();
    });

    socket.on('waitingForOpponent', () => {
        alert('Waiting for an opponent to join...');
    });

    socket.on('opponentInput', (data) => {
        if (window.twoPlayerGame) {
            window.twoPlayerGame.handleOpponentInput(data);
        }
    });

    socket.on('opponentDisconnected', () => {
        alert('Your opponent has disconnected. Returning to multiplayer menu.');
        window.location.href = 'multiplayer.html';
    });
}

class OnlineTwoPlayerGame extends TwoPlayerGame {
    constructor() {
        super();
        this.setupOnlineControls();
    }

    setupOnlineControls() {
        document.addEventListener('keydown', event => {
            if (this.matchWinner) return;

            let inputData = null;

            switch (event.key) {
                case 'a':
                    inputData = { action: 'move', direction: 'left' };
                    break;
                case 'd':
                    inputData = { action: 'move', direction: 'right' };
                    break;
                case 's':
                    inputData = { action: 'move', direction: 'down' };
                    break;
                case 'w':
                    inputData = { action: 'move', direction: 'rotate' };
                    break;
                case 'q':
                    inputData = { action: 'move', direction: 'rotateCCW' };
                    break;
                case ' ':
                    inputData = { action: 'hold' };
                    break;
                case 'f':
                    inputData = { action: 'move', direction: 'hardDrop' };
                    break;
                default:
                    return; // Ignore other keys
            }

            if (inputData && socket) {
                socket.emit('playerInput', inputData);
            }
        });
    }

    handleOpponentInput(data) {
        // Apply opponent input to the other player
        const opponentId = this.playerId === 1 ? 2 : 1;
        const opponent = this.players[opponentId];
        if (!opponent) return;

        switch (data.action) {
            case 'move':
                opponent.movePiece(data.direction);
                break;
            case 'hold':
                opponent.hold();
                break;
        }
    }
}

function startOnlineGame() {
    window.twoPlayerGame = new OnlineTwoPlayerGame();
    window.twoPlayerGame.playerId = window.playerId;
    window.twoPlayerGame.startGame();
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (!onlineMode) {
        window.twoPlayerGame = new TwoPlayerGame();
    }
    
    // Back button navigation
    const backButton = document.getElementById('back-button');
    if (backButton) {
        backButton.addEventListener('click', () => {
            alert('Returning to main menu...');
            window.location.href = 'multiplayer.html';
        });
    }
});

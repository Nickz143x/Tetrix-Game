// Game Constants
const BLOCK_SIZE = 30;
const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const NEXT_PIECES_TO_SHOW = 3;
const LOCK_DELAY = 500; // ms
const MAX_LOCK_DELAY_MOVES = 15;

// Tetris Pieces
const SHAPES = [
    // I-piece
    [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
    // J-piece
    [[1,0,0,0], [1,1,1,0], [0,0,0,0], [0,0,0,0]],
    // L-piece
    [[0,0,1,0], [1,1,1,0], [0,0,0,0], [0,0,0,0]],
    // O-piece
    [[0,1,1,0], [0,1,1,0], [0,0,0,0], [0,0,0,0]],
    // S-piece
    [[0,1,1,0], [1,1,0,0], [0,0,0,0], [0,0,0,0]],
    // T-piece
    [[0,1,0,0], [1,1,1,0], [0,0,0,0], [0,0,0,0]],
    // Z-piece
    [[1,1,0,0], [0,1,1,0], [0,0,0,0], [0,0,0,0]]
];

// Piece rotations (0°, 90°, 180°, 270°)
const ROTATIONS = [
    // I-piece rotations
    [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
    [[0,0,1,0], [0,0,1,0], [0,0,1,0], [0,0,1,0]],
    [[0,0,0,0], [0,0,0,0], [1,1,1,1], [0,0,0,0]],
    [[0,1,0,0], [0,1,0,0], [0,1,0,0], [0,1,0,0]],
    
    // J-piece rotations
    [[1,0,0,0], [1,1,1,0], [0,0,0,0], [0,0,0,0]],
    [[0,1,1,0], [0,1,0,0], [0,1,0,0], [0,0,0,0]],
    [[0,0,0,0], [1,1,1,0], [0,0,1,0], [0,0,0,0]],
    [[0,1,0,0], [0,1,0,0], [1,1,0,0], [0,0,0,0]],
    
    // L-piece rotations
    [[0,0,1,0], [1,1,1,0], [0,0,0,0], [0,0,0,0]],
    [[0,1,0,0], [0,1,0,0], [0,1,1,0], [0,0,0,0]],
    [[0,0,0,0], [1,1,1,0], [1,0,0,0], [0,0,0,0]],
    [[1,1,0,0], [0,1,0,0], [0,1,0,0], [0,0,0,0]],
    
    // O-piece rotations (all same)
    [[0,1,1,0], [0,1,1,0], [0,0,0,0], [0,0,0,0]],
    [[0,1,1,0], [0,1,1,0], [0,0,0,0], [0,0,0,0]],
    [[0,1,1,0], [0,1,1,0], [0,0,0,0], [0,0,0,0]],
    [[0,1,1,0], [0,1,1,0], [0,0,0,0], [0,0,0,0]],
    
    // S-piece rotations
    [[0,1,1,0], [1,1,0,0], [0,0,0,0], [0,0,0,0]],
    [[0,1,0,0], [0,1,1,0], [0,0,1,0], [0,0,0,0]],
    [[0,0,0,0], [0,1,1,0], [1,1,0,0], [0,0,0,0]],
    [[1,0,0,0], [1,1,0,0], [0,1,0,0], [0,0,0,0]],
    
    // T-piece rotations
    [[0,1,0,0], [1,1,1,0], [0,0,0,0], [0,0,0,0]],
    [[0,1,0,0], [0,1,1,0], [0,1,0,0], [0,0,0,0]],
    [[0,0,0,0], [1,1,1,0], [0,1,0,0], [0,0,0,0]],
    [[0,1,0,0], [1,1,0,0], [0,1,0,0], [0,0,0,0]],
    
    // Z-piece rotations
    [[1,1,0,0], [0,1,1,0], [0,0,0,0], [0,0,0,0]],
    [[0,0,1,0], [0,1,1,0], [0,1,0,0], [0,0,0,0]],
    [[0,0,0,0], [1,1,0,0], [0,1,1,0], [0,0,0,0]],
    [[0,1,0,0], [1,1,0,0], [1,0,0,0], [0,0,0,0]]
];

// Piece colors
const PIECE_COLORS = [
    '#00f0f0', // I - Cyan
    '#0000ff', // J - Blue
    '#ff9600', // L - Orange
    '#ffff32', // O - Yellow
    '#32ff32', // S - Green
    '#b400b4', // T - Purple
    '#ff3232'  // Z - Red
];

// Game state
const game = {
    grid: Array.from({length: GRID_HEIGHT}, () => Array(GRID_WIDTH).fill(0)),
    currentPiece: Array.from({length: 4}, () => Array(4).fill(0)),
    nextPieces: [],
    pieceX: 0,
    pieceY: 0,
    currentType: 0,
    heldType: -1,
    rotation: 0,
    score: 0,
    level: 1,
    linesCleared: 0,
    canHold: true,
    gameOver: false,
    isLocking: false,
    lockStartTime: 0,
    lockMoveCount: 0,
    fallSpeed: 1000,
    fallInterval: null
};

// Initialize game
function initGame() {
    // Clear the grid
    game.grid = Array.from({length: GRID_HEIGHT}, () => Array(GRID_WIDTH).fill(0));
    
    game.score = 0;
    game.level = 1;
    game.linesCleared = 0;
    game.gameOver = false;
    game.heldType = -1;
    game.fallSpeed = 1000;
    
    initializeNextPieces();
    newPiece();

    if (game.fallInterval) clearInterval(game.fallInterval);
    game.fallInterval = setInterval(gameLoop, game.fallSpeed);
    drawGrid();
    updateUI();
}

function updateUI() {
    document.getElementById('score-display').textContent = game.score;
    document.getElementById('level-display').textContent = game.level;
    document.getElementById('lines-display').textContent = game.linesCleared;
}

function initializeNextPieces() {
    game.nextPieces = [];
    let bag = [0,1,2,3,4,5,6];
    
    // Fisher-Yates shuffle
    for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    
    game.nextPieces = bag;
    
    // Shuffle second bag
    for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    
    game.nextPieces = game.nextPieces.concat(bag);
}

function newPiece() {
    if (game.nextPieces.length === 0) {
        initializeNextPieces();
    }
    
    game.currentType = game.nextPieces.shift();
    
    // Refill next pieces if running low
    if (game.nextPieces.length < 7) {
        let bag = [0,1,2,3,4,5,6];
        for (let i = bag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [bag[i], bag[j]] = [bag[j], bag[i]];
        }
        game.nextPieces = game.nextPieces.concat(bag);
    }
    
    game.rotation = 0;
    updateCurrentPiece();
    
    game.pieceX = Math.floor(GRID_WIDTH / 2) - 2;
    game.pieceY = 0;
    game.canHold = true;
    game.isLocking = false;
    game.lockMoveCount = 0;
    
    if (checkCollision()) {
        gameOver();
    }
    
    drawNextPieces();
}

function updateCurrentPiece() {
    const rotationIndex = game.currentType * 4 + game.rotation;
    for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
            game.currentPiece[y][x] = ROTATIONS[rotationIndex][y][x];
        }
    }
}

function checkCollision() {
    for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
            if (game.currentPiece[y][x]) {
                const newX = game.pieceX + x;
                const newY = game.pieceY + y;
                
                if (newX < 0 || newX >= GRID_WIDTH || newY >= GRID_HEIGHT) {
                    return true;
                }
                
                if (newY >= 0 && game.grid[newY][newX]) {
                    return true;
                }
            }
        }
    }
    return false;
}

function rotatePiece(clockwise = true) {
    const oldRotation = game.rotation;
    game.rotation = (game.rotation + (clockwise ? 1 : -1) + 4) % 4;
    updateCurrentPiece();
    
    if (checkCollision()) {
        // Try wall kicks
        const kicks = [1, -1, 2, -2];
        for (const kick of kicks) {
            game.pieceX += kick;
            if (!checkCollision()) {
                if (game.isLocking) game.lockMoveCount++;
                return true;
            }
            game.pieceX -= kick;
        }
        
        // Revert if rotation fails
        game.rotation = oldRotation;
        updateCurrentPiece();
        return false;
    } else {
        if (game.isLocking) game.lockMoveCount++;
        return true;
    }
}

function holdPiece() {
    if (!game.canHold) return;
    
    if (game.heldType === -1) {
        game.heldType = game.currentType;
        newPiece();
    } else {
        [game.currentType, game.heldType] = [game.heldType, game.currentType];
        game.rotation = 0;
        updateCurrentPiece();
        
        game.pieceX = Math.floor(GRID_WIDTH / 2) - 2;
        game.pieceY = 0;
    }
    
    game.canHold = false;
    game.isLocking = false;
    game.lockMoveCount = 0;
    
    drawHoldPiece();
}

function lockPiece() {
    // Add piece to grid
    for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
            if (game.currentPiece[y][x]) {
                const gridY = game.pieceY + y;
                const gridX = game.pieceX + x;
                if (gridY >= 0) {
                    game.grid[gridY][gridX] = game.currentType + 1;
                }
            }
        }
    }
    
    // Clear lines
    let linesClearedThisTime = 0;
    for (let y = GRID_HEIGHT - 1; y >= 0; y--) {
        let lineComplete = true;
        for (let x = 0; x < GRID_WIDTH; x++) {
            if (!game.grid[y][x]) {
                lineComplete = false;
                break;
            }
        }
        
        if (lineComplete) {
            // Move all lines above down
            for (let yy = y; yy > 0; yy--) {
                for (let x = 0; x < GRID_WIDTH; x++) {
                    game.grid[yy][x] = game.grid[yy-1][x];
                }
            }
            
            // Clear top line
            for (let x = 0; x < GRID_WIDTH; x++) {
                game.grid[0][x] = 0;
            }
            
            linesClearedThisTime++;
            y++; // Check this row again
        }
    }
    
    // Update score and level
    if (linesClearedThisTime > 0) {
        game.linesCleared += linesClearedThisTime;
        
        const scoreMap = {
            1: 100,
            2: 300,
            3: 500,
            4: 800
        };
        
        game.score += (scoreMap[linesClearedThisTime] || 0) * game.level;
        
        // Update level based on lines cleared
        const newLevel = Math.min(Math.floor(game.linesCleared / 10) + 1, 25);
        if (newLevel !== game.level) {
            game.level = newLevel;
            // Update fall speed
            game.fallSpeed = Math.max(50, 1000 - (game.level * 50));
            clearInterval(game.fallInterval);
            game.fallInterval = setInterval(gameLoop, game.fallSpeed);
        }
    }
    
    updateUI();
    newPiece();
}

function gameLoop() {
    if (game.gameOver) {
        clearInterval(game.fallInterval);
        return;
    }
    
    const now = Date.now();
    
    if (game.isLocking) {
        if (now - game.lockStartTime >= LOCK_DELAY || game.lockMoveCount >= MAX_LOCK_DELAY_MOVES) {
            lockPiece();
            game.isLocking = false;
        }
    } else {
        game.pieceY++;
        if (checkCollision()) {
            game.pieceY--;
            if (!game.isLocking) {
                game.isLocking = true;
                game.lockStartTime = now;
                game.lockMoveCount = 0;
            }
        }
    }
    
    drawGame();
}

function drawGrid() {
    const gridCtx = document.getElementById('grid-canvas').getContext('2d');
    gridCtx.fillStyle = '#0f0e15';
    gridCtx.fillRect(0, 0, GRID_WIDTH * BLOCK_SIZE, GRID_HEIGHT * BLOCK_SIZE);
    
    // Draw grid lines
    gridCtx.strokeStyle = '#2d2b42';
    gridCtx.lineWidth = 1;
    
    for (let x = 0; x <= GRID_WIDTH; x++) {
        gridCtx.beginPath();
        gridCtx.moveTo(x * BLOCK_SIZE, 0);
        gridCtx.lineTo(x * BLOCK_SIZE, GRID_HEIGHT * BLOCK_SIZE);
        gridCtx.stroke();
    }
    
    for (let y = 0; y <= GRID_HEIGHT; y++) {
        gridCtx.beginPath();
        gridCtx.moveTo(0, y * BLOCK_SIZE);
        gridCtx.lineTo(GRID_WIDTH * BLOCK_SIZE, y * BLOCK_SIZE);
        gridCtx.stroke();
    }
}

function drawBlocks() {
    const blockCtx = document.getElementById('block-canvas').getContext('2d');
    blockCtx.clearRect(0, 0, GRID_WIDTH * BLOCK_SIZE, GRID_HEIGHT * BLOCK_SIZE);
    
    // Draw placed blocks
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            if (game.grid[y][x]) {
                drawBlock(blockCtx, x * BLOCK_SIZE, y * BLOCK_SIZE, PIECE_COLORS[game.grid[y][x] - 1]);
            }
        }
    }
    
    // Draw ghost piece
    drawGhostPiece();
    
    // Draw current piece
    for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
            if (game.currentPiece[y][x]) {
                drawBlock(blockCtx, 
                    (game.pieceX + x) * BLOCK_SIZE, 
                    (game.pieceY + y) * BLOCK_SIZE, 
                    PIECE_COLORS[game.currentType]);
            }
        }
    }
}

function drawBlock(ctx, x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
    
    // Draw highlights
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(1, Math.floor(BLOCK_SIZE / 30));
    
    // Top and left highlights
    ctx.beginPath();
    ctx.moveTo(x, y + BLOCK_SIZE - 1);
    ctx.lineTo(x, y);
    ctx.lineTo(x + BLOCK_SIZE - 1, y);
    ctx.stroke();
    
    // Bottom and right shadows
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(x + 1, y + BLOCK_SIZE - 1);
    ctx.lineTo(x + BLOCK_SIZE - 1, y + BLOCK_SIZE - 1);
    ctx.lineTo(x + BLOCK_SIZE - 1, y + 1);
    ctx.stroke();
}

function drawGhostPiece() {
    const blockCtx = document.getElementById('block-canvas').getContext('2d');
    let ghostY = game.pieceY;
    while (ghostY < GRID_HEIGHT) {
        ghostY++;
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                if (game.currentPiece[y][x]) {
                    const gridY = ghostY + y;
                    const gridX = game.pieceX + x;
                    if (gridY >= GRID_HEIGHT || (gridY >= 0 && game.grid[gridY][gridX])) {
                        ghostY--;
                        // Draw ghost piece
                        for (let py = 0; py < 4; py++) {
                            for (let px = 0; px < 4; px++) {
                                if (game.currentPiece[py][px]) {
                                    drawGhostBlock(
                                        (game.pieceX + px) * BLOCK_SIZE,
                                        (ghostY + py) * BLOCK_SIZE,
                                        PIECE_COLORS[game.currentType]
                                    );
                                }
                            }
                        }
                        return;
                    }
                }
            }
        }
    }
}

function drawGhostBlock(x, y, color) {
    const blockCtx = document.getElementById('block-canvas').getContext('2d');
    const rgb = hexToRgb(color);
    blockCtx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`;
    blockCtx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : {r: 0, g: 0, b: 0};
}

function drawHoldPiece() {
    const holdCtx = document.getElementById('hold-canvas').getContext('2d');
    holdCtx.clearRect(0, 0, 4 * BLOCK_SIZE, 4 * BLOCK_SIZE);
    
    if (game.heldType === -1) return;
    
    const piece = ROTATIONS[game.heldType * 4];
    const offsetX = (4 * BLOCK_SIZE - 4 * BLOCK_SIZE) / 2;
    const offsetY = (game.heldType === 0 || game.heldType === 3) ? 
                  (4 * BLOCK_SIZE - 2 * BLOCK_SIZE) / 2 : 
                  (4 * BLOCK_SIZE - 3 * BLOCK_SIZE) / 2;
    
    for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
            if (piece[y][x]) {
                drawBlock(holdCtx, 
                    offsetX + x * BLOCK_SIZE, 
                    offsetY + y * BLOCK_SIZE, 
                    PIECE_COLORS[game.heldType]);
            }
        }
    }
}

function drawNextPieces() {
    const nextCtx = document.getElementById('next-canvas').getContext('2d');
    nextCtx.clearRect(0, 0, 4 * BLOCK_SIZE, NEXT_PIECES_TO_SHOW * 4 * BLOCK_SIZE);
    
    // Show next pieces
    for (let i = 0; i < Math.min(NEXT_PIECES_TO_SHOW, game.nextPieces.length); i++) {
        const type = game.nextPieces[i];
        const piece = ROTATIONS[type * 4];
        const baseY = i * 4 * BLOCK_SIZE;
        const offsetX = (4 * BLOCK_SIZE - 4 * BLOCK_SIZE) / 2;
        const offsetY = baseY + (
            type === 0 || type === 3 ? (4 * BLOCK_SIZE - 2 * BLOCK_SIZE) / 2 : 
            (4 * BLOCK_SIZE - 3 * BLOCK_SIZE) / 2
        );
        
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                if (piece[y][x]) {
                    drawBlock(nextCtx, 
                        offsetX + x * BLOCK_SIZE, 
                        offsetY + y * BLOCK_SIZE, 
                        PIECE_COLORS[type]);
                }
            }
        }
    }
}

function drawUI() {
    const uiCtx = document.getElementById('ui-canvas').getContext('2d');
    uiCtx.clearRect(0, 0, GRID_WIDTH * BLOCK_SIZE, GRID_HEIGHT * BLOCK_SIZE);
    
    if (game.gameOver) {
        drawGameOver();
    }
}

function drawGameOver() {
    const uiCtx = document.getElementById('ui-canvas').getContext('2d');
    uiCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    uiCtx.fillRect(0, 0, GRID_WIDTH * BLOCK_SIZE, GRID_HEIGHT * BLOCK_SIZE);
    
    uiCtx.fillStyle = '#ff0000';
    uiCtx.font = '36px Inter';
    uiCtx.textAlign = 'center';
    uiCtx.fillText('GAME OVER', GRID_WIDTH * BLOCK_SIZE / 2, GRID_HEIGHT * BLOCK_SIZE / 2 - 20);
    
    uiCtx.fillStyle = '#ffffff';
    uiCtx.font = '24px Inter';
    uiCtx.fillText(`Score: ${game.score}`, GRID_WIDTH * BLOCK_SIZE / 2, GRID_HEIGHT * BLOCK_SIZE / 2 + 20);
}

function drawGame() {
    drawGrid();
    drawBlocks();
    drawUI();
}

function gameOver() {
    game.gameOver = true;
    clearInterval(game.fallInterval);
    drawGameOver();
    
    // Show game over UI
    document.getElementById('final-score').textContent = game.score;
    document.getElementById('final-level').textContent = game.level;
    document.getElementById('final-lines').textContent = game.linesCleared;
    document.getElementById('game-over').style.display = 'flex';

    // Save score to localStorage leaderboard
    try {
        const currentUser = JSON.parse(localStorage.getItem('tetrixCurrentUser')) || {};
        const playerName = currentUser.username || (currentUser.guest ? 'Guest' : 'Player');
        const scores = JSON.parse(localStorage.getItem('tetrixClassicScores') || '[]');

        // Add new score entry
        scores.push({
            name: playerName,
            score: game.score,
            level: game.level,
            lines: game.linesCleared,
            timestamp: Date.now()
        });

        // Save updated scores
        localStorage.setItem('tetrixClassicScores', JSON.stringify(scores));
    } catch (e) {
        console.error('Error saving score to leaderboard:', e);
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Set canvas sizes
    document.getElementById('grid-canvas').width = GRID_WIDTH * BLOCK_SIZE;
    document.getElementById('grid-canvas').height = GRID_HEIGHT * BLOCK_SIZE;
    document.getElementById('block-canvas').width = GRID_WIDTH * BLOCK_SIZE;
    document.getElementById('block-canvas').height = GRID_HEIGHT * BLOCK_SIZE;
    document.getElementById('ui-canvas').width = GRID_WIDTH * BLOCK_SIZE;
    document.getElementById('ui-canvas').height = GRID_HEIGHT * BLOCK_SIZE;
    document.getElementById('hold-canvas').width = 4 * BLOCK_SIZE;
    document.getElementById('hold-canvas').height = 4 * BLOCK_SIZE;
    document.getElementById('next-canvas').width = 4 * BLOCK_SIZE;
    document.getElementById('next-canvas').height = NEXT_PIECES_TO_SHOW * 4 * BLOCK_SIZE;

    // Event listeners for buttons
    document.getElementById('pause-button').addEventListener('click', () => {
        if (game.gameOver) return;

        if (isPaused) {
            // Resume game
            game.fallInterval = setInterval(gameLoop, game.fallSpeed);
            isPaused = false;
            document.getElementById('pause-button').textContent = 'Pause';
        } else {
            // Pause game
            clearInterval(game.fallInterval);
            game.fallInterval = null;
            isPaused = true;
            document.getElementById('pause-button').textContent = 'Resume';
        }
    });

    document.getElementById('restart-button').addEventListener('click', () => {
        document.getElementById('game-over').style.display = 'none';
        initGame();
    });

    document.getElementById('back-button').addEventListener('click', () => {
        // Implement navigation back to main menu
        console.log("Back to main menu");
    });

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        // Prevent default for game control keys to avoid page scrolling etc.
        const controlKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'z', 'Z', 'c', 'C', 'p', 'P', 'Escape', 'Enter'];
        if (controlKeys.includes(e.key)) {
            e.preventDefault();
        }

        if (game.gameOver) {
            if (e.key === 'Enter') {
                document.getElementById('game-over').style.display = 'none';
                initGame();
            }
            return;
        }

        if (isPaused) {
            if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
                togglePause();
            }
            return;
        }

        let moved = false;

        switch(e.key) {
            case 'ArrowLeft':
                game.pieceX--;
                if (checkCollision()) {
                    game.pieceX++;
                } else {
                    moved = true;
                    if (game.isLocking) game.lockMoveCount++;
                }
                break;
                
            case 'ArrowRight':
                game.pieceX++;
                if (checkCollision()) {
                    game.pieceX--;
                } else {
                    moved = true;
                    if (game.isLocking) game.lockMoveCount++;
                }
                break;
                
            case 'ArrowDown':
                game.pieceY++;
                if (checkCollision()) {
                    game.pieceY--;
                    if (!game.isLocking) {
                        game.isLocking = true;
                        game.lockStartTime = Date.now();
                        game.lockMoveCount = 0;
                    }
                } else {
                    moved = true;
                    if (game.isLocking) game.lockMoveCount++;
                }
                break;
                
            case 'ArrowUp':
                if (rotatePiece()) {
                    moved = true;
                }
                break;
                
            case 'z':
            case 'Z':
                if (rotatePiece(false)) {
                    moved = true;
                }
                break;
                
            case 'c':
            case 'C':
                if (game.canHold) {
                    holdPiece();
                    moved = true;
                }
                break;
                
            case ' ':
                // Hard drop
                let dropDistance = 0;
                while (!checkCollision()) {
                    game.pieceY++;
                    dropDistance++;
                }
                game.pieceY--;
                if (dropDistance > 0) {
                    lockPiece();
                    moved = true;
                    // Bonus points for hard drop
                    game.score += dropDistance * 2;
                    updateUI();
                }
                break;
                
            case 'p':
            case 'P':
            case 'Escape':
                togglePause();
                return;
        }

        if (moved) {
            drawGame();
        }
    });

    // Start the game
    initGame();
});

let isPaused = false;

function togglePause() {
    if (game.gameOver) return;

    if (isPaused) {
        // Resume game
        game.fallInterval = setInterval(gameLoop, game.fallSpeed);
        isPaused = false;
        document.getElementById('pause-button').textContent = 'Pause';
    } else {
        // Pause game
        clearInterval(game.fallInterval);
        game.fallInterval = null;
        isPaused = true;
        document.getElementById('pause-button').textContent = 'Resume';
    }
}
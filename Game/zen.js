// Game Constants
const BLOCK_SIZE = 30;
const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const NEXT_PIECES_TO_SHOW = 3;
const LOCK_DELAY = 500; // ms
const MAX_LOCK_DELAY_MOVES = 15;

// Tetris Pieces and Colors
const SHAPES = [
    // I-piece
    [[[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
     [[0,0,1,0], [0,0,1,0], [0,0,1,0], [0,0,1,0]],
     [[0,0,0,0], [0,0,0,0], [1,1,1,1], [0,0,0,0]],
     [[0,1,0,0], [0,1,0,0], [0,1,0,0], [0,1,0,0]]],

    // J-piece
    [[[1,0,0,0], [1,1,1,0], [0,0,0,0], [0,0,0,0]],
     [[0,1,1,0], [0,1,0,0], [0,1,0,0], [0,0,0,0]],
     [[0,0,0,0], [1,1,1,0], [0,0,1,0], [0,0,0,0]],
     [[0,1,0,0], [0,1,0,0], [1,1,0,0], [0,0,0,0]]],

    // L-piece
    [[[0,0,1,0], [1,1,1,0], [0,0,0,0], [0,0,0,0]],
     [[0,1,0,0], [0,1,0,0], [0,1,1,0], [0,0,0,0]],
     [[0,0,0,0], [1,1,1,0], [1,0,0,0], [0,0,0,0]],
     [[1,1,0,0], [0,1,0,0], [0,1,0,0], [0,0,0,0]]],

    // O-piece
    [[[0,1,1,0], [0,1,1,0], [0,0,0,0], [0,0,0,0]],
     [[0,1,1,0], [0,1,1,0], [0,0,0,0], [0,0,0,0]],
     [[0,1,1,0], [0,1,1,0], [0,0,0,0], [0,0,0,0]],
     [[0,1,1,0], [0,1,1,0], [0,0,0,0], [0,0,0,0]]],

    // S-piece
    [[[0,1,1,0], [1,1,0,0], [0,0,0,0], [0,0,0,0]],
     [[0,1,0,0], [0,1,1,0], [0,0,1,0], [0,0,0,0]],
     [[0,0,0,0], [0,1,1,0], [1,1,0,0], [0,0,0,0]],
     [[1,0,0,0], [1,1,0,0], [0,1,0,0], [0,0,0,0]]],

    // T-piece
    [[[0,1,0,0], [1,1,1,0], [0,0,0,0], [0,0,0,0]],
     [[0,1,0,0], [0,1,1,0], [0,1,0,0], [0,0,0,0]],
     [[0,0,0,0], [1,1,1,0], [0,1,0,0], [0,0,0,0]],
     [[0,1,0,0], [1,1,0,0], [0,1,0,0], [0,0,0,0]]],

    // Z-piece
    [[[1,1,0,0], [0,1,1,0], [0,0,0,0], [0,0,0,0]],
     [[0,0,1,0], [0,1,1,0], [0,1,0,0], [0,0,0,0]],
     [[0,0,0,0], [1,1,0,0], [0,1,1,0], [0,0,0,0]],
     [[0,1,0,0], [1,1,0,0], [1,0,0,0], [0,0,0,0]]]
];

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
    grid: Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(0)),
    currentPiece: Array(4).fill().map(() => Array(4).fill(0)),
    heldPiece: Array(4).fill().map(() => Array(4).fill(0)),
    nextPieces: [],
    pieceX: 0,
    pieceY: 0,
    currentType: 0,
    heldType: -1,
    rotation: 0,
    score: 0,
    linesCleared: 0,
    canHold: true,
    isLocking: false,
    lockStartTime: 0,
    lockMoveCount: 0,
    fallSpeed: 500,
    fallInterval: null,
    lastFallTime: 0,
    startTime: 0,
    timerInterval: null,
    gamePaused: false,
    gameMode: 'zen'  // Added gameMode property to distinguish zen mode
};

// Canvas elements
const gridCanvas = document.getElementById('grid-canvas');
const blockCanvas = document.getElementById('block-canvas');
const uiCanvas = document.getElementById('ui-canvas');
const holdCanvas = document.getElementById('hold-canvas');
const nextCanvas = document.getElementById('next-canvas');

const gridCtx = gridCanvas.getContext('2d');
const blockCtx = blockCanvas.getContext('2d');
const uiCtx = uiCanvas.getContext('2d');
const holdCtx = holdCanvas.getContext('2d');
const nextCtx = nextCanvas.getContext('2d');

function updateCanvasSizes() {
    gridCanvas.width = GRID_WIDTH * BLOCK_SIZE;
    gridCanvas.height = GRID_HEIGHT * BLOCK_SIZE;
    blockCanvas.width = GRID_WIDTH * BLOCK_SIZE;
    blockCanvas.height = GRID_HEIGHT * BLOCK_SIZE;
    uiCanvas.width = GRID_WIDTH * BLOCK_SIZE;
    uiCanvas.height = GRID_HEIGHT * BLOCK_SIZE;
    holdCanvas.width = 4 * BLOCK_SIZE;
    holdCanvas.height = 4 * BLOCK_SIZE;
    nextCanvas.width = 4 * BLOCK_SIZE;
    nextCanvas.height = NEXT_PIECES_TO_SHOW * 4 * BLOCK_SIZE;
}

updateCanvasSizes();

// UI Elements
const scoreDisplay = document.getElementById('score-display');
const linesDisplay = document.getElementById('lines-display');
const timeDisplay = document.getElementById('time-display');

function clearAllCanvases() {
    gridCtx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
    blockCtx.clearRect(0, 0, blockCanvas.width, blockCanvas.height);
    uiCtx.clearRect(0, 0, uiCanvas.width, uiCanvas.height);
    holdCtx.clearRect(0, 0, holdCanvas.width, holdCanvas.height);
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
}

function clearGameBoard() {
    // Clear the grid array
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            game.grid[y][x] = 0;
        }
    }
    // Clear the block canvas only (where blocks are drawn)
    blockCtx.clearRect(0, 0, blockCanvas.width, blockCanvas.height);
    // Redraw the grid lines on grid canvas
    drawGrid();
}

function initGame() {
    clearAllCanvases();

    // Clear the grid
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            game.grid[y][x] = 0;
        }
    }
    
    // Reset game state
    game.score = 0;
    game.linesCleared = 0;
    game.heldType = -1;
    game.canHold = true;
    game.isLocking = false;
    game.lockMoveCount = 0;
    game.startTime = Date.now();
    game.gamePaused = false;
    
    // Initialize pieces and start game loop
    initializeNextPieces();
    newPiece();
    startTimer();
    game.fallInterval = setInterval(gameLoop, game.fallSpeed);
    game.lastFallTime = Date.now();
    
    drawGrid();
    drawHoldPiece();
    drawNextPieces();
    drawGame();
}

function resetGame() {
    // Clear all game state
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            game.grid[y][x] = 0;
        }
    }
    
    // Clear all canvases
    clearAllCanvases();
    
    // Reset game state
    game.score = 0;
    game.linesCleared = 0;
    game.heldType = -1;
    game.canHold = true;
    game.isLocking = false;
    game.lockMoveCount = 0;
    game.startTime = Date.now();
    game.gamePaused = false;
    
    // Clear and restart intervals
    clearInterval(game.fallInterval);
    clearInterval(game.timerInterval);
    
    // Reinitialize game elements
    initializeNextPieces();
    newPiece();
    startTimer();
    game.fallInterval = setInterval(gameLoop, game.fallSpeed);
    game.lastFallTime = Date.now();
    
    // Redraw everything
    drawGrid();
    drawHoldPiece();
    drawNextPieces();
    drawGame();
    updateUI();
}

function startTimer() {
    clearInterval(game.timerInterval);
    game.timerInterval = setInterval(() => {
        if (!game.gamePaused) {
            const elapsedSeconds = Math.floor((Date.now() - game.startTime) / 1000);
            const minutes = Math.floor(elapsedSeconds / 60);
            const seconds = elapsedSeconds % 60;
            timeDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }
    }, 1000);
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
    if (game.nextPieces.length < 7) {
        // Refill the next pieces if running low
        let bag = [0,1,2,3,4,5,6];
        for (let i = bag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [bag[i], bag[j]] = [bag[j], bag[i]];
        }
        game.nextPieces = game.nextPieces.concat(bag);
    }
    
    game.currentType = game.nextPieces.shift();
    game.rotation = 0;
    for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
            game.currentPiece[y][x] = SHAPES[game.currentType][0][y][x];
        }
    }
    game.pieceX = Math.floor(GRID_WIDTH / 2) - 2;
    game.pieceY = 0;
    game.canHold = true;
    game.isLocking = false;
    game.lockMoveCount = 0;
    
    if (checkCollision()) {
        if (game.gameMode === 'zen') {
            // In zen mode, clear grid and reset piece position instead of game over
            for (let y = 0; y < GRID_HEIGHT; y++) {
                for (let x = 0; x < GRID_WIDTH; x++) {
                    game.grid[y][x] = 0;
                }
            }
            game.pieceY = 0;
            game.pieceX = Math.floor(GRID_WIDTH / 2) - 2;
        } else {
            // Other modes could have game over logic here
        }
    }
    
    drawNextPieces();
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
    const tempPiece = Array(4).fill().map(() => Array(4).fill(0));
    
    // Transpose matrix
    for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
            tempPiece[x][y] = game.currentPiece[y][x];
        }
    }
    
    // Reverse for rotation direction
    if (clockwise) {
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 2; x++) {
                [tempPiece[y][x], tempPiece[y][3-x]] = [tempPiece[y][3-x], tempPiece[y][x]];
            }
        }
    } else {
        for (let x = 0; x < 4; x++) {
            for (let y = 0; y < 2; y++) {
                [tempPiece[y][x], tempPiece[3-y][x]] = [tempPiece[3-y][x], tempPiece[y][x]];
            }
        }
    }
    
    // Check if rotation is valid
    const oldRotation = game.rotation;
    const oldPiece = game.currentPiece.map(row => [...row]);
    
    game.rotation = (game.rotation + (clockwise ? 1 : -1) + 4) % 4;
    game.currentPiece = tempPiece.map(row => [...row]);
    
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
        game.currentPiece = oldPiece.map(row => [...row]);
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
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                game.currentPiece[y][x] = SHAPES[game.currentType][0][y][x];
            }
        }
        
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
                if (gridY >= 0 && gridY < GRID_HEIGHT && gridX >= 0 && gridX < GRID_WIDTH) {
                    game.grid[gridY][gridX] = game.currentType + 1;
                }
            }
        }
    }
    
    // Clear lines
    let linesCleared = clearLines();
    
    // Update lines cleared count and score based on mode
    if (linesCleared > 0) {
        game.linesCleared += linesCleared;
        if (game.gameMode !== 'zen') {
            game.score += linesCleared * 100;
        }
        updateUI();
    }
    
    // Get new piece
    newPiece();
    
    // Force redraw to prevent visual artifacts
    drawBlocks();
}

function clearLines() {
    let linesCleared = 0;
    
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
                game.grid[yy] = [...game.grid[yy-1]];
            }
            
            // Clear top line
            game.grid[0] = Array(GRID_WIDTH).fill(0);
            
            linesCleared++;
            y++; // Check this row again
        }
    }
    
    return linesCleared;
}

function gameLoop() {
    if (game.gamePaused) return;
    
    const now = Date.now();
    
    if (game.isLocking) {
        if (now - game.lockStartTime >= LOCK_DELAY || game.lockMoveCount >= MAX_LOCK_DELAY_MOVES) {
            lockPiece();
            game.isLocking = false;
        }
    } else {
        // Only move down if enough time has passed
        if (now - game.lastFallTime >= game.fallSpeed) {
            game.pieceY++;
            if (checkCollision()) {
                game.pieceY--;
                if (!game.isLocking) {
                    game.isLocking = true;
                    game.lockStartTime = now;
                    game.lockMoveCount = 0;
                }
            }
            game.lastFallTime = now;
        }
    }
    
    drawGame();
}

function drawGrid() {
    gridCtx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
    gridCtx.fillStyle = '#0f0e15';
    gridCtx.fillRect(0, 0, gridCanvas.width, gridCanvas.height);
    
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
    blockCtx.clearRect(0, 0, blockCanvas.width, blockCanvas.height);
    
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
    // Clear the block area first to prevent darkening
    ctx.clearRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
    
    // Draw main block
    ctx.fillStyle = color;
    ctx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
    
    // Draw highlights
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    
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

    // Add a subtle border to prevent color bleeding
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
}

function drawGhostPiece() {
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
    holdCtx.clearRect(0, 0, holdCanvas.width, holdCanvas.height);
    
    if (game.heldType === -1) return;
    
    const piece = SHAPES[game.heldType][0];
    const offsetX = (holdCanvas.width - 4 * BLOCK_SIZE) / 2;
    const offsetY = (game.heldType === 0) ? (holdCanvas.height - 2 * BLOCK_SIZE) / 2 : 
                  (game.heldType === 3) ? (holdCanvas.height - 2 * BLOCK_SIZE) / 2 : 
                  (holdCanvas.height - 3 * BLOCK_SIZE) / 2;
    
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
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    
    // Show next pieces
    for (let i = 0; i < Math.min(NEXT_PIECES_TO_SHOW, game.nextPieces.length); i++) {
        const type = game.nextPieces[i];
        const piece = SHAPES[type][0];
        const baseY = i * 120;
        const offsetX = (nextCanvas.width - 4 * BLOCK_SIZE) / 2;
        const offsetY = baseY + (
            type === 0 ? (120 - 2 * BLOCK_SIZE) / 2 : 
            type === 3 ? (120 - 2 * BLOCK_SIZE) / 2 : 
            (120 - 3 * BLOCK_SIZE) / 2
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
    uiCtx.clearRect(0, 0, uiCanvas.width, uiCanvas.height);
}

function drawGame() {
    drawBlocks();
    drawUI();
}

function updateUI() {
    if (game.gameMode === 'zen') {
        // In zen mode, show only lines cleared
        scoreDisplay.textContent = '';
        linesDisplay.textContent = game.linesCleared;
    } else {
        scoreDisplay.textContent = game.score;
        linesDisplay.textContent = game.linesCleared;
    }
}

function togglePause() {
    game.gamePaused = !game.gamePaused;
    const pauseButton = document.getElementById('pause-button');
    pauseButton.textContent = game.gamePaused ? 'Resume' : 'Pause';
    
    if (game.gamePaused) {
        clearInterval(game.fallInterval);
        clearInterval(game.timerInterval);
    } else {
        game.fallInterval = setInterval(gameLoop, game.fallSpeed);
        game.lastFallTime = Date.now();
        startTimer();
    }
}

// Event Listeners
document.getElementById('back-button').addEventListener('click', () => {
    window.location.href = 'sologame.html';
});

document.getElementById('pause-button').addEventListener('click', togglePause);

document.addEventListener('keydown', (e) => {
    if (game.gamePaused) return;
    
    switch(e.key) {
        case 'ArrowLeft':
            game.pieceX--;
            if (checkCollision()) game.pieceX++;
            else if (game.isLocking) game.lockMoveCount++;
            break;
        case 'ArrowRight':
            game.pieceX++;
            if (checkCollision()) game.pieceX--;
            else if (game.isLocking) game.lockMoveCount++;
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
            } else if (game.isLocking) game.lockMoveCount++;
            break;
        case 'ArrowUp':
            rotatePiece();
            break;
        case 'z':
        case 'Z':
            rotatePiece(false);
            break;
        case 'c':
        case 'C':
            holdPiece();
            break;
        case ' ':
            while (!checkCollision()) {
                game.pieceY++;
            }
            game.pieceY--;
            lockPiece();
            break;
        case 'p':
        case 'P':
            togglePause();
            break;
    }
    
    drawGame();
});

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initGame();
});
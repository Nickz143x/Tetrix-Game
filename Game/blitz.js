// Game Constants
const BLOCK_SIZE = 30;
const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const BLITZ_TIME_LIMIT = 120; // 2 minutes in seconds
const NEXT_PIECES_TO_SHOW = 2;
const LOCK_DELAY = 500; // ms
const MAX_LOCK_DELAY_MOVES = 15;

// Tetris Pieces (unchanged)
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

// Piece colors (unchanged)
const PIECE_COLORS = [
    '#00f0f0', // I - Cyan
    '#0000ff', // J - Blue
    '#ff9600', // L - Orange
    '#ffff32', // O - Yellow
    '#32ff32', // S - Green
    '#b400b4', // T - Purple
    '#ff3232'  // Z - Red
];

// Game state (unchanged)
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
    gameOver: false,
    isLocking: false,
    lockStartTime: 0,
    lockMoveCount: 0,
    fallSpeed: 400, // Faster than classic mode
    fallInterval: null,
    lastFallTime: 0
};

// Timer variables (unchanged)
let timeRemaining = BLITZ_TIME_LIMIT;
let timerInterval;
let gameActive = true;
let gamePaused = false;

function clearIntervals() {
    if (game.fallInterval) {
        clearInterval(game.fallInterval);
        game.fallInterval = null;
    }
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// Canvas elements (unchanged)
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

// UI Elements (unchanged)
const scoreDisplay = document.getElementById('score-display');
const linesDisplay = document.getElementById('lines-display');
const timeDisplay = document.getElementById('time-display');

// Navigation Helper (unchanged)
class NavigationHelper {
    static async navigateTo(targetPage) {
        const possiblePaths = [
            targetPage,
            `../${targetPage}`,
            `/${targetPage}`,
            `../../${targetPage}`,
            `/Game/${targetPage.replace('Game/','')}`
        ];
        
        for (const path of possiblePaths) {
            try {
                const response = await fetch(path, { method: 'HEAD' });
                if (response.ok) {
                    window.location.href = path;
                    return;
                }
            } catch (e) {
                console.log(`Path not found: ${path}`);
            }
        }
        
        alert(`Could not find ${targetPage} at any of these locations:\n${possiblePaths.join('\n')}`);
    }
}

// Initialize game with Blitz mode rules (unchanged)
const countdownOverlay = document.getElementById('countdown-overlay');

let countdownActive = false;
let countdownTimer = null;

function startCountdown(seconds, callback) {
    if (countdownActive) return;
    countdownActive = true;
    let current = seconds;
    countdownOverlay.style.display = 'flex';
    countdownOverlay.textContent = current;

    countdownTimer = setInterval(() => {
        current--;
        if (current > 0) {
            countdownOverlay.textContent = current;
        } else {
            clearInterval(countdownTimer);
            countdownOverlay.style.display = 'none';
            countdownActive = false;
            if (callback) callback();
        }
    }, 1000);
}

function initGame() {
    // Reset game state
    game.grid = Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(0));
    game.score = 0;
    game.linesCleared = 0;
    game.gameOver = false;
    game.heldType = -1;
    gameActive = true;
    gamePaused = false;
    timeRemaining = BLITZ_TIME_LIMIT;
    
    // Reset UI
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('time-display').classList.remove('time-critical');
    document.getElementById('score-display').textContent = '0';
    document.getElementById('lines-display').textContent = '0';
    
    // Initialize canvas sizes
    updateCanvasSizes();
    clearAllCanvases();
    
    // Initialize game elements
    initializeNextPieces();
    newPiece();
    startTimer();
    
    // Set fall speed (faster than classic mode)
    game.fallSpeed = 400;
    
    // Initial draw
    drawGrid();
    drawHoldPiece();
    drawNextPieces();
    
    // Show countdown and start game loop after countdown
    startCountdown(3, () => {
        game.fallInterval = setInterval(gameLoop, game.fallSpeed);
        game.lastFallTime = Date.now();
        drawGame();
    });
}

// Timer functions (unchanged)
function startTimer() {
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        if (!gamePaused && gameActive) {
            timeRemaining--;
            updateTimerDisplay();
            
            if (timeRemaining <= 10) {
                document.getElementById('time-display').classList.add('time-critical');
            }
            
            if (timeRemaining <= 0) {
                gameOver();
            }
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timeDisplay.textContent = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
}

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

function clearAllCanvases() {
    gridCtx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
    blockCtx.clearRect(0, 0, blockCanvas.width, blockCanvas.height);
    uiCtx.clearRect(0, 0, uiCanvas.width, uiCanvas.height);
    holdCtx.clearRect(0, 0, holdCanvas.width, holdCanvas.height);
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
}

// Enhanced gameOver function for Blitz mode (unchanged)
function gameOver() {
    game.gameOver = true;
    clearInterval(game.fallInterval);
    clearInterval(timerInterval);
    drawGameOver();
    
    // Save score to leaderboard
    saveScoreToLeaderboard();
    
    // Show game over UI
    document.getElementById('final-score').textContent = game.score;
    document.getElementById('final-lines').textContent = game.linesCleared;
    document.getElementById('game-over').style.display = 'flex';
}

function saveScoreToLeaderboard() {
    // Get current user
    const currentUser = JSON.parse(localStorage.getItem('tetrixCurrentUser')) || {};
    const playerName = currentUser.username || (currentUser.guest ? 'Guest' : 'Player');
    
    // Get existing scores
    const scores = JSON.parse(localStorage.getItem('tetrixBlitzScores')) || [];
    
    // Add new score
    scores.push({
        name: playerName,
        score: game.score,
        lines: game.linesCleared,
        timestamp: Date.now()
    });
    
    // Sort by score (highest first) and keep top 10
    const sortedScores = scores.sort((a, b) => b.score - a.score).slice(0, 10);
    
    // Save back to localStorage
    localStorage.setItem('tetrixBlitzScores', JSON.stringify(sortedScores));
}

// Modified scoring system for Blitz mode (unchanged)
function updateScore(lines) {
    const baseScores = [100, 300, 500, 800]; // Points for 1, 2, 3, 4 lines
    
    // Time bonus - higher score multiplier as time runs out
    const timeBonus = 1 + (BLITZ_TIME_LIMIT - timeRemaining) / BLITZ_TIME_LIMIT;
    
    // Calculate score with time bonus
    const scoreIncrease = Math.floor(baseScores[lines-1] * timeBonus);
    game.score += scoreIncrease;
    
    // Update lines cleared
    game.linesCleared += lines;
    
    // Update UI
    scoreDisplay.textContent = game.score;
    linesDisplay.textContent = game.linesCleared;
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
        gameOver();
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
        const kicks = [1, -1];
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
    
    // Update score with time bonus
    if (linesClearedThisTime > 0) {
        updateScore(linesClearedThisTime);
    }
    
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
            // Fix: Immediately lock piece if it cannot move down further
            if (!game.isLocking) {
                game.isLocking = true;
                game.lockStartTime = now;
                game.lockMoveCount = 0;
            }
        }
    }
    
    drawGame();
    game.lastFallTime = now;
}

function drawGrid() {
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
    
    // Show next 3 pieces
    for (let i = 0; i < Math.min(3, game.nextPieces.length); i++) {
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
    
    if (game.gameOver) {
        drawGameOver();
    }
}

function drawGameOver() {
    uiCtx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    uiCtx.fillRect(0, 0, uiCanvas.width, uiCanvas.height);
    
    // Title
    uiCtx.fillStyle = '#ff5555';
    uiCtx.font = 'bold 36px Inter';
    uiCtx.textAlign = 'center';
    uiCtx.textBaseline = 'middle';
    uiCtx.fillText('TIME\'S UP!', uiCanvas.width / 2, uiCanvas.height / 2 - 60);
    
    // Stats
    uiCtx.fillStyle = '#ffffff';
    uiCtx.font = '24px Inter';
    uiCtx.fillText(`Final Score: ${game.score}`, uiCanvas.width / 2, uiCanvas.height / 2);
    uiCtx.fillText(`Lines Cleared: ${game.linesCleared}`, uiCanvas.width / 2, uiCanvas.height / 2 + 40);
}

function drawGame() {
    drawGrid();
    drawBlocks();
    drawUI();
}

function togglePause() {
    if (!gamePaused) {
        // Pause the game
        gamePaused = true;
        clearIntervals();
        document.getElementById('pause-button').textContent = 'Resume';
        drawGame();
    } else {
        // Resume the game
        gamePaused = false;
        document.getElementById('pause-button').textContent = 'Pause';
        game.fallInterval = setInterval(gameLoop, game.fallSpeed);
        game.lastFallTime = Date.now();
        timerInterval = setInterval(() => {
            if (!gamePaused) {
                timeRemaining--;
                updateTimerDisplay();

                if (timeRemaining <= 0) {
                    gameOver();
                }
            }
        }, 1000);
        drawGame();
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Set up event listeners
    document.getElementById('back-button').addEventListener('click', () => {
        NavigationHelper.navigateTo('sologame.html');
    });
    
    document.getElementById('mode-select-button').addEventListener('click', () => {
        NavigationHelper.navigateTo('sologame.html');
    });
    
    document.getElementById('pause-button').addEventListener('click', togglePause);
    document.getElementById('restart-button').addEventListener('click', () => {
        document.getElementById('game-over').style.display = 'none';
        initGame();
    });
    
    // Initialize the game
    initGame();
});

// Key controls without sound
document.addEventListener('keydown', (e) => {
    if (game.gameOver) {
        switch(e.key) {
            case 'Enter':
                document.getElementById('game-over').style.display = 'none';
                initGame();
                break;
            case 'Escape':
                NavigationHelper.navigateTo('sologame.html');
                break;
        }
        return;
    }
    
    if (gamePaused && e.key !== 'Escape' && e.key !== 'p' && e.key !== 'P') {
        return;
    }
    
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
            // Hard drop
            while (!checkCollision()) {
                game.pieceY++;
            }
            game.pieceY--;
            lockPiece();
            break;
        case 'Escape':
        case 'p':
        case 'P':
            togglePause();
            break;
    }
    
    drawGame();
});
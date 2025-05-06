// Falling Tetris Blocks Animation
function createFallingBlocks() {
    const container = document.createElement('div');
    container.className = 'falling-blocks';
    container.id = 'fallingBlocks';
    document.body.prepend(container);

    const colors = ['#FF5733', '#33FF57', '#3357FF', '#F4F433', '#FF33A1', '#F8F833']; // Tetris block colors
    const shapes = [
        // T-Shape
        [[1, 1, 1], [0, 1, 0]],
        // L-Shape
        [[1, 0, 0], [1, 1, 1]],
        // Reverse L-Shape
        [[0, 0, 1], [1, 1, 1]],
        // Z-Shape
        [[1, 1, 0], [0, 1, 1]],
        // Reverse Z-Shape
        [[0, 1, 1], [1, 1, 0]],
        // Square Shape (O)
        [[1, 1], [1, 1]],
        // Stick Shape (I)
        [[1, 1, 1, 1]]
    ];

    // Create 20-30 blocks depending on screen size
    const blockCount = Math.min(30, Math.max(20, window.innerWidth / 30));

    for (let i = 0; i < blockCount; i++) {
        const block = document.createElement('div');
        block.className = 'block';

        // Random properties
        const size = Math.random() * 40 + 20; // 20-60px
        const duration = Math.random() * 15 + 10; // 10-25s
        const delay = Math.random() * 15; // 0-15s
        const left = Math.random() * 100; // 0-100%
        const color = colors[Math.floor(Math.random() * colors.length)];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        const opacity = Math.random() * 0.5 + 0.3; // 0.3-0.8

        // Generate Tetris block shape (grid-based)
        const blockGrid = createShapeGrid(shape, size, color);

        block.style.cssText = `
            position: absolute;
            left: ${left}%;
            animation: fall ${duration}s linear infinite;
            animation-delay: ${delay}s;
            opacity: ${opacity};
        `;

        // Add the block's shape (nested divs for each grid cell)
        block.appendChild(blockGrid);
        container.appendChild(block);
    }
}

// Function to generate a Tetris block's shape
function createShapeGrid(shape, blockSize, color) {
    const blockGrid = document.createElement('div');
    blockGrid.style.display = 'grid';
    blockGrid.style.gridTemplateColumns = `repeat(${shape[0].length}, 1fr)`;
    blockGrid.style.gridTemplateRows = `repeat(${shape.length}, 1fr)`;
    blockGrid.style.width = `${blockSize}px`;
    blockGrid.style.height = `${blockSize}px`;
    blockGrid.style.position = 'relative';

    // Fill grid with blocks
    shape.forEach(row => {
        row.forEach(cell => {
            const cellDiv = document.createElement('div');
            if (cell === 1) {
                cellDiv.style.backgroundColor = color; // Inherit the color of the main block
                cellDiv.style.position = 'absolute';
                cellDiv.style.width = '100%';
                cellDiv.style.height = '100%';
            }
            blockGrid.appendChild(cellDiv);
        });
    });

    return blockGrid;
}

// Add the animation styles via JavaScript
function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fall {
            0% {
                transform: translateY(-100px) translateX(0) rotate(0deg);
            }
            100% {
                transform: translateY(calc(100vh + 100px)) translateX(100px) rotate(360deg);
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialize the animation
function initAnimation() {
    addAnimationStyles();
    createFallingBlocks();
    
    // Recreate blocks on resize (with debounce)
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const container = document.getElementById('fallingBlocks');
            if (container) container.remove();
            createFallingBlocks();
        }, 200);
    });
}

// Start the animation when the page loads
document.addEventListener('DOMContentLoaded', initAnimation);

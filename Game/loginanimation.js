// Falling Tetris Blocks Animation
function createFallingBlocks() {
    const container = document.createElement('div');
    container.className = 'falling-blocks';
    container.id = 'fallingBlocks';
    document.body.prepend(container);

    const colors = ['#7c6394', '#3a2d5f', '#554080', '#4CAF50'];
    const shapes = [
        'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',      // Square
        'polygon(0% 0%, 60% 0%, 60% 60%, 0% 60%)',          // L-shape
        'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',      // Diamond
        'polygon(0% 0%, 100% 0%, 50% 100%)',                // Triangle
        'polygon(0% 0%, 60% 0%, 40% 100%, 0% 100%)'         // Z-shape
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
        
        // Apply styles
        block.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${left}%;
            animation-duration: ${duration}s;
            animation-delay: ${delay}s;
            background-color: ${color};
            border-color: ${color};
            clip-path: ${shape};
            opacity: ${opacity};
            transform: rotate(${Math.random() * 360}deg);
        `;
        
        container.appendChild(block);
    }
}

// Add the CSS for the animation dynamically
function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .falling-blocks {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            pointer-events: none;
            overflow: hidden;
        }
        
        .block {
            position: absolute;
            animation: fall linear infinite;
            border: 1px solid;
            will-change: transform;
        }
        
        @keyframes fall {
            0% {
                transform: translateY(-100px) rotate(0deg);
            }
            100% {
                transform: translateY(calc(100vh + 100px)) rotate(360deg);
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

function initFallingBlocks() {
    const container = document.getElementById('fallingBlocks');
    const colors = ['rgba(124, 99, 148, 0.3)', 'rgba(58, 45, 95, 0.3)', 'rgba(85, 64, 128, 0.3)'];
    const shapes = [
        'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', // Square
        'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',  // Diamond
        'polygon(0% 0%, 100% 0%, 50% 100%)'             // Triangle
    ];

    function createBlock() {
        const block = document.createElement('div');
        block.className = 'block';
        
        const size = Math.random() * 30 + 20;
        const duration = Math.random() * 15 + 10;
        const left = Math.random() * 100;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        
        block.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${left}%;
            animation: fall ${duration}s linear infinite;
            animation-delay: ${Math.random() * 5}s;
            background-color: ${color};
            clip-path: ${shape};
            position: absolute;
            opacity: 0.3;
        `;
        
        container.appendChild(block);
        
        // Remove block after animation completes to prevent DOM overload
        setTimeout(() => {
            block.remove();
        }, duration * 1000);
    }

    // Create initial blocks
    for (let i = 0; i < 15; i++) {
        createBlock();
    }

    // Add new blocks periodically
    setInterval(createBlock, 1000);

    // Animation definition
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fall {
            to { transform: translateY(100vh) rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

// Initialize when page loads
window.onload = initFallingBlocks;
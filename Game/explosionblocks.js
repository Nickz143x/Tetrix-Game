// Explosion Effect: Exploding blocks with animation, no overlap
document.addEventListener('DOMContentLoaded', () => {
    for (let i = 0; i < 30; i++) {
        createExplosionBlock();
    }
});

function createExplosionBlock() {
    const block = document.createElement('div');
    block.classList.add('falling-block');

    block.style.position = 'absolute';
    block.style.width = `${Math.random() * 20 + 20}px`;
    block.style.height = block.style.width;
    block.style.backgroundColor = 'rgba(7, 154, 173, 0.7)';
    
    let leftPos = Math.random() * window.innerWidth;
    let topPos = -30;  // Start above the viewport

    // Ensure no overlap
    while (isOverlapping(leftPos, topPos, block.style.width)) {
        leftPos = Math.random() * window.innerWidth;
    }

    block.style.left = `${leftPos}px`;
    block.style.top = `${topPos}px`;
    document.body.appendChild(block);

    let speed = Math.random() * 2 + 1; // Speed of falling
    let sizeIncrease = 0.05; // Size increase for explosion
    let explosionDuration = 1000; // Time before explosion effect

    let interval = setInterval(() => {
        let blockRect = block.getBoundingClientRect();
        if (blockRect.top >= window.innerHeight) {
            clearInterval(interval);
            // Start explosion effect
            explodeBlock(block);
        } else {
            block.style.top = `${blockRect.top + speed}px`; // Move the block down
        }
    }, 16);
}

function explodeBlock(block) {
    let size = 1;
    let interval = setInterval(() => {
        if (size >= 3) {
            clearInterval(interval);
            block.remove();
            createExplosionBlock(); // Keep the number of blocks constant
        }
        size += 0.1;
        block.style.transform = `scale(${size})`;
        block.style.opacity = 1 - (size - 1) * 0.3; // Fade out during explosion
    }, 16);
}

function isOverlapping(left, top, width) {
    const blocks = document.querySelectorAll('.falling-block');
    for (let block of blocks) {
        const blockRect = block.getBoundingClientRect();
        // If the new block overlaps with any existing block, return true
        if (
            left < blockRect.left + blockRect.width &&
            left + width > blockRect.left &&
            top < blockRect.top + blockRect.height &&
            top + 30 > blockRect.top
        ) {
            return true;
        }
    }
    return false;
}

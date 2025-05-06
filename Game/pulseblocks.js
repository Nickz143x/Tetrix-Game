// Pulse Effect: Pulsing blocks with animation, no overlap
document.addEventListener('DOMContentLoaded', () => {
    for (let i = 0; i < 30; i++) {
        createPulsingBlock();
    }
});

function createPulsingBlock() {
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

    let scale = 1;
    let pulseDirection = 1; // 1 for growing, -1 for shrinking
    let pulseSpeed = 0.03;

    let interval = setInterval(() => {
        if (scale >= 1.5) {
            pulseDirection = -1; // Shrink
        } else if (scale <= 1) {
            pulseDirection = 1; // Grow
        }

        scale += pulseSpeed * pulseDirection;
        block.style.transform = `scale(${scale})`;

        let blockRect = block.getBoundingClientRect();
        if (blockRect.top >= window.innerHeight) {
            clearInterval(interval);
            block.remove();
            createPulsingBlock(); // Keep the number of blocks constant
        } else {
            block.style.top = `${blockRect.top + 2}px`; // Move the block down
        }
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

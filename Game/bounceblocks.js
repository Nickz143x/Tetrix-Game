// Bounce Effect: Bouncing blocks with animation, no overlap
document.addEventListener('DOMContentLoaded', () => {
    for (let i = 0; i < 30; i++) {
        createBouncingBlock();
    }
});

function createBouncingBlock() {
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

    let direction = 1; // 1 for down, -1 for up
    let speed = Math.random() * 1 + 0.5; // Speed of bouncing
    let bounceHeight = 150 + Math.random() * 100; // Height to bounce

    let interval = setInterval(() => {
        let blockRect = block.getBoundingClientRect();
        if (direction === 1 && blockRect.top + blockRect.height >= window.innerHeight - bounceHeight) {
            direction = -1; // Start moving up
        } else if (direction === -1 && blockRect.top <= 0) {
            direction = 1; // Start moving down again
        }

        block.style.top = `${blockRect.top + speed * direction}px`;
    }, 16);

    // Remove block after 10 seconds
    setTimeout(() => {
        clearInterval(interval);
        block.remove();
        createBouncingBlock(); // Keep the number of blocks constant
    }, 10000);
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

// Rotate Effect: Rotating blocks with animation, no overlap
document.addEventListener('DOMContentLoaded', () => {
    for (let i = 0; i < 30; i++) {
        createRotatingBlock();
    }
});

function createRotatingBlock() {
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
    block.style.transformOrigin = 'center';
    document.body.appendChild(block);

    let angle = 0; // Initial rotation angle
    let speed = Math.random() * 1 + 0.5; // Speed of rotation
    let interval = setInterval(() => {
        angle += speed; // Increase the angle to rotate
        block.style.transform = `rotate(${angle}deg)`;

        let blockRect = block.getBoundingClientRect();
        if (blockRect.top >= window.innerHeight) {
            clearInterval(interval);
            block.remove();
            createRotatingBlock(); // Keep the number of blocks constant
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

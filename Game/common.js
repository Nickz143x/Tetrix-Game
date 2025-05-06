function navigateTo(page) {
    playClickSound();
    window.location.href = page;
}

function playClickSound() {
    const clickSound = document.getElementById('click-sound');
    if (clickSound) {
        clickSound.currentTime = 0;
        clickSound.play();
    }
}

function playHoverSound() {
    const hoverSound = document.getElementById('hover-sound');
    if (hoverSound) {
        hoverSound.currentTime = 0;
        hoverSound.play();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const menuOptions = document.querySelectorAll('.menu-option');
    menuOptions.forEach(option => {
        option.addEventListener('mouseenter', playHoverSound);
    });
});

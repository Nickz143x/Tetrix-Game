// Fade-in effect for the container
document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.welcome-container');
    container.style.opacity = 0;

    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('tetrixCurrentUser'));
    if (!currentUser) {
        // Redirect to login if no user found
        window.location.href = 'login.html';
        return;
    }

    // Personalize welcome message based on username in localStorage
    const welcomeMessage = document.getElementById('welcome-message');
    const username = currentUser.username || (currentUser.guest ? 'Guest' : null);
    if (username) {
        welcomeMessage.innerHTML = `Welcome, <br>${username}!`;
    } else {
        welcomeMessage.innerHTML = 'Welcome to<br>TETR.IX!';
    }

    setTimeout(() => {
        container.style.transition = "opacity 1s ease";
        container.style.opacity = 1; // Fade-in after 100ms delay
    }, 100);

    // Create 30 falling blocks initially
    for (let i = 0; i < 30; i++) {
        createFallingBlock();
    }

    // Redirect after 5 seconds with fade-out effect
    setTimeout(() => {
        container.style.transition = "opacity 1s ease";
        container.style.opacity = 0; // Fade-out effect

        setTimeout(() => {
            window.location.href = "dashboard.html"; // Redirect after fade-out
        }, 1000); // Wait 1 second for fade-out animation to finish
    }, 4000); // Fade-out after 4 seconds
});

// Function to create falling blocks with random behavior
function createFallingBlock() {
    const block = document.createElement('div');
    block.classList.add('falling-block');

    // Randomize the horizontal position
    block.style.left = Math.random() * window.innerWidth + 'px';

    // Set a random animation duration (between 2 to 5 seconds) for each block
    block.style.animationDuration = (Math.random() * 3 + 2) + 's'; 

    // Randomize the opacity between 0.3 and 0.8 for each block
    block.style.opacity = Math.random() * 0.5 + 0.3; 

    // Append the block to the body
    document.body.appendChild(block);

    // Remove block after the animation is finished (15 seconds)
    block.addEventListener('animationend', () => {
        block.remove();
        createFallingBlock(); // Keep the number of blocks consistent at all times
    });
}

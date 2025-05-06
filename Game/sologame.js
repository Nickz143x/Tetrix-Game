// sologame.js

// --- Background gradient animation ---
const body = document.body;
body.style.background = "linear-gradient(-45deg, #0f0e15, #1a1a2e, #0f0e15, #1a1a2e)";
body.style.backgroundSize = "400% 400%";
body.style.animation = "gradientBG 15s ease infinite";

// Add keyframes manually
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes gradientBG {
    0% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
    100% {
        background-position: 0% 50%;
    }
}
`;
document.head.appendChild(styleSheet);

// --- Optional: Background particles ---
const canvas = document.createElement('canvas');
canvas.id = "background-canvas";
canvas.style.position = "fixed";
canvas.style.top = "0";
canvas.style.left = "0";
canvas.style.width = "100%";
canvas.style.height = "100%";
canvas.style.zIndex = "-1"; // Behind everything
document.body.appendChild(canvas);

const ctx = canvas.getContext('2d');
let particlesArray;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', function(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
});

const numberOfParticles = 100;
class Particle {
    constructor(x, y, directionX, directionY, size, color){
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.color = color;
    }
    draw(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    update(){
        if(this.x + this.size > canvas.width || this.x - this.size < 0){
            this.directionX = -this.directionX;
        }
        if(this.y + this.size > canvas.height || this.y - this.size < 0){
            this.directionY = -this.directionY;
        }
        this.x += this.directionX;
        this.y += this.directionY;
        this.draw();
    }
}

function initParticles(){
    particlesArray = [];
    for (let i = 0; i < numberOfParticles; i++){
        let size = Math.random() * 2;
        let x = Math.random() * (innerWidth - size * 2);
        let y = Math.random() * (innerHeight - size * 2);
        let directionX = (Math.random() * 0.5) - 0.25;
        let directionY = (Math.random() * 0.5) - 0.25;
        let color = 'rgba(255, 255, 255, 0.7)';
        particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
    }
}

function animateParticles(){
    requestAnimationFrame(animateParticles);
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (let i = 0; i < particlesArray.length; i++){
        particlesArray[i].update();
    }
}

initParticles();
animateParticles();



const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const wrapper = document.getElementById("game-wrapper");

function resize() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
}
resize();
addEventListener("resize", resize);

/* 🦊 IMAGES */
const foxDay = new Image();
foxDay.src = "fox.jpg";

const foxNight = new Image();
foxNight.src = "fox_night.png";

/* 🔊 AUDIO */
const jumpSound = new Audio("jump.mpeg");
const nightSound = new Audio("night.mpeg");
const gameOverSound = new Audio("gameover.mpeg");

/* 🔓 AUDIO UNLOCK */
let audioUnlocked = false;
function unlockAudio() {
    if (audioUnlocked) return;
    [jumpSound, nightSound, gameOverSound].forEach(s => {
        s.muted = true;
        s.play().then(() => {
            s.pause();
            s.currentTime = 0;
            s.muted = false;
        }).catch(()=>{});
    });
    audioUnlocked = true;
}

/* 🎮 GAME STATE */
let score = 0;
let speed = 5;
let gravity = 0.8;
let isNight = false;
let gameOver = false;

/* 🦊 PLAYER */
const fox = {
    x: 120,
    y: 0,
    w: 90,
    h: 95,
    vy: 0,
    jumping: false
};

const groundY = () => canvas.height * 0.75;

/* 🧱 OBSTACLE */
let obstacle = spawnObstacle();

function spawnObstacle() {
    return {
        x: canvas.width,
        w: 40,
        h: 50
    };
}

/* ⬆️ INPUT */
function jump() {
    unlockAudio();

    if (!fox.jumping && !gameOver) {
        fox.vy = -17;
        fox.jumping = true;

        const sound = isNight ? nightSound : jumpSound;
        sound.currentTime = 0;
        sound.play().catch(()=>{});
    }

    if (gameOver) location.reload();
}

addEventListener("keydown", e => {
    if (e.code === "Space") jump();
});
addEventListener("touchstart", e => {
    e.preventDefault();
    jump();
}, { passive:false });

/* 🔄 UPDATE */
function update() {
    if (gameOver) return;

    score++;
    speed = 5 + score * 0.002;
    scoreEl.textContent = score;

    // 🌙 NIGHT SWITCH
    if (score > 800) {
        isNight = true;
        wrapper.classList.add("night");
    }
    if (score > 1600) {
        isNight = false;
        wrapper.classList.remove("night");
    }

    fox.vy += gravity;
    fox.y += fox.vy;

    if (fox.y >= groundY() - fox.h) {
        fox.y = groundY() - fox.h;
        fox.vy = 0;
        fox.jumping = false;
    }

    obstacle.x -= speed;
    if (obstacle.x < -obstacle.w) obstacle = spawnObstacle();

    if (
        fox.x < obstacle.x + obstacle.w &&
        fox.x + fox.w > obstacle.x &&
        fox.y + fox.h > groundY() - obstacle.h
    ) {
        gameOver = true;
        gameOverSound.play().catch(()=>{});
    }
}

/* 🎨 DRAW */
function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle = "#2e7d32";
    ctx.fillRect(0, groundY(), canvas.width, canvas.height);

    ctx.fillStyle = "#5d4037";
    ctx.fillRect(obstacle.x, groundY() - obstacle.h, obstacle.w, obstacle.h);

    const img = isNight ? foxNight : foxDay;
    ctx.drawImage(img, fox.x, fox.y, fox.w, fox.h);
}

/* 🔁 LOOP */
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

foxDay.onload = () => {
    fox.y = groundY() - fox.h;
    loop();
};

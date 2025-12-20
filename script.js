const field = document.getElementById("field");
const timeEl = document.getElementById("time");
const scoreEl = document.getElementById("score");
const startBtn = document.getElementById("start");
const message = document.getElementById("message");

const INSECTS = ["🐜", "🕷", "🐞", "🦗", "🦟"];

let time = 30;
let score = 0;
let gameRunning = false;

let timers = [];

function resetGame() {
  field.innerHTML = "";
  time = 30;
  score = 0;
  timeEl.textContent = time;
  scoreEl.textContent = score;
  message.textContent = "Boa sorte!";
  timers.forEach(t => clearInterval(t));
  timers = [];
}

function endGame() {
  gameRunning = false;
  timers.forEach(t => clearInterval(t));
  timers = [];

  message.innerHTML = `
    <strong>Fim de jogo!</strong><br>
    Sua pontuação final foi <strong>${score}</strong>
  `;

  startBtn.disabled = false;
}

function spawnRandomInsect() {
  if (!gameRunning) return;

  const insect = document.createElement("div");
  insect.className = "insect";
  insect.textContent = INSECTS[Math.floor(Math.random() * INSECTS.length)];

  insect.style.left = Math.random() * (field.clientWidth - 30) + "px";
  insect.style.top = Math.random() * (field.clientHeight - 30) + "px";

  insect.onclick = () => {
    score++;
    scoreEl.textContent = score;
    insect.remove();
  };

  field.appendChild(insect);

  setTimeout(() => insect.remove(), 1200);
}

function spawnMovingInsect() {
  if (!gameRunning) return;

  const insect = document.createElement("div");
  insect.className = "insect";
  insect.textContent = INSECTS[Math.floor(Math.random() * INSECTS.length)];

  let x = -30;
  const y = Math.random() * (field.clientHeight - 30);

  insect.style.top = y + "px";

  insect.onclick = () => {
    score++;
    scoreEl.textContent = score;
    insect.remove();
  };

  field.appendChild(insect);

  const move = setInterval(() => {
    if (!gameRunning) {
      clearInterval(move);
      insect.remove();
      return;
    }

    x += 3;
    insect.style.left = x + "px";

    if (x > field.clientWidth) {
      clearInterval(move);
      insect.remove();
    }
  }, 30);

  timers.push(move);
}

function startGame() {
  resetGame();
  gameRunning = true;
  startBtn.disabled = true;

  const countdown = setInterval(() => {
    time--;
    timeEl.textContent = time;
    if (time <= 0) {
      clearInterval(countdown);
      endGame();
    }
  }, 1000);

  timers.push(countdown);

  timers.push(setInterval(spawnRandomInsect, 700));
  timers.push(setInterval(spawnMovingInsect, 1200));
}

startBtn.onclick = startGame;

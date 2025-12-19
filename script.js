const board = document.getElementById("board");
const timeEl = document.getElementById("time");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const hardBtn = document.getElementById("hardBtn");

let score = 0;
let timeLeft = 30;
let timer = null;
let spawner = null;
let playing = false;
let hardMode = false;

const BEST_KEY = "bughunt_best_v1";

function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

function loadBest(){
  const v = Number(localStorage.getItem(BEST_KEY) || 0);
  bestEl.textContent = String(v);
  return v;
}
function setBest(v){
  localStorage.setItem(BEST_KEY, String(v));
  bestEl.textContent = String(v);
}

function resetUI(){
  score = 0;
  timeLeft = 30;
  scoreEl.textContent = "0";
  timeEl.textContent = "30";
  board.innerHTML = "";
}

function randomPos(){
  const rect = board.getBoundingClientRect();
  // margens para não cortar o bug nas bordas
  const x = clamp(Math.random() * rect.width, 40, rect.width - 40);
  const y = clamp(Math.random() * rect.height, 40, rect.height - 40);
  return {x, y};
}

function spawnBug(){
  if(!playing) return;

  const bug = document.createElement("div");
  bug.className = "bug";
  bug.textContent = "🐞";

  const {x, y} = randomPos();
  bug.style.left = `${x}px`;
  bug.style.top = `${y}px`;

  let removed = false;

  const ttl = hardMode ? 650 : 1100; // tempo na tela
  const die = setTimeout(() => {
    if(removed) return;
    removed = true;
    bug.remove();
  }, ttl);

  bug.addEventListener("click", () => {
    if(removed) return;
    removed = true;
    clearTimeout(die);
    bug.classList.add("hit");
    score += hardMode ? 2 : 1;
    scoreEl.textContent = String(score);
    setTimeout(() => bug.remove(), 80);
  });

  board.appendChild(bug);
}

function start(){
  if(playing) return;
  playing = true;
  startBtn.disabled = true;
  restartBtn.disabled = false;
  board.innerHTML = "";

  timer = setInterval(() => {
    timeLeft -= 1;
    timeEl.textContent = String(timeLeft);
    if(timeLeft <= 0) finish();
  }, 1000);

  const spawnEvery = hardMode ? 420 : 650;
  spawner = setInterval(spawnBug, spawnEvery);
  spawnBug();
}

function finish(){
  playing = false;
  clearInterval(timer);
  clearInterval(spawner);
  timer = null;
  spawner = null;

  startBtn.disabled = false;

  const best = loadBest();
  if(score > best) setBest(score);

  // Mensagem simples
  const msg = document.createElement("div");
  msg.className = "bug";
  msg.style.left = "50%";
  msg.style.top = "50%";
  msg.style.width = "260px";
  msg.style.height = "80px";
  msg.style.borderRadius = "18px";
  msg.style.cursor = "default";
  msg.textContent = `Fim! Pontos: ${score}`;
  board.appendChild(msg);

  setTimeout(() => msg.remove(), 1200);
}

function restart(){
  clearInterval(timer);
  clearInterval(spawner);
  playing = false;
  startBtn.disabled = false;
  restartBtn.disabled = true;
  resetUI();
}

hardBtn.addEventListener("click", () => {
  hardMode = !hardMode;
  hardBtn.textContent = hardMode ? "✅ Modo Hard" : "🔥 Modo Hard";
  if(playing){
    // reinicia pra aplicar o ritmo novo
    restart();
    start();
  }
});

startBtn.addEventListener("click", start);
restartBtn.addEventListener("click", restart);

loadBest();
resetUI();

const board = document.getElementById("board");
const overlay = document.getElementById("overlay");
const timeEl = document.getElementById("time");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const startBtn = document.getElementById("startBtn");
const hardBtn = document.getElementById("hardBtn");

let score = 0;
let timeLeft = 30;
let timer = null;
let spawner = null;
let playing = false;
let hardMode = false;

const BEST_KEY = "bughunt_best_v2";

/**
 * “Bugs” sem emoji:
 * - usamos glifos curtos (monospace) que parecem símbolos de erro/bug
 */
const GLYPHS = ["ERR", "BUG", "404", "!", "X", ";;", "{ }", "</>", "NaN", "NULL"];

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

function resetRound(){
  // reinicia tudo automaticamente
  score = 0;
  timeLeft = 30;
  scoreEl.textContent = "0";
  timeEl.textContent = "30";
  board.querySelectorAll(".target").forEach(el => el.remove());
}

function randomPos(){
  const rect = board.getBoundingClientRect();
  const x = clamp(Math.random() * rect.width, 50, rect.width - 50);
  const y = clamp(Math.random() * rect.height, 50, rect.height - 50);
  return {x, y};
}

function randomGlyph(){
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
}

function randomTint(){
  // deixa o visual variado sem ficar carnaval
  const hues = [210, 230, 250, 270, 190];
  const h = hues[Math.floor(Math.random() * hues.length)];
  return `hsla(${h}, 95%, 70%, .18)`;
}

function spawnTarget(){
  if(!playing) return;

  const target = document.createElement("div");
  target.className = "target";

  // leve variação visual
  target.style.background = `radial-gradient(circle at 30% 25%, rgba(255,255,255,.24), ${randomTint()})`;

  const g = document.createElement("div");
  g.className = "glyph";
  g.textContent = randomGlyph();
  target.appendChild(g);

  const {x, y} = randomPos();
  target.style.left = `${x}px`;
  target.style.top = `${y}px`;

  let removed = false;

  const ttl = hardMode ? 520 : 900; // tempo na tela
  const die = setTimeout(() => {
    if(removed) return;
    removed = true;
    target.remove();
  }, ttl);

  target.addEventListener("click", () => {
    if(removed) return;
    removed = true;
    clearTimeout(die);

    target.classList.add("hit");

    // pontuação
    score += hardMode ? 2 : 1;
    scoreEl.textContent = String(score);

    setTimeout(() => target.remove(), 70);
  });

  board.appendChild(target);
}

function start(){
  // se já estiver jogando, não faz nada
  if(playing) return;

  // reseta AUTOMATICAMENTE ao apertar Start
  resetRound();

  playing = true;
  overlay.classList.add("hidden");
  startBtn.disabled = true;

  // timers
  timer = setInterval(() => {
    timeLeft -= 1;
    timeEl.textContent = String(timeLeft);
    if(timeLeft <= 0) finish();
  }, 1000);

  const spawnEvery = hardMode ? 360 : 560;
  spawner = setInterval(spawnTarget, spawnEvery);
  spawnTarget();
}

function finish(){
  playing = false;
  clearInterval(timer);
  clearInterval(spawner);
  timer = null;
  spawner = null;

  startBtn.disabled = false;
  overlay.classList.remove("hidden");

  const best = loadBest();
  if(score > best) setBest(score);

  // mensagem discreta (sem emoji)
  overlay.querySelector(".overlay-title").textContent = "Partida finalizada";
  overlay.querySelector(".overlay-text").textContent =
    `Pontuação: ${score} • Recorde: ${Math.max(best, score)} • Clique em Start para jogar novamente.`;
}

function toggleHard(){
  hardMode = !hardMode;
  hardBtn.textContent = hardMode ? "Hard: On" : "Hard: Off";

  // se mudar no meio, reinicia a partida automaticamente de forma limpa
  if(playing){
    clearInterval(timer);
    clearInterval(spawner);
    playing = false;
    startBtn.disabled = false;
    start();
  }
}

startBtn.addEventListener("click", start);
hardBtn.addEventListener("click", toggleHard);

loadBest();
resetRound();

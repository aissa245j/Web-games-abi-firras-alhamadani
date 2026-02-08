const gridEl = document.getElementById("grid");
const scoreEl = document.getElementById("score");
const statusEl = document.getElementById("status");
const restartBtn = document.getElementById("restart");

const size = 4;
let grid = [];
let score = 0;
let nextId = 1;
let lastSpawnId = null;

function setup() {
  grid = Array.from({ length: size }, () => Array(size).fill(null));
  score = 0;
  nextId = 1;
  lastSpawnId = null;
  scoreEl.textContent = score;
  statusEl.textContent = "Running";
  addTile();
  addTile();
  render();
}

function addTile() {
  const empty = [];
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      if (!grid[r][c]) empty.push({ r, c });
    }
  }
  if (!empty.length) return;
  const pick = empty[Math.floor(Math.random() * empty.length)];
  const value = Math.random() < 0.9 ? 2 : 4;
  const tile = { id: nextId += 1, value };
  grid[pick.r][pick.c] = tile;
  lastSpawnId = tile.id;
}

function compress(row) {
  const filtered = row.filter(v => v !== null);
  while (filtered.length < size) filtered.push(null);
  return filtered;
}

function merge(row) {
  for (let i = 0; i < size - 1; i += 1) {
    const a = row[i];
    const b = row[i + 1];
    if (a && b && a.value === b.value) {
      a.value *= 2;
      score += a.value;
      row[i + 1] = null;
    }
  }
  return row;
}

function moveLeft() {
  let moved = false;
  for (let r = 0; r < size; r += 1) {
    const row = compress(grid[r]);
    const merged = compress(merge(row));
    if (!sameRow(merged, grid[r])) moved = true;
    grid[r] = merged;
  }
  return moved;
}

function moveRight() {
  grid = grid.map(row => row.slice().reverse());
  const moved = moveLeft();
  grid = grid.map(row => row.slice().reverse());
  return moved;
}

function moveUp() {
  grid = rotate(grid, true);
  const moved = moveLeft();
  grid = rotate(grid, false);
  return moved;
}

function moveDown() {
  grid = rotate(grid, false);
  const moved = moveLeft();
  grid = rotate(grid, true);
  return moved;
}

function rotate(matrix, clockwise) {
  const res = Array.from({ length: size }, () => Array(size).fill(null));
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      if (clockwise) res[r][c] = matrix[size - 1 - c][r];
      else res[r][c] = matrix[c][size - 1 - r];
    }
  }
  return res;
}

function sameRow(a, b) {
  return a.every((cell, i) => (cell?.value || 0) === (b[i]?.value || 0) && (cell?.id || 0) === (b[i]?.id || 0));
}

function hasMoves() {
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      const tile = grid[r][c];
      if (!tile) return true;
      if (r < size - 1 && grid[r + 1][c] && grid[r + 1][c].value === tile.value) return true;
      if (c < size - 1 && grid[r][c + 1] && grid[r][c + 1].value === tile.value) return true;
    }
  }
  return false;
}

function render() {
  const gap = parseFloat(getComputedStyle(gridEl).getPropertyValue("--gap")) || 10;
  const cell = parseFloat(getComputedStyle(gridEl).getPropertyValue("--cell")) || 80;

  const existing = new Map();
  gridEl.querySelectorAll(".tile").forEach(tile => {
    existing.set(Number(tile.dataset.id), tile);
  });

  const used = new Set();

  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      const tile = grid[r][c];
      if (!tile) continue;
      let el = existing.get(tile.id);
      if (!el) {
        el = document.createElement("div");
        el.className = "tile";
        el.dataset.id = tile.id;
        gridEl.appendChild(el);
      }
      el.textContent = tile.value;
      el.style.background = tile.value ? "#ffffff" : "#f0f3f9";
      el.style.transform = `translate(${c * (cell + gap)}px, ${r * (cell + gap)}px)`;
      el.classList.toggle("new", tile.id === lastSpawnId);
      used.add(tile.id);
    }
  }

  existing.forEach((el, id) => {
    if (!used.has(id)) el.remove();
  });

  scoreEl.textContent = score;
  if (!hasMoves()) statusEl.textContent = "Game Over";
  lastSpawnId = null;
}

function handleMove(dir) {
  let moved = false;
  if (dir === "left") moved = moveLeft();
  if (dir === "right") moved = moveRight();
  if (dir === "up") moved = moveUp();
  if (dir === "down") moved = moveDown();
  if (moved) {
    addTile();
    render();
  }
}

let touchStart = null;
function onTouchStart(event) {
  if (event.touches.length !== 1) return;
  const t = event.touches[0];
  touchStart = { x: t.clientX, y: t.clientY };
}

function onTouchEnd(event) {
  if (!touchStart) return;
  const t = event.changedTouches[0];
  const dx = t.clientX - touchStart.x;
  const dy = t.clientY - touchStart.y;
  touchStart = null;
  if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
  if (Math.abs(dx) > Math.abs(dy)) {
    handleMove(dx > 0 ? "right" : "left");
  } else {
    handleMove(dy > 0 ? "down" : "up");
  }
}

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (key === "arrowleft" || key === "a") handleMove("left");
  if (key === "arrowright" || key === "d") handleMove("right");
  if (key === "arrowup" || key === "w") handleMove("up");
  if (key === "arrowdown" || key === "s") handleMove("down");
});

gridEl.addEventListener("touchstart", (event) => {
  event.preventDefault();
  onTouchStart(event);
}, { passive: false });
gridEl.addEventListener("touchend", onTouchEnd, { passive: true });

document.querySelectorAll(".touch-controls button").forEach((btn) => {
  btn.addEventListener("click", () => handleMove(btn.dataset.move));
  btn.addEventListener("touchstart", (event) => {
    event.preventDefault();
  }, { passive: false });
});

restartBtn.addEventListener("click", setup);
setup();

const gridEl = document.getElementById("grid");
    const scoreEl = document.getElementById("score");
    const statusEl = document.getElementById("status");
    const restartBtn = document.getElementById("restart");

    let grid = [];
    let score = 0;

    function setup() {
      grid = Array.from({ length: 4 }, () => Array(4).fill(0));
      score = 0;
      scoreEl.textContent = score;
      statusEl.textContent = "Running";
      addTile();
      addTile();
      render();
    }

    function addTile() {
      const empty = [];
      for (let r = 0; r < 4; r += 1) {
        for (let c = 0; c < 4; c += 1) {
          if (grid[r][c] === 0) empty.push({ r, c });
        }
      }
      if (!empty.length) return;
      const pick = empty[Math.floor(Math.random() * empty.length)];
      grid[pick.r][pick.c] = Math.random() < 0.9 ? 2 : 4;
    }

    function compress(row) {
      const filtered = row.filter(v => v !== 0);
      while (filtered.length < 4) filtered.push(0);
      return filtered;
    }

    function merge(row) {
      for (let i = 0; i < 3; i += 1) {
        if (row[i] && row[i] === row[i + 1]) {
          row[i] *= 2;
          score += row[i];
          row[i + 1] = 0;
        }
      }
      return row;
    }

    function moveLeft() {
      let moved = false;
      for (let r = 0; r < 4; r += 1) {
        const row = compress(grid[r]);
        const merged = compress(merge(row));
        if (merged.join("-") !== grid[r].join("-")) moved = true;
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
      grid = rotate(grid);
      const moved = moveLeft();
      grid = rotate(grid, true);
      return moved;
    }

    function moveDown() {
      grid = rotate(grid, true);
      const moved = moveLeft();
      grid = rotate(grid);
      return moved;
    }

    function rotate(matrix, reverse) {
      const res = Array.from({ length: 4 }, () => Array(4).fill(0));
      for (let r = 0; r < 4; r += 1) {
        for (let c = 0; c < 4; c += 1) {
          if (reverse) res[r][c] = matrix[c][3 - r];
          else res[r][c] = matrix[3 - c][r];
        }
      }
      return res;
    }

    function hasMoves() {
      for (let r = 0; r < 4; r += 1) {
        for (let c = 0; c < 4; c += 1) {
          if (grid[r][c] === 0) return true;
          if (r < 3 && grid[r][c] === grid[r + 1][c]) return true;
          if (c < 3 && grid[r][c] === grid[r][c + 1]) return true;
        }
      }
      return false;
    }

    function render() {
      gridEl.innerHTML = "";
      grid.forEach(row => {
        row.forEach(value => {
          const tile = document.createElement("div");
          tile.className = "tile";
          tile.textContent = value ? value : "";
          tile.style.background = value ? "#ffffff" : "#f0f3f9";
          gridEl.appendChild(tile);
        });
      });
      scoreEl.textContent = score;
      if (!hasMoves()) statusEl.textContent = "Game Over";
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

    document.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();
      if (key === "arrowleft" || key === "a") handleMove("left");
      if (key === "arrowright" || key === "d") handleMove("right");
      if (key === "arrowup" || key === "w") handleMove("up");
      if (key === "arrowdown" || key === "s") handleMove("down");
    });

    document.querySelectorAll(".touch-controls button").forEach((btn) => {
      btn.addEventListener("click", () => handleMove(btn.dataset.move));
      btn.addEventListener("touchstart", (event) => {
        event.preventDefault();
      }, { passive: false });
    });

    restartBtn.addEventListener("click", setup);
    setup();

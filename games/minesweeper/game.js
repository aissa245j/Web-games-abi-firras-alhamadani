const size = 10;
    const totalMines = 15;

    const boardEl = document.getElementById("board");
    const minesEl = document.getElementById("mines");
    const flagsEl = document.getElementById("flags");
    const statusEl = document.getElementById("status");
    const restartBtn = document.getElementById("restart");
    const flagToggleBtn = document.getElementById("flagToggle");

    let cells = [];
    let flags = 0;
    let gameOver = false;
    let flagMode = false;

    function setup() {
      cells = [];
      flags = 0;
      gameOver = false;
      statusEl.textContent = "Running";
      flagsEl.textContent = flags;
      minesEl.textContent = totalMines;

      for (let y = 0; y < size; y += 1) {
        for (let x = 0; x < size; x += 1) {
          cells.push({ x, y, mine: false, revealed: false, flag: false, count: 0 });
        }
      }

      let placed = 0;
      while (placed < totalMines) {
        const pick = Math.floor(Math.random() * cells.length);
        if (!cells[pick].mine) {
          cells[pick].mine = true;
          placed += 1;
        }
      }

      cells.forEach(cell => {
        cell.count = getNeighbors(cell).filter(n => n.mine).length;
      });

      render();
    }

    function getNeighbors(cell) {
      const list = [];
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          if (dx === 0 && dy === 0) continue;
          const nx = cell.x + dx;
          const ny = cell.y + dy;
          const n = cells.find(c => c.x === nx && c.y === ny);
          if (n) list.push(n);
        }
      }
      return list;
    }

    function reveal(cell) {
      if (cell.revealed || cell.flag) return;
      cell.revealed = true;
      if (cell.mine) {
        statusEl.textContent = "Game Over";
        gameOver = true;
        cells.forEach(c => { if (c.mine) c.revealed = true; });
        return;
      }
      if (cell.count === 0) {
        getNeighbors(cell).forEach(n => reveal(n));
      }
    }

    function checkWin() {
      const safe = cells.filter(c => !c.mine);
      if (safe.every(c => c.revealed)) {
        statusEl.textContent = "You win";
        gameOver = true;
      }
    }

    function handleClick(cell) {
      if (gameOver) return;
      if (flagMode) {
        toggleFlag(cell);
      } else {
        reveal(cell);
      }
      checkWin();
      render();
    }

    function toggleFlag(cell) {
      if (cell.revealed) return;
      cell.flag = !cell.flag;
      flags += cell.flag ? 1 : -1;
      flagsEl.textContent = flags;
    }

    function handleRightClick(event, cell) {
      event.preventDefault();
      if (gameOver || cell.revealed) return;
      toggleFlag(cell);
      render();
    }

    function render() {
      boardEl.innerHTML = "";
      cells.forEach(cell => {
        const el = document.createElement("div");
        el.className = "cell" + (cell.revealed ? " revealed" : "") + (cell.flag ? " flag" : "");
        if (cell.revealed) {
          el.textContent = cell.mine ? "*" : (cell.count || "");
        } else if (cell.flag) {
          el.textContent = "F";
        }
        el.addEventListener("click", () => handleClick(cell));
        el.addEventListener("contextmenu", (event) => handleRightClick(event, cell));
        boardEl.appendChild(el);
      });
    }

    restartBtn.addEventListener("click", setup);
    flagToggleBtn.addEventListener("click", () => {
      flagMode = !flagMode;
      flagToggleBtn.textContent = `Flag Mode: ${flagMode ? "On" : "Off"}`;
    });
    setup();

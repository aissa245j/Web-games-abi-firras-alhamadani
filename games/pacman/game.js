const canvas = document.getElementById("board");
    const ctx = canvas.getContext("2d");
    const scoreEl = document.getElementById("score");
    const livesEl = document.getElementById("lives");
    const statusEl = document.getElementById("status");
    const startBtn = document.getElementById("startBtn");

    const tileSize = 20;
    const cols = 21;
    const rows = 21;

    const map = [
      "111111111111111111111",
      "100000000000000000001",
      "101111101011101111101",
      "102000001000100000201",
      "101011101111101110101",
      "100010001000100010001",
      "101110101011101011101",
      "100000101000101000001",
      "101110101110101011101",
      "100010000010000010001",
      "101011111010111110101",
      "100000001000100000001",
      "101111101011101111101",
      "100000001000100000001",
      "101011101111101110101",
      "102010001000100010201",
      "101110101110101011101",
      "100000000000000000001",
      "101111101011101111101",
      "100000000000000000001",
      "111111111111111111111"
    ];

    let pellets = [];
    let ghosts = [];
    let player = { x: 10, y: 15, dx: 0, dy: 0, nextDx: 0, nextDy: 0 };
    let score = 0;
    let lives = 3;
    let running = false;
    let powerUntil = 0;
    let ghostTick = 0;
    let loopId = null;

    function resetLevel() {
      pellets = [];
      ghosts = [
        { x: 10, y: 9, dx: 1, dy: 0, color: "#e76f51" },
        { x: 9, y: 9, dx: -1, dy: 0, color: "#2c4aa5" },
        { x: 11, y: 9, dx: 0, dy: 1, color: "#12a36a" }
      ];
      player.x = 10; player.y = 15; player.dx = 0; player.dy = 0; player.nextDx = 0; player.nextDy = 0;
      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
          if (map[y][x] === "0") pellets.push({ x, y, power: false });
          if (map[y][x] === "2") pellets.push({ x, y, power: true });
        }
      }
      statusEl.textContent = "Running";
    }

    function drawMap() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
          if (map[y][x] === "1") {
            ctx.fillStyle = "#1d2433";
            ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
          }
        }
      }
    }

    function drawPellets() {
      pellets.forEach(p => {
        ctx.fillStyle = p.power ? "#f4b41a" : "#ffffff";
        const size = p.power ? 6 : 3;
        ctx.beginPath();
        ctx.arc(p.x * tileSize + tileSize / 2, p.y * tileSize + tileSize / 2, size, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function drawPlayer() {
      ctx.fillStyle = "#f4b41a";
      ctx.beginPath();
      ctx.arc(player.x * tileSize + tileSize / 2, player.y * tileSize + tileSize / 2, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawGhosts() {
      ghosts.forEach(ghost => {
        ctx.fillStyle = Date.now() < powerUntil ? "#4a5568" : ghost.color;
        ctx.beginPath();
        ctx.arc(ghost.x * tileSize + tileSize / 2, ghost.y * tileSize + tileSize / 2, 8, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function isWall(x, y) {
      if (x < 0 || x >= cols || y < 0 || y >= rows) return true;
      return map[y][x] === "1";
    }

    function movePlayer() {
      const nextX = player.x + player.nextDx;
      const nextY = player.y + player.nextDy;
      if (!isWall(nextX, nextY)) {
        player.dx = player.nextDx;
        player.dy = player.nextDy;
      }
      const targetX = player.x + player.dx;
      const targetY = player.y + player.dy;
      if (!isWall(targetX, targetY)) {
        player.x = targetX;
        player.y = targetY;
      }
    }

    function moveGhosts() {
      ghostTick += 1;
      if (ghostTick % 2 !== 0) return;
      ghosts.forEach(ghost => {
        const options = [
          { x: 1, y: 0 },
          { x: -1, y: 0 },
          { x: 0, y: 1 },
          { x: 0, y: -1 }
        ].filter(dir => !isWall(ghost.x + dir.x, ghost.y + dir.y));
        if (options.length > 0) {
          if (Math.random() < 0.3 || isWall(ghost.x + ghost.dx, ghost.y + ghost.dy)) {
            const pick = options[Math.floor(Math.random() * options.length)];
            ghost.dx = pick.x;
            ghost.dy = pick.y;
          }
        }
        ghost.x += ghost.dx;
        ghost.y += ghost.dy;
      });
    }

    function checkPellets() {
      pellets = pellets.filter(p => {
        if (p.x === player.x && p.y === player.y) {
          score += p.power ? 50 : 10;
          scoreEl.textContent = score;
          if (p.power) powerUntil = Date.now() + 8000;
          return false;
        }
        return true;
      });
      if (pellets.length === 0) {
        statusEl.textContent = "Level cleared";
        resetLevel();
      }
    }

    function checkGhosts() {
      ghosts.forEach(ghost => {
        if (ghost.x === player.x && ghost.y === player.y) {
          if (Date.now() < powerUntil) {
            score += 200;
            scoreEl.textContent = score;
            ghost.x = 10; ghost.y = 9;
          } else {
            lives -= 1;
            livesEl.textContent = lives;
            if (lives <= 0) {
              statusEl.textContent = "Game Over";
              running = false;
              return;
            }
            player.x = 10; player.y = 15; player.dx = 0; player.dy = 0; player.nextDx = 0; player.nextDy = 0;
          }
        }
      });
    }

    function loop() {
      if (!running) return;
      movePlayer();
      moveGhosts();
      checkPellets();
      checkGhosts();
      drawMap();
      drawPellets();
      drawPlayer();
      drawGhosts();
      loopId = setTimeout(loop, 200);
    }

    function startGame() {
      running = true;
      score = 0;
      lives = 3;
      scoreEl.textContent = score;
      livesEl.textContent = lives;
      resetLevel();
      clearTimeout(loopId);
      loop();
    }

    document.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();
      if (!running) startGame();
      if (key === "arrowup" || key === "w") { player.nextDx = 0; player.nextDy = -1; }
      if (key === "arrowdown" || key === "s") { player.nextDx = 0; player.nextDy = 1; }
      if (key === "arrowleft" || key === "a") { player.nextDx = -1; player.nextDy = 0; }
      if (key === "arrowright" || key === "d") { player.nextDx = 1; player.nextDy = 0; }
    });

    document.querySelectorAll(".touch-controls button").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!running) startGame();
        const dir = btn.dataset.dir;
        if (dir === "up") { player.nextDx = 0; player.nextDy = -1; }
        if (dir === "down") { player.nextDx = 0; player.nextDy = 1; }
        if (dir === "left") { player.nextDx = -1; player.nextDy = 0; }
        if (dir === "right") { player.nextDx = 1; player.nextDy = 0; }
      });
      btn.addEventListener("touchstart", (event) => {
        event.preventDefault();
      }, { passive: false });
    });

    startBtn.addEventListener("click", startGame);

    drawMap();
    drawPellets();
    drawPlayer();

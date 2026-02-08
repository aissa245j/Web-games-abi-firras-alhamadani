const canvas = document.getElementById("board");
    const ctx = canvas.getContext("2d");
    const scoreEl = document.getElementById("score");
    const bestEl = document.getElementById("best");
    const statusEl = document.getElementById("status");
    const startBtn = document.getElementById("startBtn");

    const gridSize = 20;
    const tileSize = canvas.width / gridSize;

    let snake = [];
    let direction = { x: 1, y: 0 };
    let nextDirection = { x: 1, y: 0 };
    let food = { x: 10, y: 10 };
    let score = 0;
    let best = Number(localStorage.getItem("snakeBest") || 0);
    let loopId = null;

    bestEl.textContent = best;

    function resetGame() {
      snake = [
        { x: 8, y: 10 },
        { x: 7, y: 10 },
        { x: 6, y: 10 }
      ];
      direction = { x: 1, y: 0 };
      nextDirection = { x: 1, y: 0 };
      score = 0;
      scoreEl.textContent = score;
      statusEl.textContent = "Running";
      placeFood();
    }

    function placeFood() {
      let valid = false;
      while (!valid) {
        food.x = Math.floor(Math.random() * gridSize);
        food.y = Math.floor(Math.random() * gridSize);
        valid = !snake.some(seg => seg.x === food.x && seg.y === food.y);
      }
    }

    function drawGrid() {
      ctx.strokeStyle = "#dfe6f1";
      ctx.lineWidth = 1;
      for (let i = 0; i <= gridSize; i += 1) {
        ctx.beginPath();
        ctx.moveTo(i * tileSize, 0);
        ctx.lineTo(i * tileSize, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * tileSize);
        ctx.lineTo(canvas.width, i * tileSize);
        ctx.stroke();
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGrid();

      ctx.fillStyle = "#12a36a";
      snake.forEach((seg, index) => {
        ctx.fillStyle = index === 0 ? "#0b5cd6" : "#12a36a";
        ctx.fillRect(seg.x * tileSize + 1, seg.y * tileSize + 1, tileSize - 2, tileSize - 2);
      });

      ctx.fillStyle = "#e0565b";
      ctx.fillRect(food.x * tileSize + 2, food.y * tileSize + 2, tileSize - 4, tileSize - 4);
    }

    function step() {
      direction = nextDirection;
      const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

      if (head.x < 0 || head.y < 0 || head.x >= gridSize || head.y >= gridSize) {
        endGame();
        return;
      }

      if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
        endGame();
        return;
      }

      snake.unshift(head);

      if (head.x === food.x && head.y === food.y) {
        score += 1;
        scoreEl.textContent = score;
        placeFood();
      } else {
        snake.pop();
      }

      draw();
    }

    function endGame() {
      clearInterval(loopId);
      loopId = null;
      statusEl.textContent = "Game Over";
      if (score > best) {
        best = score;
        bestEl.textContent = best;
        localStorage.setItem("snakeBest", best);
      }
    }

    function startGame() {
      if (loopId) {
        clearInterval(loopId);
        loopId = null;
      }
      resetGame();
      draw();
      loopId = setInterval(step, 120);
    }

    function setDirection(x, y) {
      if (direction.x === -x && direction.y === -y) return;
      nextDirection = { x, y };
      if (!loopId) startGame();
    }

    document.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();
      if (key === "arrowup" || key === "w") setDirection(0, -1);
      if (key === "arrowdown" || key === "s") setDirection(0, 1);
      if (key === "arrowleft" || key === "a") setDirection(-1, 0);
      if (key === "arrowright" || key === "d") setDirection(1, 0);
    });

    document.querySelectorAll(".touch-controls button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const dir = btn.dataset.dir;
        if (dir === "up") setDirection(0, -1);
        if (dir === "down") setDirection(0, 1);
        if (dir === "left") setDirection(-1, 0);
        if (dir === "right") setDirection(1, 0);
      });
      btn.addEventListener("touchstart", (event) => {
        event.preventDefault();
      }, { passive: false });
    });

    startBtn.addEventListener("click", startGame);

    draw();

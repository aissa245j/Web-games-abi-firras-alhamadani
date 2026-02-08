const canvas = document.getElementById("board");
    const ctx = canvas.getContext("2d");
    const scoreEl = document.getElementById("score");
    const livesEl = document.getElementById("lives");
    const statusEl = document.getElementById("status");
    const startBtn = document.getElementById("startBtn");

    const rows = 5;
    const cols = 8;
    const brickWidth = 56;
    const brickHeight = 16;
    const brickPadding = 8;
    const brickOffsetTop = 36;
    const brickOffsetLeft = 24;

    const itemTypes = [
      { key: "W", label: "wide", color: "#0f6ba8" },
      { key: "N", label: "narrow", color: "#e76f51" },
      { key: "S", label: "slow", color: "#2c4aa5" },
      { key: "F", label: "fast", color: "#f4b41a" },
      { key: "L", label: "life", color: "#12a36a" },
      { key: "P", label: "pierce", color: "#6f42c1" }
    ];

    let bricks = [];
    let items = [];
    let paddle = { w: 90, h: 12, x: 215, y: 330, speed: 7, dx: 0 };
    let ball = { x: 260, y: 240, r: 7, dx: 3, dy: -3, speed: 4, pierce: false, pierceUntil: 0 };
    let score = 0;
    let lives = 3;
    let running = false;
    let frameId = null;

    function resetBricks() {
      bricks = [];
      for (let c = 0; c < cols; c += 1) {
        for (let r = 0; r < rows; r += 1) {
          bricks.push({
            x: brickOffsetLeft + c * (brickWidth + brickPadding),
            y: brickOffsetTop + r * (brickHeight + brickPadding),
            status: 1
          });
        }
      }
    }

    function resetBall() {
      ball.x = canvas.width / 2;
      ball.y = canvas.height - 80;
      ball.speed = 4;
      ball.dx = 3 * (Math.random() > 0.5 ? 1 : -1);
      ball.dy = -3;
      ball.pierce = false;
      ball.pierceUntil = 0;
    }

    function resetGame() {
      score = 0;
      lives = 3;
      paddle.w = 90;
      paddle.x = (canvas.width - paddle.w) / 2;
      paddle.dx = 0;
      resetBall();
      resetBricks();
      items = [];
      scoreEl.textContent = score;
      livesEl.textContent = lives;
      statusEl.textContent = "Running";
    }

    function spawnItem(brick) {
      if (Math.random() > 0.35) return;
      const type = itemTypes[Math.floor(Math.random() * itemTypes.length)];
      items.push({
        x: brick.x + brickWidth / 2,
        y: brick.y + brickHeight / 2,
        dy: 2,
        type
      });
    }

    function drawBricks() {
      bricks.forEach((brick, index) => {
        if (!brick.status) return;
        ctx.fillStyle = index % 2 === 0 ? "#0f6ba8" : "#f4b41a";
        ctx.fillRect(brick.x, brick.y, brickWidth, brickHeight);
      });
    }

    function drawPaddle() {
      ctx.fillStyle = "#1d2433";
      ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
    }

    function drawBall() {
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
      ctx.fillStyle = ball.pierce ? "#6f42c1" : "#e0565b";
      ctx.fill();
      ctx.closePath();
    }

    function drawItems() {
      items.forEach(item => {
        ctx.fillStyle = item.type.color;
        ctx.fillRect(item.x - 10, item.y - 10, 20, 20);
        ctx.fillStyle = "#ffffff";
        ctx.font = "12px Trebuchet MS";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(item.type.key, item.x, item.y);
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBricks();
      drawPaddle();
      drawBall();
      drawItems();
    }

    function movePaddle() {
      paddle.x += paddle.dx;
      if (paddle.x < 0) paddle.x = 0;
      if (paddle.x + paddle.w > canvas.width) paddle.x = canvas.width - paddle.w;
    }

    function moveBall() {
      ball.x += ball.dx;
      ball.y += ball.dy;

      if (ball.pierce && Date.now() > ball.pierceUntil) {
        ball.pierce = false;
      }

      if (ball.x + ball.r > canvas.width || ball.x - ball.r < 0) {
        ball.dx *= -1;
      }
      if (ball.y - ball.r < 0) {
        ball.dy *= -1;
      }

      if (ball.y + ball.r > paddle.y && ball.x > paddle.x && ball.x < paddle.x + paddle.w && ball.dy > 0) {
        const hitPos = (ball.x - paddle.x) / paddle.w - 0.5;
        ball.dx = hitPos * 8;
        ball.dy = -Math.abs(ball.dy);
      }

      if (ball.y - ball.r > canvas.height) {
        lives -= 1;
        livesEl.textContent = lives;
        if (lives <= 0) {
          statusEl.textContent = "Game Over";
          running = false;
          return;
        }
        resetBall();
      }

      bricks.forEach(brick => {
        if (!brick.status) return;
        if (
          ball.x > brick.x &&
          ball.x < brick.x + brickWidth &&
          ball.y - ball.r < brick.y + brickHeight &&
          ball.y + ball.r > brick.y
        ) {
          if (!ball.pierce) ball.dy *= -1;
          brick.status = 0;
          score += 10;
          scoreEl.textContent = score;
          spawnItem(brick);
        }
      });

      if (bricks.every(brick => !brick.status)) {
        statusEl.textContent = "You win";
        running = false;
      }
    }

    function moveItems() {
      items.forEach(item => {
        item.y += item.dy;
        const caught =
          item.y + 10 > paddle.y &&
          item.x > paddle.x &&
          item.x < paddle.x + paddle.w;
        if (caught) {
          applyItem(item.type.label);
          item.caught = true;
        }
      });
      items = items.filter(item => !item.caught && item.y < canvas.height + 30);
    }

    function applyItem(type) {
      if (type === "wide") {
        paddle.w = Math.min(140, paddle.w + 30);
      }
      if (type === "narrow") {
        paddle.w = Math.max(50, paddle.w - 25);
      }
      if (type === "slow") {
        ball.dx *= 0.8;
        ball.dy *= 0.8;
      }
      if (type === "fast") {
        ball.dx *= 1.2;
        ball.dy *= 1.2;
      }
      if (type === "life") {
        lives += 1;
        livesEl.textContent = lives;
      }
      if (type === "pierce") {
        ball.pierce = true;
        ball.pierceUntil = Date.now() + 6000;
      }
    }

    function loop() {
      if (!running) return;
      movePaddle();
      moveBall();
      moveItems();
      draw();
      frameId = requestAnimationFrame(loop);
    }

    function startGame() {
      running = true;
      resetGame();
      draw();
      cancelAnimationFrame(frameId);
      loop();
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") paddle.dx = -paddle.speed;
      if (event.key === "ArrowRight") paddle.dx = paddle.speed;
    });

    document.addEventListener("keyup", (event) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") paddle.dx = 0;
    });

    canvas.addEventListener("mousemove", (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      paddle.x = x - paddle.w / 2;
      if (paddle.x < 0) paddle.x = 0;
      if (paddle.x + paddle.w > canvas.width) paddle.x = canvas.width - paddle.w;
    });

    startBtn.addEventListener("click", startGame);

    draw();

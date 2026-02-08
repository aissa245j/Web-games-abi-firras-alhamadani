const canvas = document.getElementById("board");
    const ctx = canvas.getContext("2d");
    const p1El = document.getElementById("p1");
    const p2El = document.getElementById("p2");
    const statusEl = document.getElementById("status");
    const startBtn = document.getElementById("startBtn");

    let p1 = { x: 20, y: 120, w: 10, h: 60, dy: 0 };
    let p2 = { x: 490, y: 120, w: 10, h: 60, dy: 0 };
    let ball = { x: 260, y: 160, r: 7, dx: 3, dy: 2 };
    let score1 = 0;
    let score2 = 0;
    let running = false;
    let frameId = null;

    function resetBall(dir) {
      ball.x = canvas.width / 2;
      ball.y = canvas.height / 2;
      ball.dx = dir * (3 + Math.random());
      ball.dy = (Math.random() * 3) - 1.5;
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#1d2433";
      ctx.fillRect(p1.x, p1.y, p1.w, p1.h);
      ctx.fillRect(p2.x, p2.y, p2.w, p2.h);
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
      ctx.fill();
    }

    function update() {
      if (!running) return;

      p1.y += p1.dy;
      if (p1.y < 0) p1.y = 0;
      if (p1.y + p1.h > canvas.height) p1.y = canvas.height - p1.h;

      const target = ball.y - p2.h / 2;
      p2.y += (target - p2.y) * 0.08;
      if (p2.y < 0) p2.y = 0;
      if (p2.y + p2.h > canvas.height) p2.y = canvas.height - p2.h;

      ball.x += ball.dx;
      ball.y += ball.dy;

      if (ball.y - ball.r < 0 || ball.y + ball.r > canvas.height) ball.dy *= -1;

      if (ball.x - ball.r < p1.x + p1.w && ball.y > p1.y && ball.y < p1.y + p1.h) {
        ball.dx *= -1;
      }
      if (ball.x + ball.r > p2.x && ball.y > p2.y && ball.y < p2.y + p2.h) {
        ball.dx *= -1;
      }

      if (ball.x < 0) {
        score2 += 1; p2El.textContent = score2; resetBall(1);
      }
      if (ball.x > canvas.width) {
        score1 += 1; p1El.textContent = score1; resetBall(-1);
      }

      if (score1 >= 7 || score2 >= 7) {
        statusEl.textContent = score1 >= 7 ? "You win" : "AI wins";
        running = false;
      }

      draw();
      frameId = requestAnimationFrame(update);
    }

    function startGame() {
      score1 = 0; score2 = 0;
      p1El.textContent = score1; p2El.textContent = score2;
      statusEl.textContent = "Running";
      p1.y = 120; p2.y = 120;
      resetBall(Math.random() > 0.5 ? 1 : -1);
      running = true;
      cancelAnimationFrame(frameId);
      update();
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "ArrowUp" || event.key.toLowerCase() === "w") p1.dy = -4;
      if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") p1.dy = 4;
    });

    document.addEventListener("keyup", (event) => {
      if (["ArrowUp","ArrowDown","w","s","W","S"].includes(event.key)) p1.dy = 0;
    });

    startBtn.addEventListener("click", startGame);
    draw();

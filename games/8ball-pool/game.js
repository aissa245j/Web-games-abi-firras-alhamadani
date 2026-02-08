const canvas = document.getElementById("table");
    const ctx = canvas.getContext("2d");
    const scoreEl = document.getElementById("score");
    const shotsEl = document.getElementById("shots");
    const statusEl = document.getElementById("status");
    const resetBtn = document.getElementById("resetBtn");

    const table = { x: 30, y: 30, w: 660, h: 300 };
    const pockets = [
      { x: table.x, y: table.y },
      { x: table.x + table.w / 2, y: table.y - 4 },
      { x: table.x + table.w, y: table.y },
      { x: table.x, y: table.y + table.h },
      { x: table.x + table.w / 2, y: table.y + table.h + 4 },
      { x: table.x + table.w, y: table.y + table.h }
    ];

    const ballRadius = 9;
    let balls = [];
    let cueBall = null;
    let dragging = false;
    let dragStart = null;
    let score = 0;
    let shots = 0;
    let animationId = null;

    function createRack() {
      balls = [];
      const colors = [
        "#f4b41a", "#e76f51", "#2c4aa5", "#12a36a", "#0f6ba8",
        "#6f42c1", "#ff6b6b", "#f4b41a", "#e76f51", "#2c4aa5",
        "#12a36a", "#0f6ba8", "#6f42c1", "#ff6b6b", "#1d2433"
      ];

      const startX = table.x + table.w - 140;
      const startY = table.y + table.h / 2;
      let idx = 0;
      for (let row = 0; row < 5; row += 1) {
        for (let col = 0; col <= row; col += 1) {
          balls.push({
            x: startX + row * (ballRadius * 2 + 1),
            y: startY - row * ballRadius + col * (ballRadius * 2 + 1),
            vx: 0,
            vy: 0,
            color: colors[idx % colors.length],
            alive: true
          });
          idx += 1;
        }
      }

      cueBall = {
        x: table.x + 140,
        y: table.y + table.h / 2,
        vx: 0,
        vy: 0,
        color: "#ffffff",
        alive: true
      };
    }

    function drawTable() {
      ctx.fillStyle = "#234a36";
      ctx.fillRect(table.x - 10, table.y - 10, table.w + 20, table.h + 20);
      ctx.fillStyle = "#2f6b4f";
      ctx.fillRect(table.x, table.y, table.w, table.h);
      pockets.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
        ctx.fillStyle = "#111111";
        ctx.fill();
      });
    }

    function drawBalls() {
      [...balls, cueBall].forEach(ball => {
        if (!ball.alive) return;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.fill();
        ctx.strokeStyle = "#111";
        ctx.stroke();
      });
    }

    function drawAimLine() {
      if (!dragging || !cueBall) return;
      ctx.strokeStyle = "#ffffff";
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(cueBall.x, cueBall.y);
      ctx.lineTo(dragStart.x, dragStart.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    function updatePhysics() {
      const ballsAll = [cueBall, ...balls];
      ballsAll.forEach(ball => {
        if (!ball.alive) return;
        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.vx *= 0.985;
        ball.vy *= 0.985;
        if (Math.abs(ball.vx) < 0.02) ball.vx = 0;
        if (Math.abs(ball.vy) < 0.02) ball.vy = 0;

        if (ball.x - ballRadius < table.x || ball.x + ballRadius > table.x + table.w) {
          ball.vx *= -1;
        }
        if (ball.y - ballRadius < table.y || ball.y + ballRadius > table.y + table.h) {
          ball.vy *= -1;
        }
      });

      for (let i = 0; i < ballsAll.length; i += 1) {
        for (let j = i + 1; j < ballsAll.length; j += 1) {
          const a = ballsAll[i];
          const b = ballsAll[j];
          if (!a.alive || !b.alive) continue;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 0 && dist < ballRadius * 2) {
            const nx = dx / dist;
            const ny = dy / dist;
            const p = 2 * (a.vx * nx + a.vy * ny - b.vx * nx - b.vy * ny) / 2;
            a.vx -= p * nx;
            a.vy -= p * ny;
            b.vx += p * nx;
            b.vy += p * ny;
            const overlap = ballRadius * 2 - dist;
            a.x -= nx * overlap / 2;
            a.y -= ny * overlap / 2;
            b.x += nx * overlap / 2;
            b.y += ny * overlap / 2;
          }
        }
      }

      ballsAll.forEach(ball => {
        pockets.forEach(p => {
          if (!ball.alive) return;
          const dist = Math.hypot(ball.x - p.x, ball.y - p.y);
          if (dist < 12) {
            if (ball === cueBall) {
              cueBall.x = table.x + 140;
              cueBall.y = table.y + table.h / 2;
              cueBall.vx = 0;
              cueBall.vy = 0;
              statusEl.textContent = "Cue scratched";
            } else {
              ball.alive = false;
              score += 10;
              scoreEl.textContent = score;
            }
          }
        });
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawTable();
      drawBalls();
      drawAimLine();
    }

    function allStopped() {
      return [cueBall, ...balls].every(ball => Math.abs(ball.vx) < 0.01 && Math.abs(ball.vy) < 0.01);
    }

    function loop() {
      updatePhysics();
      draw();
      if (!allStopped()) {
        animationId = requestAnimationFrame(loop);
      } else {
        statusEl.textContent = "Ready";
      }
    }

    function shoot(power, angle) {
      cueBall.vx = Math.cos(angle) * power;
      cueBall.vy = Math.sin(angle) * power;
      shots += 1;
      shotsEl.textContent = shots;
      statusEl.textContent = "Shot";
      cancelAnimationFrame(animationId);
      loop();
    }

    function handlePointerDown(event) {
      if (!allStopped()) return;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const dist = Math.hypot(x - cueBall.x, y - cueBall.y);
      if (dist <= ballRadius + 6) {
        dragging = true;
        dragStart = { x, y };
      }
    }

    function handlePointerMove(event) {
      if (!dragging) return;
      const rect = canvas.getBoundingClientRect();
      dragStart = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      draw();
    }

    function handlePointerUp(event) {
      if (!dragging) return;
      dragging = false;
      const rect = canvas.getBoundingClientRect();
      const end = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      const dx = cueBall.x - end.x;
      const dy = cueBall.y - end.y;
      const power = Math.min(12, Math.hypot(dx, dy) / 8);
      if (power > 0.4) {
        const angle = Math.atan2(dy, dx);
        shoot(power, angle);
      }
      draw();
    }

    function resetGame() {
      score = 0;
      shots = 0;
      scoreEl.textContent = score;
      shotsEl.textContent = shots;
      statusEl.textContent = "Ready";
      createRack();
      draw();
    }

    canvas.addEventListener("mousedown", handlePointerDown);
    canvas.addEventListener("mousemove", handlePointerMove);
    canvas.addEventListener("mouseup", handlePointerUp);

    canvas.addEventListener("touchstart", (event) => {
      event.preventDefault();
      handlePointerDown(event.touches[0]);
    }, { passive: false });
    canvas.addEventListener("touchmove", (event) => {
      event.preventDefault();
      handlePointerMove(event.touches[0]);
    }, { passive: false });
    canvas.addEventListener("touchend", (event) => {
      event.preventDefault();
      handlePointerUp(event.changedTouches[0]);
    }, { passive: false });

    resetBtn.addEventListener("click", resetGame);

    createRack();
    draw();

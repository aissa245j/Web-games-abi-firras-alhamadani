const boardEl = document.getElementById("board");
    const modeEl = document.getElementById("mode");
    const turnEl = document.getElementById("turn");
    const statusEl = document.getElementById("status");
    const toggleBtn = document.getElementById("toggle");
    const restartBtn = document.getElementById("restart");

    let board = Array(9).fill("");
    let player = "X";
    let vsAi = true;
    let gameOver = false;

    const wins = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];

    function render() {
      boardEl.innerHTML = "";
      board.forEach((value, index) => {
        const cell = document.createElement("div");
        cell.className = "cell" + (value === "O" ? " o" : "");
        cell.textContent = value;
        cell.addEventListener("click", () => handleMove(index));
        boardEl.appendChild(cell);
      });
      turnEl.textContent = player;
    }

    function checkWinner(current) {
      return wins.some(pattern => pattern.every(i => board[i] === current));
    }

    function checkDraw() {
      return board.every(cell => cell !== "");
    }

    function handleMove(index) {
      if (gameOver || board[index]) return;
      board[index] = player;
      if (checkWinner(player)) {
        statusEl.textContent = player + " wins";
        gameOver = true;
        render();
        return;
      }
      if (checkDraw()) {
        statusEl.textContent = "Draw";
        gameOver = true;
        render();
        return;
      }
      player = player === "X" ? "O" : "X";
      statusEl.textContent = "Running";
      render();
      if (vsAi && player === "O") {
        setTimeout(aiMove, 300);
      }
    }

    function aiMove() {
      if (gameOver) return;
      const move = findBestMove();
      handleMove(move);
    }

    function findBestMove() {
      for (let i = 0; i < 9; i += 1) {
        if (board[i] === "") {
          board[i] = "O";
          if (checkWinner("O")) { board[i] = ""; return i; }
          board[i] = "";
        }
      }
      for (let i = 0; i < 9; i += 1) {
        if (board[i] === "") {
          board[i] = "X";
          if (checkWinner("X")) { board[i] = ""; return i; }
          board[i] = "";
        }
      }
      const priority = [4,0,2,6,8,1,3,5,7];
      return priority.find(i => board[i] === "");
    }

    function restart() {
      board = Array(9).fill("");
      player = "X";
      gameOver = false;
      statusEl.textContent = "Ready";
      render();
      if (vsAi && player === "O") {
        setTimeout(aiMove, 300);
      }
    }

    toggleBtn.addEventListener("click", () => {
      vsAi = !vsAi;
      modeEl.textContent = vsAi ? "Vs AI" : "2 Players";
      restart();
    });

    restartBtn.addEventListener("click", restart);

    render();

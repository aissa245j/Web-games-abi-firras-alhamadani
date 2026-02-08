const boardEl = document.getElementById("board");
    const movesEl = document.getElementById("moves");
    const matchesEl = document.getElementById("matches");
    const statusEl = document.getElementById("status");
    const restartBtn = document.getElementById("restart");

    const icons = ["★","◆","■","▲","●","✿","✚","✦"];
    let cards = [];
    let first = null;
    let second = null;
    let lock = false;
    let moves = 0;
    let matches = 0;

    function shuffle(arr) {
      for (let i = arr.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }

    function setup() {
      const pool = shuffle([...icons, ...icons]);
      cards = pool.map((icon, index) => ({ id: index, icon, revealed: false, matched: false }));
      moves = 0;
      matches = 0;
      first = null;
      second = null;
      lock = false;
      movesEl.textContent = moves;
      matchesEl.textContent = matches;
      statusEl.textContent = "Running";
      render();
    }

    function render() {
      boardEl.innerHTML = "";
      cards.forEach(card => {
        const el = document.createElement("button");
        el.className = "card" + (card.revealed || card.matched ? " revealed" : "");
        el.textContent = card.revealed || card.matched ? card.icon : "?";
        el.addEventListener("click", () => flip(card.id));
        boardEl.appendChild(el);
      });
    }

    function flip(id) {
      if (lock) return;
      const card = cards.find(c => c.id === id);
      if (card.revealed || card.matched) return;

      card.revealed = true;
      if (!first) {
        first = card;
      } else if (!second) {
        second = card;
        moves += 1;
        movesEl.textContent = moves;
        checkMatch();
      }
      render();
    }

    function checkMatch() {
      if (!first || !second) return;
      if (first.icon === second.icon) {
        first.matched = true;
        second.matched = true;
        matches += 1;
        matchesEl.textContent = matches;
        first = null;
        second = null;
        if (matches === icons.length) {
          statusEl.textContent = "You win";
        }
      } else {
        lock = true;
        setTimeout(() => {
          first.revealed = false;
          second.revealed = false;
          first = null;
          second = null;
          lock = false;
          render();
        }, 700);
      }
    }

    restartBtn.addEventListener("click", setup);
    setup();

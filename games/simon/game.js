const pads = Array.from(document.querySelectorAll(".pad"));
    const roundEl = document.getElementById("round");
    const statusEl = document.getElementById("status");
    const startBtn = document.getElementById("start");

    let sequence = [];
    let inputIndex = 0;
    let playing = false;

    function flashPad(id) {
      const pad = pads[id];
      pad.classList.add("active");
      setTimeout(() => pad.classList.remove("active"), 350);
    }

    function playSequence() {
      playing = true;
      statusEl.textContent = "Watch";
      let i = 0;
      const timer = setInterval(() => {
        flashPad(sequence[i]);
        i += 1;
        if (i >= sequence.length) {
          clearInterval(timer);
          setTimeout(() => {
            playing = false;
            statusEl.textContent = "Your turn";
          }, 300);
        }
      }, 600);
    }

    function startGame() {
      sequence = [];
      inputIndex = 0;
      nextRound();
    }

    function nextRound() {
      sequence.push(Math.floor(Math.random() * 4));
      inputIndex = 0;
      roundEl.textContent = sequence.length;
      playSequence();
    }

    function handleInput(id) {
      if (playing || !sequence.length) return;
      flashPad(id);
      if (sequence[inputIndex] !== id) {
        statusEl.textContent = "Wrong";
        return;
      }
      inputIndex += 1;
      if (inputIndex >= sequence.length) {
        statusEl.textContent = "Good";
        setTimeout(nextRound, 700);
      }
    }

    pads.forEach(pad => pad.addEventListener("click", () => handleInput(Number(pad.dataset.id))));
    startBtn.addEventListener("click", startGame);

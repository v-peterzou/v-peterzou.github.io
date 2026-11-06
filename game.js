class BlockGame {
  constructor() {
    this.shapes = [
      [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
      [[2, 0, 0], [2, 2, 2], [0, 0, 0]],
      [[0, 0, 3], [3, 3, 3], [0, 0, 0]],
      [[4, 4], [4, 4]],
      [[0, 5, 5], [5, 5, 0], [0, 0, 0]],
      [[0, 6, 0], [6, 6, 6], [0, 0, 0]],
      [[7, 7, 0], [0, 7, 7], [0, 0, 0]],
    ];
    this.reset();
    this.state = "ready";
  }

  reset() {
    this.board = Array.from({ length: 20 }, () => Array(10).fill(0));
    this.score = 0;
    this.lines = 0;
    this.bag = [];
    this.state = "running";
    this.next = this.takePiece();
    this.spawn();
  }

  get level() {
    return Math.floor(this.lines / 10) + 1;
  }

  get interval() {
    return Math.max(100, 800 - (this.level - 1) * 60);
  }

  takePiece() {
    if (!this.bag.length) {
      this.bag = [0, 1, 2, 3, 4, 5, 6];
      for (let i = this.bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
      }
    }
    return this.shapes[this.bag.pop()].map((row) => [...row]);
  }

  spawn() {
    this.piece = this.next;
    this.next = this.takePiece();
    this.x = Math.floor((10 - this.piece.length) / 2);
    this.y = 0;
    if (!this.fits(this.piece, this.x, this.y)) {
      this.state = "over";
    }
  }

  fits(piece, x, y) {
    return piece.every((row, dy) => row.every((value, dx) =>
      !value || (x + dx >= 0 && x + dx < 10 && y + dy >= 0 &&
        y + dy < 20 && !this.board[y + dy][x + dx]),
    ));
  }

  move(dx) {
    if (this.state === "running" && this.fits(this.piece, this.x + dx, this.y)) {
      this.x += dx;
    }
  }

  rotate() {
    if (this.state !== "running") return;
    const rotated = this.piece[0].map((_, x) =>
      this.piece.map((row) => row[x]).reverse(),
    );
    // Small horizontal kicks allow rotation beside a wall or another piece.
    for (const offset of [0, -1, 1, -2, 2]) {
      if (this.fits(rotated, this.x + offset, this.y)) {
        this.piece = rotated;
        this.x += offset;
        return;
      }
    }
  }

  down(soft = false) {
    if (this.state !== "running") return;
    if (this.fits(this.piece, this.x, this.y + 1)) {
      this.y++;
      if (soft) this.score++;
    } else {
      this.lock();
    }
  }

  drop() {
    if (this.state !== "running") return;
    while (this.fits(this.piece, this.x, this.y + 1)) {
      this.y++;
      this.score += 2;
    }
    this.lock();
  }

  lock() {
    this.piece.forEach((row, dy) => row.forEach((value, dx) => {
      if (value) this.board[this.y + dy][this.x + dx] = value;
    }));
    const remaining = this.board.filter((row) => row.some((value) => !value));
    const cleared = 20 - remaining.length;
    this.score += [0, 100, 300, 500, 800][cleared] * this.level;
    this.lines += cleared;
    this.board = [
      ...Array.from({ length: cleared }, () => Array(10).fill(0)),
      ...remaining,
    ];
    this.spawn();
  }
}

function setupBlockGame(widget) {
  const canvas = widget.querySelector("#game-board");
  const preview = widget.querySelector("#game-next");
  const context = canvas.getContext("2d");
  const previewContext = preview.getContext("2d");
  const start = widget.querySelector("#game-start");
  const pause = widget.querySelector("#game-pause");
  const status = widget.querySelector("#game-status");
  const controls = widget.querySelectorAll("[data-game-action]");

  if (!context || !previewContext) {
    status.textContent = "Your browser does not support this game’s canvas rendering.";
    start.disabled = true;
    controls.forEach((button) => { button.disabled = true; });
    return;
  }

  const game = new BlockGame();
  const colors = ["", "#8ad5d9", "#92a9ed", "#edb77a", "#e9da88", "#c4f06a", "#c3a0e3", "#e9a0a0"];
  let frame = 0;
  let lastTime = 0;
  let elapsed = 0;

  const paintCell = (ctx, x, y, value, size, ghost = false) => {
    ctx.fillStyle = ghost ? "#424b35" : colors[value];
    ctx.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
    if (ghost) {
      ctx.strokeStyle = colors[value];
      ctx.strokeRect(x * size + 2, y * size + 2, size - 4, size - 4);
    }
  };

  const paintPiece = (ctx, piece, x, y, size, ghost = false) => {
    piece.forEach((row, dy) => row.forEach((value, dx) => {
      if (value) paintCell(ctx, x + dx, y + dy, value, size, ghost);
    }));
  };

  const render = () => {
    context.fillStyle = "#191a17";
    context.fillRect(0, 0, 300, 600);
    context.strokeStyle = "#292b25";
    for (let x = 0; x <= 10; x++) {
      context.beginPath();
      context.moveTo(x * 30, 0);
      context.lineTo(x * 30, 600);
      context.stroke();
    }
    for (let y = 0; y <= 20; y++) {
      context.beginPath();
      context.moveTo(0, y * 30);
      context.lineTo(300, y * 30);
      context.stroke();
    }
    paintPiece(context, game.board, 0, 0, 30);
    if (game.state === "running" || game.state === "paused") {
      let ghostY = game.y;
      while (game.fits(game.piece, game.x, ghostY + 1)) ghostY++;
      paintPiece(context, game.piece, game.x, ghostY, 30, true);
      paintPiece(context, game.piece, game.x, game.y, 30);
    }
    previewContext.fillStyle = "#191a17";
    previewContext.fillRect(0, 0, 120, 120);
    paintPiece(previewContext, game.next, (4 - game.next.length) / 2, 0.5, 30);
    const names = ["", "I", "J", "L", "O", "S", "T", "Z"];
    preview.setAttribute("aria-label", `Next piece: ${names[game.next.flat().find(Boolean)]}`);
    widget.querySelector("#game-score").textContent = game.score;
    widget.querySelector("#game-lines").textContent = game.lines;
    widget.querySelector("#game-level").textContent = game.level;
    pause.disabled = game.state === "ready" || game.state === "over";
    pause.textContent = game.state === "paused" ? "Resume" : "Pause";
    start.textContent = game.state === "ready" ? "Start game" : "Restart";
    controls.forEach((button) => { button.disabled = game.state !== "running"; });
    const messages = {
      ready: "Ready when you are.",
      running: "Let’s play. Clear full rows to score.",
      paused: "Paused. Resume whenever you’re ready.",
      over: `Game over. Final score: ${game.score}. Start again?`,
    };
    if (status.textContent !== messages[game.state]) status.textContent = messages[game.state];
    if (game.state !== "running") {
      context.fillStyle = "rgba(25, 26, 23, 0.78)";
      context.fillRect(0, 0, 300, 600);
      context.fillStyle = "#f5f5f2";
      context.font = "600 24px sans-serif";
      context.textAlign = "center";
      context.fillText({ ready: "Ready to play?", paused: "Paused", over: "Game over" }[game.state], 150, 290);
    }
  };

  const tick = (time) => {
    if (game.state !== "running") return;
    elapsed += Math.min(time - lastTime, 100);
    lastTime = time;
    if (elapsed >= game.interval) {
      elapsed = 0;
      game.down();
      render();
    }
    if (game.state === "running") frame = requestAnimationFrame(tick);
  };

  const run = () => {
    cancelAnimationFrame(frame);
    lastTime = performance.now();
    elapsed = 0;
    frame = requestAnimationFrame(tick);
  };

  const setPaused = () => {
    if (game.state !== "running") return;
    game.state = "paused";
    cancelAnimationFrame(frame);
    render();
  };

  const togglePause = () => {
    if (game.state === "running") {
      setPaused();
    } else if (game.state === "paused") {
      game.state = "running";
      canvas.focus({ preventScroll: true });
      run();
      render();
    }
  };

  const act = (action) => {
    if (game.state !== "running") return;
    if (action === "left") game.move(-1);
    if (action === "right") game.move(1);
    if (action === "rotate") game.rotate();
    if (action === "down") game.down(true);
    if (action === "drop") {
      game.drop();
      elapsed = 0;
    }
    render();
  };

  start.addEventListener("click", () => {
    game.reset();
    canvas.focus({ preventScroll: true });
    run();
    render();
  });
  pause.addEventListener("click", togglePause);
  controls.forEach((button) => button.addEventListener("click", () => {
    canvas.focus({ preventScroll: true });
    act(button.dataset.gameAction);
  }));
  canvas.addEventListener("keydown", (event) => {
    if (event.ctrlKey || event.altKey || event.metaKey) return;
    const actions = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "rotate", ArrowDown: "down", " ": "drop" };
    if (event.key.toLowerCase() === "p") {
      event.preventDefault();
      if (!event.repeat) togglePause();
    } else if (actions[event.key] && game.state === "running") {
      event.preventDefault();
      if (!event.repeat || !["drop", "rotate"].includes(actions[event.key])) act(actions[event.key]);
    }
  });
  widget.addEventListener("focusout", (event) => {
    if (!widget.contains(event.relatedTarget)) setPaused();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) setPaused();
  });
  window.addEventListener("blur", setPaused);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) setPaused();
    }).observe(canvas);
  }
  render();
}

if (typeof document !== "undefined") {
  const gameWidget = document.querySelector(".game-widget");
  if (gameWidget) setupBlockGame(gameWidget);
}

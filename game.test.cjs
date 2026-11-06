const { readFileSync } = require("node:fs");
const { runInNewContext } = require("node:vm");
const assert = require("node:assert/strict");
const test = require("node:test");

const BlockGame = runInNewContext(`${readFileSync(`${__dirname}/game.js`, "utf8")}\nBlockGame;`);

test("starts ready, resets a clean board, and uses all seven pieces per bag", () => {
  const game = new BlockGame();
  assert.equal(game.state, "ready");
  game.reset();
  assert.equal(game.board.length, 20);
  assert.ok(game.board.every((row) => row.length === 10 && row.every((cell) => cell === 0)));
  const types = [game.piece, game.next];
  for (let i = 0; i < 5; i++) types.push(game.takePiece());
  assert.equal(new Set(types.map((piece) => piece.flat().find(Boolean))).size, 7);
  assert.equal(game.state, "running");
});

test("movement, rotation, and drops cannot cross board boundaries", () => {
  const game = new BlockGame();
  game.reset();
  for (let i = 0; i < 20; i++) game.move(-1);
  assert.ok(game.fits(game.piece, game.x, game.y));
  assert.equal(game.fits(game.piece, game.x - 1, game.y), false);
  game.rotate();
  assert.ok(game.fits(game.piece, game.x, game.y));
  for (let i = 0; i < 20; i++) game.move(1);
  assert.equal(game.fits(game.piece, game.x + 1, game.y), false);
  game.drop();
  assert.ok(game.score > 0);
  assert.equal(game.board.flat().filter(Boolean).length, 4);
});

test("clears four rows, scores at the previous level, and increases speed", () => {
  const game = new BlockGame();
  game.reset();
  game.lines = 9;
  for (let y = 16; y < 20; y++) game.board[y] = Array(10).fill(2);
  for (let y = 16; y < 20; y++) game.board[y][0] = 0;
  game.piece = [[1], [1], [1], [1]];
  game.x = 0;
  game.y = 16;
  game.drop();
  assert.equal(game.lines, 13);
  assert.equal(game.score, 800);
  assert.equal(game.level, 2);
  assert.equal(game.interval, 740);
  assert.equal(game.board.flat().filter(Boolean).length, 0);
});

test("blocked spawn ends the game; pause and game over prevent input", () => {
  const game = new BlockGame();
  game.reset();
  game.board[0].fill(1);
  game.board[1].fill(1);
  game.spawn();
  assert.equal(game.state, "over");
  for (const state of ["over", "paused"]) {
    game.state = state;
    const before = JSON.stringify([game.board, game.piece, game.x, game.y, game.score]);
    game.move(1);
    game.rotate();
    game.down(true);
    game.drop();
    assert.equal(JSON.stringify([game.board, game.piece, game.x, game.y, game.score]), before);
  }
  game.reset();
  assert.equal(game.state, "running");
  assert.equal(game.score, 0);
  assert.equal(game.lines, 0);
});

test("soft drops score one point and occupied cells reject movement", () => {
  const game = new BlockGame();
  game.reset();
  game.piece = [[4, 4], [4, 4]];
  game.x = 4;
  game.y = 0;
  game.board[0][6] = 1;
  game.move(1);
  assert.equal(game.x, 4);
  game.down(true);
  assert.equal(game.score, 1);
  assert.equal(game.y, 1);
});

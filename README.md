# Peter Zou — Personal site

The source for [v-peterzou.github.io](https://v-peterzou.github.io), a responsive personal site built with plain HTML, CSS, and JavaScript.

## Local preview

Open `index.html` in a browser, or serve this directory with any static file server.

## Publishing

This repository is named for GitHub Pages. In **Settings → Pages**, select **Deploy from a branch**, then choose `main` and `/ (root)` if Pages is not already enabled.

The page uses no build step or runtime dependencies. Update `index.html` to personalize the copy and links.

## Game widget

The Play section includes an original Tetris-style falling-block game with a
10-by-20 board, seven-piece shuffled bags, a next-piece preview, a landing ghost,
line-clear scoring, and increasing speed every ten lines.

Click **Start game** and use the arrow keys to move/rotate, Space to drop, and P
to pause. On-screen buttons also work on touch devices. Keyboard controls are
scoped to the focused board; leaving the widget or hiding the tab pauses play.
Scores reset when restarting and are not stored or sent anywhere.

Run the game logic checks with `node --test game.test.cjs`.

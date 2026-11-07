# Peter Zou — Personal site

The source for [v-peterzou.github.io](https://v-peterzou.github.io), a responsive personal site built with plain HTML, CSS, and JavaScript.

## Local preview

Open `index.html` in a browser, or serve this directory with any static file server.

## Publishing

This repository is named for GitHub Pages. In **Settings → Pages**, select **Deploy from a branch**, then choose `main` and `/ (root)` if Pages is not already enabled.

The page uses no build step or runtime dependencies. Update `index.html` to personalize the copy and links.

## AI Learning

`ai-learning.html` is a separate page linked from the shared Home / AI Learning
navigation. It includes a four-stage roadmap, links to official Python, Google,
PyTorch, and Hugging Face learning resources, and suggested practice projects.
Edit that file to update the roadmap and resource links. Both pages share
`styles.css` and `script.js`; the game script loads only on the homepage.

## Game showcase and widget

The Play section uses an original, storefront-inspired showcase and CSS artwork
to introduce an original Tetris-style falling-block game. The game has a 10-by-20
board, seven-piece shuffled bags, a next-piece preview, a landing ghost,
line-clear scoring, and increasing speed every ten lines. It is an unofficial
browser tribute and does not use PlayStation Store artwork or assets.

Click **Start game** and use the arrow keys to move/rotate, Space to drop, and P
to pause. On-screen buttons also work on touch devices. Keyboard controls are
scoped to the focused board; leaving the widget or hiding the tab pauses play.
Scores reset when restarting and are not stored or sent anywhere.

Run the game logic checks with `node --test game.test.cjs`.

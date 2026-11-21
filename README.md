# Mata Jeli — Cari Perbedaan

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/sengajabgttt/best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/sengajabgttt/best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

A spot-the-difference game for the make.fun bounty
`best-spot-the-difference-game-20261121-0451`.

Two near-identical pictures side by side. Find all 7 differences before the
time runs out. Three hand-drawn scenes, each harder than the last:

1. **Taman Pagi** — a morning garden (3 minutes, 3 hints)
2. **Pantai Senja** — a sunset beach (2.5 minutes, 3 hints)
3. **Pasar Malam** — a night market (2 minutes, 2 hints)

## How to play

- Click a difference on either picture. A gold ring and check mark it, and
  the counter moves.
- A wrong click costs 5 seconds.
- **Hint (H)** pulses a ring around one difference you haven't found yet.
- **P** pauses, **R** restarts the level, **M** toggles sound.
- Finish a level to earn a time bonus; find all 7 in all 3 levels to win.

## Art & sound

Every picture is drawn in code with the canvas 2D API (`game/src/elements.js`
and `game/src/scenes.js`) — no image files, no downloads. Sounds are
synthesized with WebAudio (`game/src/sound.js`).

## Run it

Serve `game/` with any static server and open `index.html` in desktop
Chrome. It plays fully offline: every file it loads lives under `game/`.

## Files

- `game/index.html` — page, HUD, panels, overlays
- `game/styles.css` — warm paper-and-ink styling
- `game/src/main.js` — boots the game
- `game/src/game.js` — state, clicks, markers, timer, hints, score
- `game/src/levels.js` — the three levels and their seven differences each
- `game/src/scenes.js` — the three procedural scenes (each drawn twice:
  plain, and with the level's differences applied)
- `game/src/elements.js` — reusable canvas drawing helpers
- `game/src/sound.js` — synthesized WebAudio sounds
- `main.ts` — copies `game/` and `screenshots/` to `/output` and writes
  `dossier.json` with the vendored make.fun library
- `screenshots/` — real renders of the game running in a browser

## License

MIT — see `LICENSE`.

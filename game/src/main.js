// main.js — boots Mata Jeli and exposes a small handle for play-testing:
// window.__game carries the live SpotGame (state, level, found count, score).

import { SpotGame } from './game.js';

const game = new SpotGame();
window.__game = game;

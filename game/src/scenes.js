// scenes.js — three hand-built scenes, each drawn twice: once plain (panel A)
// and once with the level's mods applied (panel B). A difference is one mod:
// the same draw call, changed. Nothing is random, so both panels always match
// except for exactly the seven differences.

import {
  circle, ellipse, rr, poly, line,
  drawSun, drawCloud, drawMoon, drawStar4,
  drawTree, drawFlower, drawBird, drawButterfly,
  drawPalm, drawUmbrella, drawBoat, drawStarfish, drawBucket, drawGull,
  drawHouse, drawStall, drawLantern, drawCat, drawBike, drawStringLights,
} from './elements.js';

function skyGradient(ctx, stops) {
  const g = ctx.createLinearGradient(0, 0, 0, 420);
  for (const [at, color] of stops) g.addColorStop(at, color);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 640, 420);
}

function grassTuft(ctx, x, y, s) {
  line(ctx, x - 6 * s, y, x - 8 * s, y - 10 * s, '#3f8a3a', 2);
  line(ctx, x, y, x, y - 12 * s, '#3f8a3a', 2);
  line(ctx, x + 6 * s, y, x + 8 * s, y - 10 * s, '#3f8a3a', 2);
}

// --- Level 1: Taman Pagi (morning garden) --------------------------------
// mods: { sunRays, cloud2, roof, flowers, bird, apples, butterfly }
export function drawGarden(ctx, m = {}) {
  const mods = {
    sunRays: true, cloud2: true, roof: '#d64541', flowers: 5,
    bird: true, apples: 3, butterfly: '#ff8c42', ...m,
  };
  skyGradient(ctx, [[0, '#a8dcff'], [0.6, '#dff3ff'], [1, '#eafaff']]);
  drawSun(ctx, 90, 70, 32, { rays: mods.sunRays });
  drawCloud(ctx, 210, 55, 1);
  if (mods.cloud2) drawCloud(ctx, 450, 48, 0.9);
  // rolling hills
  ellipse(ctx, 150, 480, 380, 110, '#8fce6e');
  ellipse(ctx, 520, 490, 360, 100, '#6ab85e');
  // path from the house door
  ellipse(ctx, 475, 400, 90, 26, '#f2e3c2');
  // house
  drawHouse(ctx, 400, 215, 150, 105, mods.roof);
  // tree with apples
  drawTree(ctx, 120, 300, 1, mods.apples);
  // picket fence
  line(ctx, 20, 348, 330, 348, '#a9805a', 4);
  for (let x = 24; x <= 326; x += 22) {
    rr(ctx, x, 330, 8, 26, 2, '#e8d9b8');
  }
  // flowers
  const flowerSpots = [
    [70, 360, '#ff6b9d'], [180, 375, '#ffcf3d'], [300, 365, '#9b7ede'],
    [470, 375, '#ff6b9d'], [560, 360, '#ff8c42'],
  ];
  flowerSpots.slice(0, mods.flowers).forEach(([x, y, c]) => drawFlower(ctx, x, y, 1, c));
  if (mods.bird) drawBird(ctx, 330, 115, 1);
  drawButterfly(ctx, 530, 180, 1, mods.butterfly);
  grassTuft(ctx, 60, 400, 1);
  grassTuft(ctx, 350, 405, 1);
  grassTuft(ctx, 600, 395, 1);
}

// --- Level 2: Pantai Senja (sunset beach) ---------------------------------
// mods: { boat, umbrella, coconuts, starfishMoved, gulls, bucket, reflection }
export function drawBeach(ctx, m = {}) {
  const mods = {
    boat: true, umbrella: ['#e23b3b', '#ffffff'], coconuts: 3,
    starfishMoved: false, gulls: 3, bucket: '#3d8bfd', reflection: true, ...m,
  };
  skyGradient(ctx, [[0, '#ffb347'], [0.55, '#ff8a5c'], [1, '#ff7e5f']]);
  // low sun with a warm glow
  circle(ctx, 510, 110, 58, 'rgba(255, 190, 90, 0.35)');
  drawSun(ctx, 510, 110, 38, { rays: false, face: false, color: '#ff9e3d' });
  // sea
  const sea = ctx.createLinearGradient(0, 200, 0, 300);
  sea.addColorStop(0, '#2a9d8f');
  sea.addColorStop(1, '#1d7a8c');
  ctx.fillStyle = sea;
  ctx.fillRect(0, 200, 640, 100);
  // sun shimmer on the water
  if (mods.reflection) {
    ctx.fillStyle = 'rgba(255, 205, 110, 0.85)';
    [214, 232, 252, 272].forEach((y, i) => {
      const w = 90 - i * 16;
      rr(ctx, 515 - w / 2, y, w, 5, 2, 'rgba(255, 205, 110, 0.85)');
    });
  }
  // gentle waves
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 2.5;
  [222, 246, 282].forEach((y) => {
    ctx.beginPath();
    for (let x = 0; x <= 640; x += 16) {
      ctx.lineTo(x, y + Math.sin(x / 46 + y) * 3);
    }
    ctx.stroke();
  });
  if (mods.boat) drawBoat(ctx, 480, 185, 0.9);
  // gulls
  const gullSpots = [[140, 70], [220, 95], [300, 60]];
  gullSpots.slice(0, mods.gulls).forEach(([x, y]) => drawGull(ctx, x, y, 1));
  // sand
  ctx.fillStyle = '#f4d58d';
  ctx.fillRect(0, 300, 640, 120);
  circle(ctx, 90, 340, 4, '#d9b96a');
  circle(ctx, 210, 395, 4, '#d9b96a');
  circle(ctx, 590, 330, 4, '#d9b96a');
  circle(ctx, 380, 405, 4, '#d9b96a');
  drawPalm(ctx, 110, 300, 1, mods.coconuts);
  drawUmbrella(ctx, 330, 300, 1, mods.umbrella[0], mods.umbrella[1]);
  drawBucket(ctx, 440, 355, 1, mods.bucket);
  // starfish: same spot, or shifted when moved
  if (mods.starfishMoved) drawStarfish(ctx, 300, 365, 1, '#ff8c42');
  else drawStarfish(ctx, 250, 375, 1, '#ff8c42');
  // a little shell near the umbrella
  ellipse(ctx, 545, 392, 10, 7, '#ffe1ef');
  line(ctx, 537, 392, 553, 392, '#e07830', 1.5);
}

// --- Level 3: Pasar Malam (night market) ----------------------------------
// mods: { stars, moon, awning, cat, fruit, basket, bulb }
export function drawMarket(ctx, m = {}) {
  const mods = {
    stars: 14, moon: true, awning: '#2a9d8f', lantern: 'red', cat: 'sit',
    fruit: 'apples', basket: true, bulb: -1, ...m,
  };
  skyGradient(ctx, [[0, '#0f1b3d'], [0.6, '#1d3a5f'], [1, '#274b73']]);
  // stars (one fixed list; the mod hides one)
  const starSpots = [
    [60, 50], [150, 60], [230, 38], [310, 70], [380, 44], [460, 66],
    [40, 130], [120, 110], [200, 140], [340, 120], [420, 150], [500, 110],
    [590, 130], [270, 100],
  ];
  starSpots.slice(0, mods.stars).forEach(([x, y], i) => drawStar4(ctx, x, y, i % 3 === 0 ? 7 : 5));
  drawMoon(ctx, 560, 60, 26, mods.moon);
  drawStringLights(ctx, 20, 30, 620, 20, 9, mods.bulb);
  // ground: dark cobbles with warm light pools
  ctx.fillStyle = '#241a12';
  ctx.fillRect(0, 300, 640, 120);
  ellipse(ctx, 145, 360, 130, 26, 'rgba(242, 183, 5, 0.16)');
  ellipse(ctx, 485, 360, 130, 26, 'rgba(242, 183, 5, 0.16)');
  // stall one: fruit
  drawStall(ctx, 60, 230, 170, 90, '#e23b3b', '#ffffff');
  // fruit crates in front of stall one
  const fruitColor = mods.fruit === 'apples' ? '#e23b3b' : '#ff8c42';
  [[80, 326], [130, 326], [180, 326]].forEach(([cx, cy]) => {
    rr(ctx, cx, cy, 42, 26, 3, '#7a4a21');
    circle(ctx, cx + 10, cy + 8, 7, fruitColor);
    circle(ctx, cx + 22, cy + 8, 7, fruitColor);
    circle(ctx, cx + 32, cy + 8, 7, fruitColor);
    circle(ctx, cx + 16, cy + 18, 7, fruitColor);
    circle(ctx, cx + 28, cy + 18, 7, fruitColor);
  });
  // stall two: lanterns
  drawStall(ctx, 400, 230, 170, 90, mods.awning, '#ffffff');
  drawLantern(ctx, 430, 200, 1, '#e23b3b', true);
  drawLantern(ctx, 485, 195, 1, mods.lantern === 'green' ? '#7cc46a' : '#e23b3b', true);
  drawLantern(ctx, 535, 200, 1, '#ffcf3d', true);
  // the cat on a crate between the stalls
  rr(ctx, 272, 336, 56, 22, 3, '#7a4a21');
  drawCat(ctx, 300, 330, 1, mods.cat);
  // bicycle with (or without) a basket
  drawBike(ctx, 490, 372, 0.9, mods.basket);
}

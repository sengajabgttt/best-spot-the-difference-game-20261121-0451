// elements.js — every picture in Mata Jeli is drawn here, stroke by stroke,
// with plain canvas 2D calls. No image files, no network: the art is code.

export function circle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

export function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

export function rr(ctx, x, y, w, h, r, fill) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

export function poly(ctx, points, fill) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

export function line(ctx, x1, y1, x2, y2, color, width) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.stroke();
}

// --- sky things ---------------------------------------------------------

export function drawSun(ctx, x, y, r, opts = {}) {
  const { rays = true, color = '#ffcf3d', face = true } = opts;
  if (rays) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = '#ffcf3d';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const inner = r + 6, outer = r + (i % 2 === 0 ? 20 : 13);
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * inner, Math.sin(a) * inner);
      ctx.lineTo(Math.cos(a) * outer, Math.sin(a) * outer);
      ctx.stroke();
    }
    ctx.restore();
  }
  circle(ctx, x, y, r, color);
  if (face) {
    circle(ctx, x - r * 0.32, y - r * 0.18, r * 0.09, '#8a5a00');
    circle(ctx, x + r * 0.32, y - r * 0.18, r * 0.09, '#8a5a00');
    ctx.beginPath();
    ctx.arc(x, y + r * 0.12, r * 0.38, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.strokeStyle = '#8a5a00';
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}

export function drawCloud(ctx, x, y, s, color = '#ffffff') {
  circle(ctx, x, y, 18 * s, color);
  circle(ctx, x + 20 * s, y - 8 * s, 22 * s, color);
  circle(ctx, x + 44 * s, y, 18 * s, color);
  circle(ctx, x + 22 * s, y + 8 * s, 20 * s, color);
}

export function drawMoon(ctx, x, y, r, craters = true) {
  circle(ctx, x, y, r, '#f7ead0');
  circle(ctx, x, y, r, 'rgba(247,234,208,0.25)');
  if (craters) {
    circle(ctx, x - r * 0.3, y - r * 0.2, r * 0.18, '#d9c49a');
    circle(ctx, x + r * 0.25, y + r * 0.25, r * 0.13, '#d9c49a');
    circle(ctx, x + r * 0.35, y - r * 0.35, r * 0.1, '#d9c49a');
  }
}

export function drawStar4(ctx, x, y, r, color = '#fff6c9') {
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fillStyle = color;
  ctx.fill();
}

// --- nature -------------------------------------------------------------

export function drawTree(ctx, x, y, s, apples = 3) {
  rr(ctx, x - 7 * s, y - 10 * s, 14 * s, 62 * s, 5 * s, '#8a5a2e');
  circle(ctx, x, y - 52 * s, 34 * s, '#4d9b47');
  circle(ctx, x - 26 * s, y - 30 * s, 24 * s, '#5cb85c');
  circle(ctx, x + 26 * s, y - 30 * s, 24 * s, '#3f8a3a');
  const spots = [[-14, -58], [12, -66], [26, -40], [-28, -38], [0, -44]];
  for (let i = 0; i < apples && i < spots.length; i++) {
    circle(ctx, x + spots[i][0] * s, y + spots[i][1] * s, 6 * s, '#e23b3b');
  }
}

export function drawFlower(ctx, x, y, s, petal = '#ff6b9d') {
  line(ctx, x, y, x, y + 16 * s, '#3f8a3a', 3 * s);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    circle(ctx, x + Math.cos(a) * 8 * s, y + Math.sin(a) * 8 * s, 6 * s, petal);
  }
  circle(ctx, x, y, 6 * s, '#ffcf3d');
}

export function drawBird(ctx, x, y, s, color = '#3d5a80') {
  ellipse(ctx, x, y, 13 * s, 9 * s, color);
  circle(ctx, x + 11 * s, y - 5 * s, 6 * s, color);
  poly(ctx, [[x + 15 * s, y - 6 * s], [x + 21 * s, y - 4 * s], [x + 15 * s, y - 2 * s]], '#e07830');
  ctx.beginPath();
  ctx.arc(x - 4 * s, y - 12 * s, 10 * s, Math.PI, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5 * s;
  ctx.stroke();
  line(ctx, x - 8 * s, y + 8 * s, x - 12 * s, y + 13 * s, color, 2 * s);
  line(ctx, x - 2 * s, y + 8 * s, x - 2 * s, y + 13 * s, color, 2 * s);
}

export function drawButterfly(ctx, x, y, s, wing = '#ff8c42') {
  ellipse(ctx, x - 9 * s, y - 4 * s, 10 * s, 8 * s, wing);
  ellipse(ctx, x + 9 * s, y - 4 * s, 10 * s, 8 * s, wing);
  ellipse(ctx, x - 7 * s, y + 7 * s, 7 * s, 5 * s, wing);
  ellipse(ctx, x + 7 * s, y + 7 * s, 7 * s, 5 * s, wing);
  ellipse(ctx, x, y, 3 * s, 7 * s, '#2b2118');
  circle(ctx, x - 9 * s, y - 4 * s, 3 * s, '#ffffff');
  circle(ctx, x + 9 * s, y - 4 * s, 3 * s, '#ffffff');
}

export function drawFish(ctx, x, y, s, color = '#ff8c42') {
  ellipse(ctx, x, y, 14 * s, 8 * s, color);
  poly(ctx, [[x - 12 * s, y], [x - 22 * s, y - 8 * s], [x - 22 * s, y + 8 * s]], color);
  circle(ctx, x + 7 * s, y - 2 * s, 2 * s, '#2b2118');
}

export function drawPalm(ctx, x, y, s, coconuts = 3) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.12);
  ctx.beginPath();
  ctx.moveTo(-6 * s, 0);
  ctx.quadraticCurveTo(-2 * s, -60 * s, 6 * s, -96 * s);
  ctx.lineTo(14 * s, -94 * s);
  ctx.quadraticCurveTo(8 * s, -50 * s, 6 * s, 0);
  ctx.closePath();
  ctx.fillStyle = '#8a5a2e';
  ctx.fill();
  ctx.restore();
  const topX = x + 8 * s, topY = y - 96 * s;
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI * 0.95 + (i / 6) * Math.PI * 1.15;
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(
      topX + Math.cos(a) * 34 * s, topY + Math.sin(a) * 22 * s - 12 * s,
      topX + Math.cos(a) * 52 * s, topY + Math.sin(a) * 30 * s + 12 * s,
    );
    ctx.quadraticCurveTo(
      topX + Math.cos(a) * 30 * s, topY + Math.sin(a) * 16 * s + 6 * s,
      topX, topY,
    );
    ctx.fillStyle = i % 2 ? '#4d9b47' : '#5cb85c';
    ctx.fill();
  }
  const nutSpots = [[-8, 4], [8, 6], [0, 12]];
  for (let i = 0; i < coconuts && i < nutSpots.length; i++) {
    circle(ctx, topX + nutSpots[i][0] * s, topY + nutSpots[i][1] * s, 6 * s, '#6b4423');
  }
}

export function drawUmbrella(ctx, x, y, s, c1 = '#e23b3b', c2 = '#ffffff') {
  line(ctx, x, y - 10 * s, x, y + 52 * s, '#8a6d4b', 4 * s);
  const cols = [c1, c2, c1, c2, c1, c2];
  for (let i = 0; i < 6; i++) {
    const a0 = Math.PI + (i / 6) * Math.PI;
    const a1 = Math.PI + ((i + 1) / 6) * Math.PI;
    ctx.beginPath();
    ctx.moveTo(x, y - 10 * s);
    ctx.arc(x, y - 10 * s, 58 * s, a0, a1);
    ctx.closePath();
    ctx.fillStyle = cols[i];
    ctx.fill();
  }
  circle(ctx, x, y - 12 * s, 5 * s, '#f2b705');
}

export function drawBoat(ctx, x, y, s) {
  poly(ctx, [[x - 26 * s, y], [x + 26 * s, y], [x + 16 * s, y + 12 * s], [x - 16 * s, y + 12 * s]], '#8a5a2e');
  line(ctx, x, y, x, y - 26 * s, '#5a3a1e', 3 * s);
  poly(ctx, [[x + 2 * s, y - 26 * s], [x + 2 * s, y - 2 * s], [x + 22 * s, y - 2 * s]], '#ffffff');
}

export function drawStarfish(ctx, x, y, s, color = '#ff8c42') {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const a2 = a + Math.PI / 5;
    ctx.lineTo(Math.cos(a) * 16 * s, Math.sin(a) * 16 * s);
    ctx.lineTo(Math.cos(a2) * 7 * s, Math.sin(a2) * 7 * s);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
  circle(ctx, x, y, 3 * s, '#e07830');
}

export function drawBucket(ctx, x, y, s, color = '#3d8bfd') {
  poly(ctx, [[x - 14 * s, y], [x + 14 * s, y], [x + 10 * s, y + 22 * s], [x - 10 * s, y + 22 * s]], color);
  ctx.beginPath();
  ctx.arc(x, y, 14 * s, Math.PI, 0);
  ctx.strokeStyle = '#5a3a1e';
  ctx.lineWidth = 2.5 * s;
  ctx.stroke();
  rr(ctx, x - 16 * s, y - 3 * s, 32 * s, 5 * s, 2 * s, '#ffffff');
}

export function drawGull(ctx, x, y, s) {
  ctx.beginPath();
  ctx.arc(x - 8 * s, y, 8 * s, Math.PI * 1.15, Math.PI * 1.95);
  ctx.arc(x + 8 * s, y, 8 * s, Math.PI * 1.05, Math.PI * 1.85);
  ctx.strokeStyle = '#3d5a80';
  ctx.lineWidth = 2.5 * s;
  ctx.stroke();
}

// --- buildings & market ---------------------------------------------------

export function drawHouse(ctx, x, y, w, h, roofColor = '#d64541') {
  rr(ctx, x, y, w, h, 4, '#ffe1a8');
  poly(ctx, [[x - 12, y], [x + w / 2, y - 52], [x + w + 12, y]], roofColor);
  rr(ctx, x + w / 2 - 16, y + h - 52, 32, 52, 4, '#8a5a2e');
  circle(ctx, x + w / 2 + 10, y + h - 26, 3, '#f2b705');
  rr(ctx, x + 14, y + 16, 30, 30, 3, '#7cc4e8');
  rr(ctx, x + w - 44, y + 16, 30, 30, 3, '#7cc4e8');
  line(ctx, x + 14, y + 31, x + 44, y + 31, '#ffffff', 2);
  line(ctx, x + 29, y + 16, x + 29, y + 46, '#ffffff', 2);
  line(ctx, x + w - 44, y + 31, x + w - 14, y + 31, '#ffffff', 2);
  line(ctx, x + w - 29, y + 16, x + w - 29, y + 46, '#ffffff', 2);
}

export function drawStall(ctx, x, y, w, h, awningA = '#e23b3b', awningB = '#ffffff') {
  const stripes = 6, sw = w / stripes;
  for (let i = 0; i < stripes; i++) {
    rr(ctx, x + i * sw, y - 26, sw, 26, 2, i % 2 ? awningB : awningA);
  }
  rr(ctx, x, y, w, h, 4, '#7a4a21');
  rr(ctx, x + 6, y + 8, w - 12, h - 16, 3, '#5a3413');
  line(ctx, x + 4, y - 26, x + 4, y + h, '#3d2b1f', 3);
  line(ctx, x + w - 4, y - 26, x + w - 4, y + h, '#3d2b1f', 3);
}

export function drawLantern(ctx, x, y, s, color = '#e23b3b', lit = true) {
  line(ctx, x, y - 14 * s, x, y - 4 * s, '#3d2b1f', 2 * s);
  ellipse(ctx, x, y + 6 * s, 11 * s, 13 * s, color);
  rr(ctx, x - 5 * s, y - 8 * s, 10 * s, 4 * s, 2 * s, '#f2b705');
  rr(ctx, x - 5 * s, y + 17 * s, 10 * s, 4 * s, 2 * s, '#f2b705');
  if (lit) circle(ctx, x, y + 6 * s, 5 * s, 'rgba(255, 240, 180, 0.9)');
}

export function drawCat(ctx, x, y, s, pose = 'sit') {
  if (pose === 'lie') {
    ellipse(ctx, x, y + 8 * s, 26 * s, 10 * s, '#f2f2f2');
    circle(ctx, x + 24 * s, y - 2 * s, 10 * s, '#f2f2f2');
    poly(ctx, [[x + 18 * s, y - 10 * s], [x + 21 * s, y - 18 * s], [x + 25 * s, y - 10 * s]], '#f2f2f2');
    poly(ctx, [[x + 26 * s, y - 10 * s], [x + 29 * s, y - 18 * s], [x + 33 * s, y - 10 * s]], '#f2f2f2');
    ctx.beginPath();
    ctx.arc(x + 26 * s, y, 3 * s, 0.4, Math.PI * 0.9);
    ctx.strokeStyle = '#2b2118';
    ctx.lineWidth = 1.6 * s;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 24 * s, y + 8 * s);
    ctx.quadraticCurveTo(x - 38 * s, y + 2 * s, x - 34 * s, y - 8 * s);
    ctx.strokeStyle = '#f2f2f2';
    ctx.lineWidth = 4 * s;
    ctx.stroke();
    return;
  }
  ellipse(ctx, x, y + 10 * s, 15 * s, 14 * s, '#f2f2f2');
  circle(ctx, x + 2 * s, y - 12 * s, 12 * s, '#f2f2f2');
  poly(ctx, [[x - 6 * s, y - 20 * s], [x - 3 * s, y - 30 * s], [x + 1 * s, y - 20 * s]], '#f2f2f2');
  poly(ctx, [[x + 6 * s, y - 21 * s], [x + 10 * s, y - 30 * s], [x + 13 * s, y - 20 * s]], '#f2f2f2');
  circle(ctx, x - 2 * s, y - 14 * s, 1.8 * s, '#2b2118');
  circle(ctx, x + 7 * s, y - 14 * s, 1.8 * s, '#2b2118');
  poly(ctx, [[x + 2 * s, y - 8 * s], [x + 5 * s, y - 8 * s], [x + 3.5 * s, y - 5 * s]], '#e07830');
  ctx.beginPath();
  ctx.moveTo(x + 14 * s, y + 16 * s);
  ctx.quadraticCurveTo(x + 30 * s, y + 14 * s, x + 28 * s, y - 2 * s);
  ctx.strokeStyle = '#f2f2f2';
  ctx.lineWidth = 5 * s;
  ctx.lineCap = 'round';
  ctx.stroke();
}

export function drawBike(ctx, x, y, s, basket = true) {
  const wheel = (cx) => {
    ctx.beginPath();
    ctx.arc(cx, y, 16 * s, 0, Math.PI * 2);
    ctx.strokeStyle = '#2b2118';
    ctx.lineWidth = 3 * s;
    ctx.stroke();
    line(ctx, cx - 11 * s, y - 11 * s, cx + 11 * s, y + 11 * s, '#9a8a76', 1.5 * s);
    line(ctx, cx + 11 * s, y - 11 * s, cx - 11 * s, y + 11 * s, '#9a8a76', 1.5 * s);
  };
  wheel(x);
  wheel(x + 52 * s);
  line(ctx, x, y, x + 22 * s, y - 20 * s, '#e23b3b', 3 * s);
  line(ctx, x + 22 * s, y - 20 * s, x + 52 * s, y, '#e23b3b', 3 * s);
  line(ctx, x + 22 * s, y - 20 * s, x + 34 * s, y - 2 * s, '#e23b3b', 3 * s);
  line(ctx, x + 34 * s, y - 2 * s, x + 52 * s, y, '#e23b3b', 3 * s);
  line(ctx, x + 14 * s, y - 24 * s, x + 30 * s, y - 24 * s, '#2b2118', 3 * s);
  line(ctx, x + 52 * s, y, x + 56 * s, y - 14 * s, '#2b2118', 3 * s);
  line(ctx, x + 50 * s, y - 14 * s, x + 60 * s, y - 14 * s, '#2b2118', 3 * s);
  if (basket) {
    rr(ctx, x + 56 * s, y - 12 * s, 16 * s, 12 * s, 2 * s, '#b08954');
    line(ctx, x + 58 * s, y - 12 * s, x + 58 * s, y, '#8a6d4b', 1.5 * s);
    line(ctx, x + 64 * s, y - 12 * s, x + 64 * s, y, '#8a6d4b', 1.5 * s);
    line(ctx, x + 70 * s, y - 12 * s, x + 70 * s, y, '#8a6d4b', 1.5 * s);
  }
}

export function drawStringLights(ctx, x1, y1, x2, y2, bulbs, bulbOut = -1) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo((x1 + x2) / 2, Math.max(y1, y2) + 26, x2, y2);
  ctx.strokeStyle = '#3d2b1f';
  ctx.lineWidth = 2;
  ctx.stroke();
  for (let i = 0; i < bulbs; i++) {
    const t = (i + 0.5) / bulbs;
    const bx = x1 + (x2 - x1) * t;
    const by = y1 + (y2 - y1) * t + Math.sin(t * Math.PI) * 22;
    const colors = ['#ffcf3d', '#ff6b9d', '#7cc46a', '#7cc4e8'];
    const lit = i !== bulbOut;
    if (lit) {
      ctx.beginPath();
      ctx.arc(bx, by + 6, 11, 0, Math.PI * 2);
      ctx.fillStyle = colors[i % colors.length] + '33';
      ctx.fill();
    }
    circle(ctx, bx, by + 6, 5, lit ? colors[i % colors.length] : '#5a5348');
  }
}

// levels.js — the three hunts. Each level names its scene, its time limit,
// how many hints it allows, the mods that make panel B different, and the
// seven differences with their click zones (panel coordinates, 640 x 420)
// and the label shown when one is found.

import { drawGarden, drawBeach, drawMarket } from './scenes.js';

export const PANEL_W = 640;
export const PANEL_H = 420;

export const LEVELS = [
  {
    id: 1,
    name: 'Taman Pagi',
    scene: 'Taman di pagi hari — matahari, rumah, dan pohon apel.',
    draw: drawGarden,
    timeLimit: 180,
    hints: 3,
    mods: {
      sunRays: false,
      cloud2: false,
      roof: '#3d8bfd',
      flowers: 4,
      bird: false,
      apples: 2,
      butterfly: '#9b7ede',
    },
    diffs: [
      { x: 90, y: 70, r: 40, label: 'Sinar matahari hilang!' },
      { x: 450, y: 48, r: 34, label: 'Awan hilang satu!' },
      { x: 475, y: 190, r: 36, label: 'Warna atap berubah!' },
      { x: 300, y: 365, r: 26, label: 'Bunga hilang satu!' },
      { x: 330, y: 115, r: 26, label: 'Burung hilang!' },
      { x: 146, y: 260, r: 22, label: 'Apel di pohon berkurang!' },
      { x: 530, y: 180, r: 26, label: 'Warna kupu-kupu berubah!' },
    ],
  },
  {
    id: 2,
    name: 'Pantai Senja',
    scene: 'Pantai saat matahari terbenam — palem, payung, dan ombak.',
    draw: drawBeach,
    timeLimit: 150,
    hints: 3,
    mods: {
      boat: false,
      umbrella: ['#3d8bfd', '#ffffff'],
      coconuts: 2,
      starfishMoved: true,
      gulls: 2,
      bucket: '#e23b3b',
      reflection: false,
    },
    diffs: [
      { x: 480, y: 185, r: 30, label: 'Perahu hilang!' },
      { x: 330, y: 275, r: 40, label: 'Warna payung berubah!' },
      { x: 118, y: 216, r: 20, label: 'Kelapa berkurang!' },
      { x: 300, y: 365, r: 26, alt: { x: 250, y: 375, r: 26 }, label: 'Bintang laut pindah!' },
      { x: 300, y: 60, r: 24, label: 'Burung camar berkurang!' },
      { x: 440, y: 365, r: 26, label: 'Warna ember berubah!' },
      { x: 515, y: 250, r: 34, label: 'Pantulan matahari hilang!' },
    ],
  },
  {
    id: 3,
    name: 'Pasar Malam',
    scene: 'Pasar malam — kios buah, lampion, dan kucing penjaga.',
    draw: drawMarket,
    timeLimit: 120,
    hints: 2,
    mods: {
      stars: 13,
      moon: false,
      awning: '#e07830',
      lantern: 'green',
      cat: 'lie',
      fruit: 'oranges',
      basket: false,
      bulb: 4,
    },
    diffs: [
      { x: 150, y: 60, r: 20, label: 'Bintang hilang satu!' },
      { x: 560, y: 60, r: 30, label: 'Bulan tanpa kawah!' },
      { x: 485, y: 215, r: 40, label: 'Warna atap kios berubah!' },
      { x: 300, y: 330, r: 30, label: 'Kucing berubah posisi!' },
      { x: 145, y: 340, r: 34, label: 'Buah berubah jadi jeruk!' },
      { x: 545, y: 362, r: 24, label: 'Keranjang sepeda hilang!' },
      { x: 320, y: 53, r: 22, label: 'Lampu hias mati satu!' },
    ],
  },
];

export function totalDifferences(level) {
  return level.diffs.length;
}

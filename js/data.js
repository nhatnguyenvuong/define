/* =========================================================================
   DEFINE — project data (from the brochure plans)
   · L1–L2 podium (no residences)          · L3  : 2 × 4BR-D at the two ends + podium deck
   · L4  : 3BR-A | 3BR-B | 3BR-B | 3BR-A     · L5–L24 typical 1 / typical 2 (L15 has 4BR-C)
   · L25 : 2 × Penthouse A "Monte Carlo"     · L26 roof
   3 + 4 + 40 + 36 + 4 + … = 88 residences.
   Plan coordinates: x left→right as seen from the river, z = +8 is the river facade.
   ========================================================================= */
(function () {
  const PODIUM_LEVELS = 3, LEVELS = 26;
  const HEIGHTS = { 1: 6.2, 2: 6.2, 3: 6.2, 25: 5.5, 26: 5.0 }; // podium storeys are tall in the render; L25 = penthouse crown
  const levelH = (l) => HEIGHTS[l] || 3.3;
  const levelY = (l) => { let y = 0; for (let i = 1; i < l; i++) y += levelH(i); return y; };

  // tower body (front z = +8) and the two lift cores sticking out at the back
  const footprint = { w: 106, d: 16 };
  const podium = { w: 112, d: 26 };
  const cores = [
    { x: -31.9, z: -12.5, w: 13.4, d: 6.8 },
    { x: 18.4, z: -12.5, w: 13.4, d: 6.8 },
  ];

  // facade bays (left → right), scaled to the tower width
  const bayPattern = ['end', 'bal', 'win', 'bal', 'win', 'mid', 'win', 'bal', 'win', 'bal', 'end'];
  const bayBase = { end: 6, bal: 10, win: 7, mid: 12 };
  const sum = bayPattern.reduce((s, t) => s + bayBase[t], 0);
  const bays = bayPattern.map((type) => ({ type, w: (bayBase[type] * footprint.w) / sum }));
  const arches = [{ x: 9.5, w: 9, h: 9 }, { x: 37, w: 9, h: 9 }];

  // unit plan types (interiors come from these drawings)
  const PLAN_TYPES = {
    jardin: { name: 'Jardin', typeLabel: '3 Bedroom', type: '3BR', beds: 3, baths: '3 + powder', nfa: 197.2, w: 21.55, d: 15.45,
      features: ['Private lift & lift lobby', 'Entry terrace & sky garden', 'Gallery kitchen + wet kitchen', 'Deck & loggia'] },
    riviere: { name: 'Rivière', typeLabel: '4 Bedroom', type: '4BR', beds: 4, baths: '4 + powder', nfa: 295.5, w: 30.25, d: 14.2,
      features: ['Private swimming pool on the deck', 'Private lift & lift lobby', 'Two master suites', 'Maid room + wet kitchen'] },
    penthouse: { name: 'Monte Carlo', typeLabel: 'Penthouse', type: 'PH', beds: 4, baths: '4 + powder', nfa: 528.2, w: 51.45, d: 15.45,
      features: ['Private pool with shallow pool area', 'Pool pavilion, tea room & outdoor shower', 'Koi pond on the deck', 'Two private lifts'] },
  };
  // variants without their own unit drawing: shown with the closest plan, flagged "indicative"
  const VARIANT = {
    '3BR-B': { kind: 'riviere', name: '3BR-B', typeLabel: '3 Bedroom', type: '3BR', beds: 3, baths: '3 + powder', nfa: 297.7, features: ['Private lift & lift lobby', 'Large deck'] },
    '4BR-C': { kind: 'riviere', name: '4BR-C', typeLabel: '4 Bedroom', type: '4BR', nfa: 260.3, w: 27.9, features: ['Private lift & lift lobby', 'Deck & loggia'] },
    '4BR-B': { kind: 'riviere', name: 'Rivière', typeLabel: '4 Bedroom', type: '4BR', nfa: 295.5, features: ['Private lift & lift lobby', 'Deck facing the river'] },
    '4BR-D': { kind: 'riviere', name: '4BR-D', typeLabel: '4 Bedroom', type: '4BR', nfa: 285.5, features: ['Private lift & lift lobby', 'Opens onto the podium deck'] },
  };

  // [id, kind or variant, model, GFA, left x (m), mirrored] — traced from the floor plans
  const U = (id, k, model, gfa, x, mirror) => ({ id, k, model, gfa, x, mirror });
  const PLANS = {
    L3: { map: { cx: 1090.5, frontY: 495, s: 7.796 }, units: [U('02', '4BR-D', '4BR-D (M)', 315.7, -52.4, false), U('01', '4BR-D', '4BR-D', 315.7, 22.15, true)] },
    L4: { map: { cx: 1086.5, frontY: 762, s: 7.805 }, units: [U('04', 'jardin', '3BR-A (M)', 220.8, -52.4, true), U('03', '3BR-B', '3BR-B (M)', 324.7, -30.5, true), U('02', '3BR-B', '3BR-B', 324.7, 0, false), U('01', 'jardin', '3BR-A', 220.8, 30.9, false)] },
    floor1: { map: { cx: 656, frontY: 438, s: 12.02 }, units: [U('04', 'jardin', '3BR-A (M)', 220.8, -52.4, true), U('03', 'riviere', '4BR-A (M)', 324.7, -30.5, true), U('02', 'riviere', '4BR-A', 324.7, 0, false), U('01', 'jardin', '3BR-A', 220.8, 30.9, false)] },
    floor2: { map: { cx: 655, frontY: 401, s: 12.02 }, units: [U('04', '4BR-B', '4BR-B (M)', 325.9, -52.6, false), U('03', 'jardin', '3BR-A', 219.6, -22.0, false), U('02', 'jardin', '3BR-A (M)', 219.6, 0.45, true), U('01', '4BR-B', '4BR-B', 325.9, 22.4, true)] },
    L15: { map: { cx: 507.5, frontY: 764, s: 7.853 }, units: [U('04', '4BR-C', '4BR-C (M)', 287.6, -52.4, false), U('03', 'jardin', '3BR-A', 219.6, -22.0, false), U('02', 'jardin', '3BR-A (M)', 219.6, 0.45, true), U('01', '4BR-C', '4BR-C', 287.6, 24.5, true)] },
    L25: { map: { cx: 508.5, frontY: 1039, s: 7.872 }, units: [U('02', 'penthouse', 'Penthouse A (M)', 569.7, -52.4, true), U('01', 'penthouse', 'Penthouse A', 569.7, 0.95, false)] },
  };
  const T1 = [6, 8, 10, 12, 14, 16, 18, 20, 22, 24];
  const T2 = [5, 7, 9, 11, 13, 17, 19, 21, 23];
  const planOf = (l) => (l === 3 ? 'L3' : l === 4 ? 'L4' : l === 15 ? 'L15' : l === 25 ? 'L25' : T1.includes(l) ? 'floor1' : T2.includes(l) ? 'floor2' : null);
  const pad = (n) => String(n).padStart(2, '0');

  const floors = [];
  for (let level = 1; level <= LEVELS; level++) {
    const key = planOf(level);
    if (key) {
      floors.push({
        level, kind: 'residential', plan: key, map: PLANS[key].map,
        units: PLANS[key].units.map((u) => {
          const v = VARIANT[u.k];
          const kind = v ? v.kind : u.k;
          const base = PLAN_TYPES[kind];
          const P = { ...base, ...(v || {}) };
          return { id: u.id, kind, model: u.model, gfa: u.gfa, x: u.x, mirror: u.mirror, indicative: !!v,
            name: P.name, typeLabel: P.typeLabel, type: P.type, beds: P.beds, baths: P.baths, nfa: P.nfa, features: P.features,
            w: P.w, d: base.d, z: footprint.d / 2 - base.d, area: P.nfa, code: `${pad(level)}.${u.id}` };
        }),
      });
      continue;
    }
    const Z = (name, x, z, w, d, extra = {}) => ({ name, x, z, w, d, ...extra });
    const named = {
      1: ['Grand Lobby', [Z('Grand Lobby', -20, -8, 40, 16), Z('Welcome Lounge', 22, -8, 26, 16)]],
      2: ['Podium', [Z('Amenities', -40, -8, 80, 16)]],
      26: ['Roof', [Z('Roof', -40, -8, 80, 16)]],
    }[level];
    floors.push({ level, kind: 'amenity', name: named[0], zones: named[1], pending: true });
  }

  // ---- hero image (assets/hero.jpg, 1672×941) → level bands, in image pixels
  // slab lines measured on the render: 21 residential floors (L25 at the top → L5 at the bottom)
  // Measured on the render (3786×2210, BG_2): 21 residential floors (L24 … L4) between y≈543 and y≈1500,
  // slab lines evenly spaced ≈45.6px; crown (L25) above, podium (L1–L3) below.
  const slabLines = Array.from({ length: 22 }, (_, i) => Math.round(543 + i * (1500 - 543) / 21));
  const heroBands = {};
  heroBands[25] = { y: [405, slabLines[0]] };                                               // penthouse crown
  for (let i = 0; i < 21; i++) heroBands[24 - i] = { y: [slabLines[i], slabLines[i + 1]] };   // L24 … L4
  heroBands[3] = { y: [1515, 1600], xs: [[1178, 1636], [2256, 2610]] };                     // L3: only the two end units
  heroBands[2] = { y: [1600, 1690] };
  heroBands[1] = { y: [1690, 1778] };
  // assets/hero.jpg = that render as is (no extension), shown like background-size: cover
  const OX = 0, OY = 0;
  Object.values(heroBands).forEach((b) => { b.y = b.y.map((v) => v + OY); if (b.xs) b.xs = b.xs.map(([a, c]) => [a + OX, c + OX]); });
  const shiftPts = (str) => str.split(' ').map((p) => { const [x, y] = p.split(',').map(Number); return `${x + OX},${y + OY}`; }).join(' ');
  const hero = {
    src: 'assets/hero.jpg?v=16', // bump v when the image changes so browsers don't show a stale copy
    width: 3782, height: 2210,
    bands: heroBands,
    tower: [1203 + OX, 2593 + OX], podium: [1175 + OX, 2612 + OX],
    frame: [1175 + OX, 395 + OY, 2612 + OX, 1778 + OY], // whole building incl. crown and podium (for framing)
    silhouette: shiftPts('1203,1510 1203,420 1495,420 1495,395 2310,395 2310,420 2593,420 2593,1510 2612,1510 2612,1778 1175,1778 1175,1510'),
  };

  window.DEFINE_DATA = { hero, LEVELS, PODIUM_LEVELS, levelY, levelH, footprint, podium, cores, bays, arches, floors, PLAN_TYPES, placeholder: false };
})();

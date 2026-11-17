/* DEFINE — prototype v4
   Building          = photoreal render + SVG floor bands
   Master floor plan = one 3D scene assembled from reusable residence modules, top-down orthographic
   Residence         = the same module, isolated, axonometric cutaway */
(function () {
  const D = window.DEFINE_DATA;
  const H = D.hero;
  const NS = 'http://www.w3.org/2000/svg';
  const $ = (s) => document.querySelector(s);
  const app = $('#app');
  const svg = $('#hero');
  const N = D.LEVELS;
  const floorsByLevel = Object.fromEntries(D.floors.map((f) => [f.level, f]));
  const pad = (n) => String(n).padStart(2, '0');
  // only levels with residences are interactive (podium, L15, penthouse and roof have no data yet)
  const DISABLED = [3]; // levels kept out of the journey
  const isActive = (l) => !DISABLED.includes(l) && !!(floorsByLevel[l] && floorsByLevel[l].kind === 'residential');

  const state = { view: 'building', level: 18, unit: null, ui: 0, mode: '3d' };
  let three = null;

  // =====================================================================
  // HERO — bands on the render
  // =====================================================================
  // a level can be one band or several pieces (L3 only has residences at the two ends)
  const bandRects = (l) => {
    const B = H.bands[l];
    if (!B) return [];
    const [y0, y1] = B.y;
    if (B.xs) return B.xs.map(([a, b]) => ({ x: a, y: y0, w: b - a, h: y1 - y0 }));
    const [x0, x1] = l <= D.PODIUM_LEVELS ? H.podium : H.tower;
    return [{ x: x0 - 4, y: y0, w: x1 - x0 + 8, h: y1 - y0 }];
  };
  const bandOf = (l) => bandRects(l)[0];
  // image size comes from the data, so the picture and the floor bands can never disagree
  { const im = $('#heroImg'); im.setAttribute('href', H.src); im.setAttribute('width', H.width); im.setAttribute('height', H.height); }
  $('#towerPoly').setAttribute('points', H.silhouette);
  // frame the render so the whole tower sits between the header and the floor rail, whatever the screen ratio
  const view = { x: 0, y: 0, w: H.width, h: H.height };
  function frameHero() {
    // the render keeps its own proportions: fill the screen (like background-size: cover), centred
    const w = innerWidth, h = innerHeight;
    const s = Math.max(w / H.width, h / H.height);
    const vw = w / s, vh = h / s;
    const vx = (H.width - vw) / 2, vy = (H.height - vh) / 2;
    Object.assign(view, { x: vx, y: vy, w: vw, h: vh });
    svg.setAttribute('viewBox', `${vx} ${vy} ${vw} ${vh}`);
  }
  svg.setAttribute('preserveAspectRatio', 'none');
  frameHero();
  window.addEventListener('resize', frameHero);
  const hitLayer = $('#hitLayer');
  for (let l = 1; l <= N; l++) {
    if (!isActive(l)) continue;
    bandRects(l).forEach((b) => {
      const r = document.createElementNS(NS, 'rect');
      r.setAttribute('x', b.x); r.setAttribute('y', b.y); r.setAttribute('width', b.w); r.setAttribute('height', b.h);
      r.dataset.level = l;
      hitLayer.appendChild(r);
    });
  }
  hitLayer.addEventListener('pointerover', (e) => { const l = +e.target.dataset.level; if (l) setHeroLevel(l); });
  hitLayer.addEventListener('click', (e) => { const l = +e.target.dataset.level; if (l) openFloor(l); });
  // leaving the tower clears the floor highlight; the level card keeps the last level
  hitLayer.addEventListener('pointerleave', () => { $('#band').classList.remove('on'); $('#floorTag').classList.remove('on'); });

  // press D on the hero to show every band (for checking a new render)
  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() !== 'd' || state.view !== 'building') return;
    const g = $('#debugBands');
    if (g.childNodes.length) { g.innerHTML = ''; return; }
    for (let l = 1; l <= N; l++) bandRects(l).forEach((b) => {
      g.insertAdjacentHTML('beforeend', `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}"/><text x="${b.x + 6}" y="${b.y + b.h - 6}">${l}${isActive(l) ? '' : ' ·off'}</text>`);
    });
  });

  const band = $('#band'), tag = $('#floorTag');
  // ---- level card (right)
  const activeLevels = D.floors.filter((f) => isActive(f.level)).map((f) => f.level);
  const PLANS_IMG = window.DEFINE_PLANS || {};
  function renderCard(level) {
    const f = floorsByLevel[level];
    if (!f || !f.units) return;
    const us = f.units;
    const names = [...new Set(us.map((u) => u.name))];
    const nfa = us.map((u) => u.nfa), beds = us.map((u) => u.beds);
    const range = (a, unit = '') => (Math.min(...a) === Math.max(...a) ? `${Math.min(...a)}${unit}` : `${Math.min(...a)} – ${Math.max(...a)}${unit}`);
    const byType = {};
    us.forEach((u) => (byType[u.typeLabel] = (byType[u.typeLabel] || 0) + 1));
    const ph = us[0].kind === 'penthouse';
    const pools = us.filter((u) => u.kind === 'riviere' && !u.indicative || u.kind === 'penthouse').length;
    $('.lc-num').textContent = pad(level);
    $('.lc-title').textContent = ph ? 'Monte Carlo Penthouses' : names.join(' & ');
    $('.lc-desc').textContent = ph
      ? 'Two penthouses, each spanning half the floor, with a private pool, pool pavilion and koi pond.'
      : `${Object.entries(byType).map(([t, n]) => `${n} × ${t}`).join(', ')} — each with a private lift lobby.`;
    const img = $('.lc-plan');
    if (PLANS_IMG[f.plan]) { img.src = PLANS_IMG[f.plan].tex; img.style.display = ''; } else img.style.display = 'none';
    const rows = [
      [ph ? 'Penthouses' : 'Residences', us.length],
      ['Interior (NFA)', range(nfa, ' m²')],
      ['Bedrooms', range(beds)],
      ['Private pools', pools || 'Not shown in plans'],
      ['Unit types', [...new Set(us.map((u) => u.model.replace(' (M)', '')))].join(' · ')],
    ];
    $('.lc-specs').innerHTML = rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
    $('.lc-count').textContent = `${activeLevels.indexOf(level) + 1} of ${activeLevels.length} levels`;
  }
  document.querySelectorAll('.lc-arrows button').forEach((b) => b.addEventListener('click', () => {
    const i = activeLevels.indexOf(state.level) + +b.dataset.step;
    if (i >= 0 && i < activeLevels.length) setHeroLevel(activeLevels[i]);
  }));
  // grey out an arrow at the lowest / highest level
  const syncLcArrows = () => { const i = activeLevels.indexOf(state.level); document.querySelectorAll('.lc-arrows button').forEach((b) => (b.disabled = i + +b.dataset.step < 0 || i + +b.dataset.step >= activeLevels.length)); };

  function setHeroLevel(level) {
    state.level = level;
    renderCard(level);
    syncLcArrows();
    // soft white wash on the floor + a thin light streak along its slab, fading in from the sky on the left
    band.innerHTML = bandRects(level).map((b, i) => {
      const sx = i === 0 ? b.x - 320 : b.x, sw = b.x + b.w - sx;
      return `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="url(#bandGrad)" filter="url(#soft)"/>` +
        `<g filter="url(#soft)"><rect x="${sx}" y="${b.y + b.h - 2.5}" width="${sw}" height="5" fill="url(#streakGrad)"/></g>`;
    }).join('');
    band.classList.add('on');
    $('.ft-num').textContent = pad(level);
    tag.classList.add('on');
    positionTooltip();
    setRail(level);
  }
  function svgToScreen(x, y) { const p = svg.createSVGPoint(); p.x = x; p.y = y; return p.matrixTransform(svg.getScreenCTM()); }
  function positionTooltip() {
    const b = bandOf(state.level);
    // the floor number sits in the open sky just left of the tower, level with the floor
    let s = svgToScreen(b.x - 34, b.y + b.h / 2);
    const copyRight = document.querySelector('.hero-copy').getBoundingClientRect().right;
    // on narrow screens there is no free sky beside the tower: the level card already shows the number, so hide it
    tag.style.visibility = s.x - 70 < copyRight ? 'hidden' : '';
    tag.style.transform = `translate(${s.x}px, ${s.y}px) translate(-100%, -50%)`;
  }
  tag.addEventListener('click', () => openFloor(state.level));
  window.addEventListener('resize', () => { if (state.view === 'building') positionTooltip(); });

  const setRail = () => {};
  // =====================================================================
  // KEYS / BUTTONS
  // =====================================================================
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') goBack();
    if (state.view === 'building') {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) { e.preventDefault(); const l = stepLevel(state.level, e.key === 'ArrowUp' || e.key === 'ArrowRight' ? 1 : -1); if (l) setHeroLevel(l); }
      if (e.key === 'Enter') openFloor(state.level);
    } else if (state.view === 'floor') {
      if (e.key === 'ArrowRight') selectUnit(state.ui + 1);
    } else if (state.view === 'unit') {
      if (e.key === 'ArrowRight') stepUnit(1);
      if (e.key === 'ArrowLeft') stepUnit(-1);
    }
    if (state.view === 'floor') {
      if (e.key === 'ArrowLeft') selectUnit(state.ui - 1);
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        const gs = PLAN_GROUPS.filter((g) => g.levels.length), i = gs.indexOf(groupOf(state.level));
        const n = gs[i + (e.key === 'ArrowUp' ? 1 : -1)];
        if (n) openGroup(n.key);
      }
      if (e.key === 'Enter') openUnit();
    }
  });
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-action]');
    if (!a) return;
    e.preventDefault();
    const act = a.dataset.action;
    if (act === 'explore') openFloor(state.level);
    if (act === 'consult') toast('Consultation form coming soon');
    if (act === 'register') toast('Registration form coming soon');
    if (act === 'home') goTo('building');
    if (act === 'back') goBack();
    if (act === 'uprev' || act === 'unext') stepUnit(act === 'uprev' ? -1 : 1);
    if (act === 'prev') selectUnit(state.ui - 1);
    if (act === 'next') selectUnit(state.ui + 1);
    if (act === 'explore3d') openUnit();
    if (act === 'group') openGroup(a.dataset.g);
    if (act === 'mode2d' || act === 'mode3d') setUnitMode(act === 'mode2d' ? '2d' : '3d');
    if (act === 'resetcam' && three && state.view === 'unit') three.setMode(state.mode);
  });
  function openGroup(key) {
    const g = PLAN_GROUPS.find((x) => x.key === key);
    if (!g || !g.levels.length || (groupOf(state.level) === g && state.view === 'floor')) return;
    openFloor(g.levels.includes(g.home) ? g.home : g.levels[0]);
  }
  function stepLevel(from, dir) {
    let l = from + dir;
    while (l >= 1 && l <= N && !isActive(l)) l += dir;
    return l >= 1 && l <= N ? l : null;
  }
  let toastT;
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 1800); }

  // the render is ready as soon as the image is → hide the loader
  { const img = new Image(); img.onload = img.onerror = () => $('#loading').classList.add('done'); img.src = H.src; }
  setHeroLevel(18);

  // =====================================================================
  // MASTER FLOOR PLAN — one 3D scene assembled from reusable modules, seen from directly above
  //   modules (built once, shared geometry + materials):
  //     Unit_Jardin · Unit_Riviere · Unit_Penthouse   ← official unit plans
  //     SharedCore_<template>                          ← official floor plan minus the drawn residences
  //   placement (module, x, z, mirrored) comes from js/data.js
  // =====================================================================
  const PL = window.DEFINE_PLANS || {};
  const MOD = window.DEFINE_MODULES;
  const HAND = window.DEFINE_HAND || {};
  const P25 = window.DEFINE_PLANS25D || {};
  const fp = $('#fp');
  const fpTip = $('#fpTip');
  // floors that share a layout are browsed as one plan, not level by level
  const PLAN_GROUPS = [
    { key: 'A', name: 'Plan A', plans: ['floor1', 'L4'], home: 6 },
    { key: 'B', name: 'Plan B', plans: ['floor2', 'L15'], home: 5 },
    { key: 'PH', name: 'Penthouse', plans: ['L25'], home: 25 },
  ];
  PLAN_GROUPS.forEach((g) => (g.levels = Object.keys(floorsByLevel).map(Number).filter((l) => isActive(l) && g.plans.includes(floorsByLevel[l].plan)).sort((a, b) => a - b)));
  const groupOf = (l) => PLAN_GROUPS.find((g) => g.levels.includes(l));
  const levelsText = (ls) => {
    if (ls.length === 1) return `Level ${pad(ls[0])}`;
    const par = ls.filter((l) => l > 5 && l < 25);
    const kind = par.every((l) => l % 2 === 0) ? 'Even Floors · ' : par.every((l) => l % 2) ? 'Odd Floors · ' : '';
    return `${kind}Level ${pad(ls[0])} – ${pad(ls[ls.length - 1])}`;
  };
  const codeOf = (u) => `${(groupOf(state.level) || { key: '' }).key}-${u.id}`;
  $('#fpTabs').innerHTML = PLAN_GROUPS.filter((g) => g.levels.length).map((g) => `<button role="tab" data-action="group" data-g="${g.key}">${g.name}</button>`).join('');
  const TEMPLATE = { floor1: 'Master Floor Plan A', floor2: 'Master Floor Plan B', L3: 'Podium level plan', L4: 'Level 04 plan', L15: 'Level 15 plan', L25: 'Penthouse level plan' };
  const panel = $('#panel');
  const ARROW = '<svg class="arr" viewBox="0 0 16 10" aria-hidden="true"><path d="M0 5h14.5M10.5 1l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function planBox(f) {
    const m = f.map, px = PL[f.plan].px;
    return { x0: (px[0] - m.cx) / m.s, x1: (px[2] - m.cx) / m.s, z0: 8 - (m.frontY - px[1]) / m.s, z1: 8 - (m.frontY - px[3]) / m.s };
  }
  function thumbStyle(u, f) {
    if (!u.indicative && PL[u.kind]) return `background-image:url(${PL[u.kind].tex});${u.mirror ? 'transform:scaleX(-1);' : ''}`;
    const b = planBox(f), wImg = b.x1 - b.x0;
    return `background-image:url(${PL[f.plan].tex});background-size:${(wImg / u.w) * 100}% auto;background-position:${((u.x - b.x0) / (wImg - u.w)) * 100}% 60%;`;
  }

  function selectUnit(i, highlight = true) {
    const f = floorsByLevel[state.level];
    const n = f.units.length;
    state.ui = ((i % n) + n) % n; // loops through the residences of the floor
    const u = f.units[state.ui];
    three && three.setSelected(highlight ? state.ui : null); // opening a floor highlights nothing until the user picks
    const nav = $('#rnav');
    nav.classList.remove('swap'); void nav.offsetWidth; nav.classList.add('swap');
    $('#rnCode').textContent = codeOf(u);
    $('#rnName').textContent = u.name;
    $('#rnType').textContent = `${u.beds} Bedroom${u.kind === 'penthouse' ? ' Penthouse' : ''}`;
    $('#rnArea').innerHTML = `${u.nfa}<small> m²</small>`;
    $('#rnDots').innerHTML = f.units.map((_, k) => `<i class="${k === state.ui ? 'on' : ''}"></i>`).join('');
  }
  function showTip(i, x, y) {
    if (i === null) { fpTip.classList.remove('on'); return; }
    const u = floorsByLevel[state.level].units[i];
    fpTip.innerHTML = `<b>${codeOf(u)}</b> <em>${u.name}</em><small>${u.typeLabel} · ${u.nfa} m²</small>`;
    fpTip.style.transform = `translate(${x}px, ${y}px)`;
    fpTip.classList.add('on');
  }

  // =====================================================================
  // NAVIGATION   building → master floor plan → residence
  // =====================================================================
  let threeLoading = null;
  function loadThree() {
    if (three) return Promise.resolve(three);
    if (!threeLoading) {
      threeLoading = Promise.all([
        import('three'), import('three/addons/controls/OrbitControls.js'),
        import('three/addons/lines/Line2.js'), import('three/addons/lines/LineMaterial.js'), import('three/addons/lines/LineGeometry.js'),
        import('three/addons/geometries/RoundedBoxGeometry.js'),
        import('three/addons/environments/RoomEnvironment.js'),
      ]).then(([T, O, L2, LM, LG, RB, RE]) => {
        three = initThree(T, { OrbitControls: O.OrbitControls, Line2: L2.Line2, LineMaterial: LM.LineMaterial, LineGeometry: LG.LineGeometry, RoundedBoxGeometry: RB.RoundedBoxGeometry, RoomEnvironment: RE.RoomEnvironment });
        return three;
      }).catch((err) => { console.error(err); toast('3D needs an internet connection'); });
    }
    return threeLoading;
  }
  function openFloor(level) {
    if (!isActive(level)) return;
    const f = floorsByLevel[level];
    const samePlan = floorsByLevel[state.level] && floorsByLevel[state.level].plan === f.plan;
    const fromUnit = state.view === 'unit';
    if (!(fromUnit && level === state.level) && !(state.view === 'floor' && samePlan)) state.ui = 0;
    state.level = level; state.unit = null;
    const grp = groupOf(level);
    document.querySelectorAll('#fpTabs button').forEach((b) => b.classList.toggle('active', !!grp && b.dataset.g === grp.key));
    // same three-line heading as the residence page: eyebrow · serif name · small caps type
    const parts = grp ? levelsText(grp.levels).split(' · ') : [`Level ${pad(level)}`];
    const count = `${f.units.length} ${f.units[0].kind === 'penthouse' ? 'Penthouses' : 'Residences'}`;
    $('#fpEyebrow').textContent = `Master Floor Plan · ${parts[parts.length - 1]}`;
    $('#fpName').textContent = grp ? grp.name : `Level ${pad(level)}`;
    $('#fpType').textContent = [count, ...parts.slice(0, -1)].join(' · ');
    state.view = 'floor'; app.dataset.view = 'floor';
    loadThree().then((t) => {
      if (!t || state.view !== 'floor' || state.level !== level) return;
      if (fromUnit) t.backToMaster(); else t.showMaster(f);
      selectUnit(Math.min(state.ui, f.units.length - 1), fromUnit);
    });
    selectUnit(Math.min(state.ui, f.units.length - 1), fromUnit);
  }
  function goTo(view) {
    if (view === 'building') {
      three && three.stop();
      state.view = 'building'; state.unit = null; app.dataset.view = 'building';
      setHeroLevel(state.level);
    }
  }
  function goBack() {
    if (state.view === 'unit') openFloor(state.level);
    else if (state.view === 'floor') goTo('building');
  }
  function openUnit() {
    if (state.view !== 'floor' || !three) return;
    const u = floorsByLevel[state.level].units[state.ui];
    state.unit = u; state.mode = '3d';
    state.view = 'unit'; app.dataset.view = 'unit';
    showTip(null);
    renderPanel(u);
    three.showUnit(state.ui);
  }
  function stepUnit(d) {
    if (state.view !== 'unit' || !three) return;
    const f = floorsByLevel[state.level];
    selectUnit(state.ui + d, false);
    const u = f.units[state.ui];
    state.unit = u; state.mode = '3d';
    renderPanel(u);
    three.swapUnit(state.ui);
  }
  function setUnitMode(mode) {
    if (state.view !== 'unit' || state.mode === mode || !three) return;
    state.mode = mode;
    three.setMode(mode);
    document.querySelectorAll('.seg button').forEach((b) => b.classList.toggle('active', b.dataset.action === 'mode' + mode));
  }
  function renderPanel(u) {
    const grp = groupOf(state.level);
    const lv = grp ? levelsText(grp.levels).split(' · ').pop() : `Level ${pad(state.level)}`;
    const fact = (v, l) => `<div><b>${v}</b><span>${l}</span></div>`;
    panel.innerHTML = `
      <button class="back" data-action="back"><svg viewBox="0 0 16 10" aria-hidden="true"><path d="M16 5H1.5M5.5 1l-4 4 4 4" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>Back to Floor Plan</button>
      <header class="rs-head">
        <p class="rs-eyebrow">RESIDENCE ${codeOf(u)} · ${lv}</p>
        <h2 class="rs-name">${u.name}</h2>
        <p class="rs-type">${u.typeLabel} Residence</p>
      </header>
      <div class="rs-ctl">
        <div class="seg" role="tablist">
          <button class="active" data-action="mode3d">3D View</button>
          <button data-action="mode2d">Top View</button>
        </div>
        <i></i>
        <button class="rs-reset" data-action="resetcam"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 2v3h-3" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>Reset Camera</button>
      </div>
      <footer class="rs-foot">
        <div class="rs-info">
        <div class="rs-nav">
          <button class="rn-btn" data-action="uprev" aria-label="Previous residence"><svg viewBox="0 0 16 10"><path d="M16 5H1.5M5.5 1l-4 4 4 4" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>Previous</button>
          <p class="rn-dots">${floorsByLevel[state.level].units.map((_, k) => `<i class="${k === state.ui ? 'on' : ''}"></i>`).join('')}</p>
          <button class="rn-btn" data-action="unext" aria-label="Next residence">Next<svg viewBox="0 0 16 10"><path d="M0 5h14.5M10.5 1l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        </div>
        <div class="rs-facts">
          ${fact(`${u.nfa}<small> m²</small>`, 'Interior (NFA)')}
          ${fact(`${u.gfa}<small> m²</small>`, 'Gross (GFA)')}
          ${fact(u.beds, 'Bedrooms')}
          ${u.indicative ? '' : fact(u.baths, 'Bathrooms')}
        </div>
        ${u.indicative ? `<p class="rs-note">Indicative layout — shown with the closest residence type.</p>` : ''}
        </div>
        <a class="pill-solid" href="#" data-action="consult">Request a Consultation ${ARROW}</a>
      </footer>`;
  }

  // =====================================================================
  // THREE
  // =====================================================================
  function initThree(T, X) {
    const canvas = $('#three');
    const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    const scene = new T.Scene();

    // ~3000K: warm key light from the top-left, soft sky fill, a little warm bounce
    // soft studio environment: gives stone, timber, glass and metal something to reflect (image-based fill light)
    { const pm = new T.PMREMGenerator(renderer); scene.environment = pm.fromScene(new X.RoomEnvironment(), 0.04).texture; pm.dispose(); }
    const hemi = new T.HemisphereLight(0xfffaf3, 0x51483f, 0.5);
    scene.add(hemi);
    const key = new T.DirectionalLight(0xfff1e2, 1.45);
    key.castShadow = true;
    key.shadow.mapSize.set(4096, 4096);
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.02;
    key.shadow.radius = 7; key.shadow.blurSamples = 16;
    key.shadow.intensity = 0.62;
    scene.add(key, key.target);

    // ---- cameras: strict top-down orthographic for the master plan, perspective for the residence
    const ortho = new T.OrthographicCamera(-1, 1, 1, -1, 0.1, 500);
    ortho.up.set(0, 0, -1);           // +x right, +z (river) down on screen
    const persp = new T.PerspectiveCamera(32, 1, 0.3, 800);
    let camera = ortho;
    const controls = new X.OrbitControls(persp, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.enabled = false;

    // ---- shared materials (one definition, used by every module)
    const std = (color, roughness, extra = {}) => new T.MeshStandardMaterial({ color, roughness, metalness: 0, ...extra });
    const M = {
      wall: std(0xf7f5f1, 0.88),
      wallTop: std(0xf7f2ea, 0.9),
      furniture: std(0xe9e1d4, 0.95),
      slab: std(0xe9e5de, 0.9),
      // furniture palette: neutral fabric, natural oak, stone tops, white ceramic, dark bronze metal
      fabric: std(0xd9d2c7, 1), fabricDark: std(0xa89e90, 1), linen: std(0xf3f0ea, 0.95),
      oak: std(0x8f6b4a, 0.7), oakDark: std(0x5e4532, 0.7), stoneTop: std(0xe9e5dd, 0.45),
      ceramic: std(0xf7f6f3, 0.25), metal: std(0x2e2823, 0.45, { metalness: 0.6 }),
      core: std(0xb9b1a4, 0.9),
      coreWall: std(0xf4efe6, 0.92),
      water: std(0x6cc6dc, 0.08, { emissive: 0x1d6f82, emissiveIntensity: 0.35, transparent: true, opacity: 0.94 }),
      planter: std(0x55693f, 1),
      glass: new T.MeshStandardMaterial({ color: 0xd8e6ee, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.25, depthWrite: false }),
      frame: std(0x8a6b45, 0.4, { metalness: 0.6 }),
    };
    const WALL_H = 2.4, SLAB = 0.45;

    const shapeOf = (p) => {
      const s = new T.Shape(p.o.map(([x, y]) => new T.Vector2(x, y)));
      p.h.forEach((h) => s.holes.push(new T.Path(h.map(([x, y]) => new T.Vector2(x, y)))));
      return s;
    };
    // polygons in (x, z) → extruded upwards from y0 to y0+h
    function extrude(list, h, y0 = 0) {
      if (!list.length) return null;
      const g = new T.ExtrudeGeometry(list.map(shapeOf), { depth: h, bevelEnabled: false, curveSegments: 1 });
      g.rotateX(Math.PI / 2);
      g.translate(0, h + y0, 0);
      g.computeVertexNormals();
      return g;
    }
    function mesh(geo, mat, cast = true) {
      if (!geo) return null;
      const m = new T.Mesh(geo, mat);
      m.castShadow = cast; m.receiveShadow = true;
      return m;
    }

    // ---------------------------------------------------------------- modules (lazy, cached)
    // each drawn piece keeps its drawn outline; its type (read from the room it stands in and its size) sets height & finish
    const FURN = {
      bed:      [[0, 0.28, 'oakDark'], [0.28, 0.52, 'linen']],
      wardrobe: [[0, 2.1, 'oak']],
      counter:  [[0, 0.86, 'oakDark'], [0.86, 0.9, 'stoneTop']],
      fixture:  [[0, 0.5, 'ceramic']],
      seat:     [[0, 0.42, 'fabric']],
      small:    [[0, 0.48, 'fabricDark']],
      lounger:  [[0, 0.32, 'linen']],
      glass:    [[0, 2.3, 'glass']],
    };
    function furnitureParts(list) {
      const out = [];
      Object.entries(FURN).forEach(([type, layers]) => {
        const polysOf = list.filter((f) => f.k === type).flatMap((f) => f.p);
        if (!polysOf.length) return;
        layers.forEach(([y0, y1, mat]) => out.push({ geo: extrude(polysOf, y1 - y0, y0 + 0.01), mat: M[mat], cast: mat !== 'glass' }));
      });
      return out;
    }
    // detail level, built only when entering a residence: balustrades and warm room lights
    function detailFor(kind) {
      if (HAND[kind]) return HAND[kind].lights(T);
      const D_ = MOD.units[kind];
      const g = new T.Group();
      const bar = (x0, z0, x1, z1, y, h, t) => {
        const len = Math.hypot(x1 - x0, z1 - z0);
        const m = new T.Mesh(new T.BoxGeometry(len, h, t), M.metal);
        m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2);
        m.rotation.y = -Math.atan2(z1 - z0, x1 - x0);
        m.castShadow = true;
        g.add(m);
      };
      D_.rails.forEach(([[x0, z0], [x1, z1]]) => {
        bar(x0, z0, x1, z1, 1.05, 0.05, 0.05);
        const n = Math.max(1, Math.round(Math.hypot(x1 - x0, z1 - z0) / 0.12));
        for (let i = 0; i <= n; i++) { const t = i / n; bar(x0 + (x1 - x0) * t, z0 + (z1 - z0) * t, x0 + (x1 - x0) * t + 0.001, z0 + (z1 - z0) * t, 0.52, 1.04, 0.02); }
      });
      D_.lights.forEach(([x, z, a]) => {
        const l = new T.PointLight(0xffd2a0, Math.min(14, 3 + a * 0.25), Math.sqrt(a) * 2.2, 2);
        l.position.set(x, 2.0, z);
        g.add(l);
      });
      return g;
    }
    const unitModules = {}; // kind → { parts: [{geo, mat}], w, d }
    function unitModule(kind) {
      if (unitModules[kind]) return unitModules[kind];
      // hand-built residences replace the traced module, same local frame
      if (HAND[kind]) return (unitModules[kind] = { proto: HAND[kind].build(T, X), w: HAND[kind].w, d: HAND[kind].d });
      const D_ = MOD.units[kind];
      const tex = new T.TextureLoader().load(D_.floor, () => (dirty = true));
      tex.colorSpace = T.SRGBColorSpace;
      tex.anisotropy = 8;
      const floorMat = std(0xffffff, 0.85, { map: tex, transparent: true, alphaTest: 0.5 });
      const floorGeo = new T.PlaneGeometry(D_.w, D_.d);
      floorGeo.rotateX(-Math.PI / 2);
      floorGeo.translate(D_.w / 2, 0.01, D_.d / 2);
      const parts = [
        { geo: extrude(D_.slab, SLAB, -SLAB), mat: M.slab, cast: false },
        { geo: floorGeo, mat: floorMat, cast: false },
        { geo: extrude(D_.walls, WALL_H), mat: M.wall },
        ...furnitureParts(D_.fur),
        { geo: extrude(D_.pool, 0.04, -0.02), mat: M.water, cast: false },
        { geo: extrude(D_.planters, 0.55), mat: M.planter },
      ].filter((p) => p.geo);
      return (unitModules[kind] = { parts, w: D_.w, d: D_.d, floorMat });
    }
    const coreModules = {};
    const coreFade = new T.MeshBasicMaterial({ color: 0xb9b0a4, transparent: true, opacity: 0.16, depthWrite: false });
    function coreModule(key) {
      if (coreModules[key]) return coreModules[key];
      const C = MOD.cores[key];
      // building areas outside the residences: only a soft, faded footprint so the eye stays on the homes
      const parts = [{ geo: extrude((window.DEFINE_FOOTPRINTS && window.DEFINE_FOOTPRINTS[key] ? window.DEFINE_FOOTPRINTS[key].map((o) => ({ o, h: [] })) : C.floor.map((q) => ({ o: q.o, h: [] }))), 0.04, -0.04), mat: coreFade, cast: false }].filter((p) => p.geo);
      return (coreModules[key] = { parts });
    }
    const instance = (mod) => {
      if (mod.proto) return mod.proto.clone();
      const g = new T.Group();
      mod.parts.forEach((p) => g.add(mesh(p.geo, p.mat, p.cast !== false)));
      return g;
    };

    // ---------------------------------------------------------------- assembly
    let floorObj = null; // { key, f, group, units: [{ group, hit, outline, tint, u }] }
    const goldLine = new X.LineMaterial({ color: 0xe0b872, linewidth: 2.6, transparent: true, opacity: 1, depthTest: false, dashed: true, dashSize: 1e5, gapSize: 1e-3 });
    const glowLine = new X.LineMaterial({ color: 0xe9b866, linewidth: 12, transparent: true, opacity: 0.32, depthTest: false, depthWrite: false });
    function assemble(f) {
      const group = new T.Group();
      // the building itself is not drawn: the residences are the focus
      const units = f.units.map((u, i) => {
        let g = null;
        if (MOD.units[u.kind] || HAND[u.kind]) { // variants borrow the closest hand-built residence
          const mod = unitModule(u.kind);
          g = instance(mod);
          // placement: exact slot from the floor plan; mirrored units reuse the same module with a mirror transform
          g.position.set(u.x + (u.mirror ? u.w : 0), 0, u.z);
          g.scale.set((u.mirror ? -1 : 1) * (u.w / mod.w), 1, 1);
          group.add(g);
        }
        // selection overlays follow the residence's real outline
        const H = HAND[u.kind];
        const poly = H && H.outline
          ? H.outline.map(([lx, lz]) => [u.mirror ? u.x + u.w - lx * (u.w / H.w) : u.x + lx * (u.w / H.w), u.z + lz])
          : (P25[f.plan] && P25[f.plan].units[u.id]) || [[u.x, u.z], [u.x + u.w, u.z], [u.x + u.w, u.z + u.d], [u.x, u.z + u.d]];
        const shape = new T.Shape(poly.map(([x, z]) => new T.Vector2(x, z)));
        const fillGeo = new T.ShapeGeometry(shape);
        fillGeo.rotateX(Math.PI / 2);
        const tint = new T.Mesh(fillGeo, new T.MeshBasicMaterial({ color: 0xffe2b0, blending: T.AdditiveBlending, transparent: true, opacity: 0, depthWrite: false, depthTest: false, side: T.DoubleSide }));
        tint.position.y = WALL_H + 0.05;
        tint.renderOrder = 5;
        group.add(tint);
        const hitGeo = fillGeo.clone();
        const hit = new T.Mesh(hitGeo, new T.MeshBasicMaterial({ visible: false, side: T.DoubleSide }));
        hit.position.y = WALL_H + 0.1;
        hit.userData.i = i;
        group.add(hit);
        const lg = new X.LineGeometry();
        lg.setPositions([...poly, poly[0]].flatMap(([x, z]) => [x, WALL_H + 0.12, z]));
        const outline = new X.Line2(lg, goldLine.clone());
        outline.computeLineDistances();
        outline.visible = false;
        outline.renderOrder = 6;
        group.add(outline);
        const glow = new X.Line2(lg, glowLine.clone());
        glow.visible = false; glow.renderOrder = 5;
        group.add(glow);
        const perim = poly.reduce((a, p, k) => { const q = poly[(k + 1) % poly.length]; return a + Math.hypot(q[0] - p[0], q[1] - p[1]); }, 0);
        return { g, hit, outline, glow, tint, u, poly, perim, glowLevel: 0 };
      });
      scene.add(group);
      // bounds for framing and shadows
      const bb = new T.Box3();
      units.forEach((x) => x.poly.forEach(([px, pz]) => bb.expandByPoint(new T.Vector3(px, 0, pz))));
      return { key: f.plan, f, group, units, bb };
    }
    function disassemble(obj) {
      if (!obj) return;
      scene.remove(obj.group);
      // module geometry is shared and kept; only the per-floor overlays are freed
      obj.units.forEach((x) => { x.tint.geometry.dispose(); x.tint.material.dispose(); x.hit.geometry.dispose(); x.outline.geometry.dispose(); x.outline.material.dispose(); x.glow.material.dispose(); });
    }

    // ---------------------------------------------------------------- framing
    const stageRect = () => {
      const head = document.querySelector('.fp-head').getBoundingClientRect();
      const nav = document.querySelector('.rnav').getBoundingClientRect();
      const top = head.bottom + 20, bottom = nav.top - 20;
      return { left: innerWidth * 0.045, right: innerWidth * 0.955, top: top + 10, bottom: bottom - 10 };
    };
    function frameOrtho() {
      if (!floorObj) return;
      const b = floorObj.bb, r = stageRect();
      const W = innerWidth, H = innerHeight;
      const k = Math.min((r.right - r.left) / (b.max.x - b.min.x), (r.bottom - r.top) / (b.max.z - b.min.z)); // px per metre
      const cx = (b.min.x + b.max.x) / 2, cz = (b.min.z + b.max.z) / 2;
      const sx = (r.left + r.right) / 2, sy = (r.top + r.bottom) / 2;
      ortho.left = -sx / k; ortho.right = (W - sx) / k; ortho.top = sy / k; ortho.bottom = -(H - sy) / k;
      ortho.position.set(cx, 120, cz);
      ortho.lookAt(cx, 0, cz);
      ortho.updateProjectionMatrix();
      key.position.set(cx - 18, 90, cz - 14); // high sun: short, soft contact shadows that keep the plan readable
      key.target.position.set(cx, 0, cz);
      const half = Math.max(b.max.x - b.min.x, b.max.z - b.min.z) / 2 + 6;
      Object.assign(key.shadow.camera, { left: -half, right: half, top: half, bottom: -half, near: 1, far: 300 });
      key.shadow.camera.updateProjectionMatrix();
      dirty = true;
    }

    // ---------------------------------------------------------------- selection
    let sel = 0, hot = null;
    function paint() {
      if (!floorObj) return;
      floorObj.units.forEach((x, i) => {
        // only hover is drawn; the current residence is shown in the navigator, not on the plan
        const h = i === hot || i === sel;
        x.outline.visible = h;
        x.outline.material.opacity = 0.85;
        if (!x.anim) {
          x.glowLevel = 0; x.outline.material.dashSize = 1e5;
          x.tint.material.opacity = h ? 0.12 : 0;
        }
        x.glow.visible = x.glowLevel > 0.001;
        x.glow.material.opacity = x.glowLevel;
      });
      dirty = true;
    }
    // the residence picked with Previous / Next gets the same light treatment as hover (line draws around, soft glow)
    function setSelected(i) {
      const prev = sel; sel = i;
      if (prev !== null && prev !== i && prev !== hot) stopDraw(prev);
      paint();
      if (i !== null && i !== prev && i !== hot && mode === 'master') drawIn(i);
    }
    // hover: the gold line travels once around the residence; where its two ends meet, a halo blooms
    function drawIn(i) {
      if (!floorObj || i === null) return;
      const x = floorObj.units[i];
      if (x.anim) x.anim.kill();
      const m = x.outline.material, st = { t: 0 };
      m.gapSize = x.perim * 2; m.dashOffset = 0; m.dashSize = 0.001;
      x.glowLevel = 0; x.glow.visible = false;
      x.tint.material.opacity = 0;
      const tint = { o: 0 }, setT = () => { x.tint.material.opacity = tint.o; };
      x.anim = gsap.timeline({ onUpdate: () => { dirty = true; } })
        .to(st, { t: 1, duration: 1.7, ease: 'power1.inOut', onUpdate: () => { m.dashSize = Math.max(0.001, x.perim * st.t); } })
        .add(() => { m.dashSize = 1e5; })
        // the residence itself lights up softly once the line has closed
        .to(tint, { o: 0.24, duration: 0.6, ease: 'sine.out', onUpdate: setT })
        .to(tint, { o: 0.12, duration: 1.1, ease: 'sine.inOut', onUpdate: setT })
        .add(() => { x.anim = null; paint(); });
    }
    function stopDraw(i) {
      if (!floorObj || i === null || i === undefined) return;
      const x = floorObj.units[i];
      if (x && x.anim) { x.anim.kill(); x.anim = null; }
    }

    // ---------------------------------------------------------------- views
    let mode = 'master', running = false, dirty = true, focus = null, fadeT = [];
    function showMaster(f) {
      if (!floorObj || floorObj.key !== f.plan) {
        disassemble(floorObj);
        floorObj = assemble(f);
      } else floorObj.f = f;
      mode = 'master'; camera = ortho; controls.enabled = false;
      floorObj.group.visible = true;
      frameOrtho();
      paint();
      start();
    }
    // isolate the selected module, switch to the cutaway camera
    // wall tops: dark poché on the master plan (reads as a drawing), ivory plaster inside the residence showcase
    const setCaps = (unit) => (window.DEFINE_HAND_CAPS || []).forEach((m) => m.color.set(unit ? 0xf6f0e4 : 0x4a443d));
    // switch to another residence of the same floor while staying in the 3D view
    function swapUnit(i) {
      if (!floorObj || !focus) return showUnit(i);
      // cross-fade: the current residence fades out, the next one appears in place and fades in (no camera travel)
      gsap.killTweensOf(canvas);
      gsap.to(canvas, { opacity: 0, duration: 0.28, ease: 'power1.out', onComplete: () => {
        if (focus.extra) { scene.remove(focus.extra); focus.extra.traverse((o) => o.geometry && o.geometry.dispose()); }
        showUnit(i, true);
        gsap.to(canvas, { opacity: 1, duration: 0.6, ease: 'power1.inOut', delay: 0.05, onComplete: () => (canvas.style.opacity = '') });
      } });
    }
    function showUnit(i, keep) {
      if (!floorObj) return;
      focus = floorObj.units[i];
      floorObj.units.forEach((x, k) => stopDraw(k));
      mode = 'unit';
      setCaps(true);
      hot = null; paint();
      focus.outline.visible = false; focus.tint.material.opacity = 0;
      const u = focus.u;
      floorObj.group.children.forEach((c) => (c.visible = c === focus.g));
      const extra = new T.Group(); // detail level, only while inside the residence
      if (focus.g) {
        const det = detailFor(u.kind);
        det.position.copy(focus.g.position); det.scale.copy(focus.g.scale);
        extra.add(det);
      } else {
        // residence without its own drawing: show its part of the shared floor plan
      }
      scene.add(extra);
      focus.extra = extra;
      const c = new T.Vector3(u.x + u.w / 2, 0, u.z + u.d / 2);
      const span = Math.max(u.w, u.d * 1.5);
      // start the perspective camera where the top-down view was, then move to the axonometric cutaway
      camera = persp;
      controls.target.copy(c);
      if (keep) {
        // place the camera directly in its final framing
        fadeT.forEach((x) => x.kill());
        const t = cutaway(c, span, 'unit');
        persp.position.copy(t.pos); vo.x = t.ox; vo.y = t.oy || 0;
        controls.enabled = true;
      } else {
        persp.position.set(c.x, span * 2.6, c.z + 0.01);
        flyTo(cutaway(c, span, 'unit'), 1.4);
      }
      controls.minDistance = span * 0.35; controls.maxDistance = span * 3.2;
      controls.maxPolarAngle = 1.42; controls.enableRotate = true;
      key.position.set(c.x - 25, 60, c.z - 20); key.target.position.copy(c);
      Object.assign(key.shadow.camera, { left: -span, right: span, top: span, bottom: -span });
      key.shadow.camera.updateProjectionMatrix();
    }
    function cutaway(c, span, m) {
      // the residence sits at the centre of the whole viewport, in the band between the heading and the info block
      const u = focus.u, W = innerWidth, H = innerHeight;
      const head = document.querySelector('.rs-head'), foot = document.querySelector('.rs-foot');
      const top = (head ? head.getBoundingClientRect().bottom : 200) + 24, bottom = (foot ? foot.getBoundingClientRect().top : H - 260) - 24;
      const e = T.MathUtils.degToRad(m === 'top' ? 89.4 : 46), a = T.MathUtils.degToRad(m === 'top' ? 0 : -12);
      const ca = Math.abs(Math.cos(a)), sa = Math.abs(Math.sin(a));
      const horiz = u.w * ca + u.d * sa, vert = (u.d * ca + u.w * sa) * Math.sin(e) + WALL_H * Math.cos(e);
      const k = Math.min((W * 0.74) / horiz, ((bottom - top) * (m === 'top' ? 0.9 : 1.12)) / vert); // px per metre (a little air above and below)
      const dist = H / (2 * Math.tan(T.MathUtils.degToRad(persp.fov / 2)) * k);
      return { pos: new T.Vector3(c.x + Math.sin(a) * Math.cos(e) * dist, Math.sin(e) * dist, c.z + Math.cos(a) * Math.cos(e) * dist), ox: 0, oy: H / 2 - (top + bottom) / 2 };
    }
    const vo = { x: 0, y: 0 };
    function flyTo(t, dur) {
      fadeT.forEach((x) => x.kill());
      controls.enabled = false;
      fadeT = [
        gsap.to(persp.position, { x: t.pos.x, y: t.pos.y, z: t.pos.z, duration: dur, ease: 'power3.inOut', onComplete: () => { controls.enabled = true; } }),
        gsap.to(vo, { x: t.ox, y: t.oy || 0, duration: dur, ease: 'power3.inOut' }),
      ];
    }
    function setMode(m) {
      if (!focus) return;
      const u = focus.u;
      const c = new T.Vector3(u.x + u.w / 2, 0, u.z + u.d / 2);
      controls.enableRotate = m !== '2d'; // top view stays a strict plan view: zoom only, no orbiting
      flyTo(cutaway(c, Math.max(u.w, u.d * 1.5), m === '2d' ? 'top' : 'unit'), 1.0);
    }
    // back: restore the assembled floor exactly as it was (nothing rebuilt)
    function backToMaster() {
      if (focus && focus.extra) { scene.remove(focus.extra); focus.extra.traverse((o) => o.geometry && o.geometry.dispose()); }
      focus = null;
      fadeT.forEach((x) => x.kill()); vo.x = 0; vo.y = 0;
      if (floorObj) floorObj.group.children.forEach((c) => (c.visible = true));
      mode = 'master'; camera = ortho; controls.enabled = false;
      setCaps(false);
      frameOrtho(); paint(); start();
    }

    // ---------------------------------------------------------------- picking (master view)
    const ray = new T.Raycaster(), ndc = new T.Vector2();
    function pick(e) {
      ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
      ray.setFromCamera(ndc, ortho);
      const h = ray.intersectObjects(floorObj.units.map((x) => x.hit), false)[0];
      return h ? h.object.userData.i : null;
    }
    canvas.addEventListener('pointermove', (e) => {
      if (mode !== 'master' || !floorObj || state.view !== 'floor') return;
      const i = pick(e);
      canvas.style.cursor = i !== null ? 'pointer' : '';
      if (i !== hot) { stopDraw(hot); hot = i; paint(); drawIn(i); }
      if (i === null) showTip(null);
      else {
        // tooltip above the residence's top edge
        const x = floorObj.units[i];
        const top = Math.min(...x.poly.map((p) => p[1]));
        const cx = (Math.min(...x.poly.map((p) => p[0])) + Math.max(...x.poly.map((p) => p[0]))) / 2;
        const v = new T.Vector3(cx, WALL_H, top).project(ortho);
        showTip(i, ((v.x + 1) / 2) * innerWidth, ((1 - v.y) / 2) * innerHeight);
      }
    });
    canvas.addEventListener('pointerleave', () => { if (mode === 'master') { stopDraw(hot); hot = null; paint(); showTip(null); } });
    canvas.addEventListener('click', (e) => {
      if (mode !== 'master' || !floorObj || state.view !== 'floor') return;
      const i = pick(e);
      if (i !== null) { selectUnit(i); openUnit(); } // a click goes straight into the residence
    });

    // ---------------------------------------------------------------- loop (renders only when something changed in the master view)
    function resize() {
      renderer.setSize(innerWidth, innerHeight, false);
      persp.aspect = innerWidth / innerHeight;
      persp.updateProjectionMatrix();
      goldLine.resolution.set(innerWidth, innerHeight);
      if (floorObj) floorObj.units.forEach((x) => { x.outline.material.resolution.set(innerWidth, innerHeight); x.glow.material.resolution.set(innerWidth, innerHeight); });
      if (mode === 'master') frameOrtho();
      dirty = true;
    }
    window.addEventListener('resize', resize);
    function start() { if (!running) { running = true; requestAnimationFrame(loop); } dirty = true; }
    function stop() { running = false; }
    function loop() {
      if (!running) return;
      requestAnimationFrame(loop);
      if (mode === 'unit') {
        persp.setViewOffset(innerWidth, innerHeight, vo.x, vo.y, innerWidth, innerHeight);
        controls.update();
        renderer.render(scene, persp);
      } else if (dirty) {
        dirty = false;
        floorObj && floorObj.units.forEach((x) => { x.outline.material.resolution.set(innerWidth, innerHeight); x.glow.material.resolution.set(innerWidth, innerHeight); });
        renderer.render(scene, ortho);
      }
    }
    resize();
    window.__define = { scene, ortho, persp, renderer };
    return { showMaster, showUnit, swapUnit, backToMaster, setSelected, setMode, stop };
  }
})();

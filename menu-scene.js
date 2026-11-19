import * as THREE from './assets/vendor/three.module.js';

// A tactile carousel of illustrative cake models. Horizontal cuts open into
// three independent sections; original portfolio photographs remain in the UI.
const KINDS = ['floral', 'chocolate', 'rainbow', 'gift'];
const clamp = THREE.MathUtils.clamp;
const smooth = value => { const t = clamp(value, 0, 1); return t * t * (3 - 2 * t); };
const sphere = new THREE.SphereGeometry(1, 24, 16);
const cylinder = (r, h) => new THREE.CylinderGeometry(r, r * 1.008, h, 80, 1);

function mesh(parent, geometry, material, x = 0, y = 0, z = 0) {
  const result = new THREE.Mesh(geometry, material);
  result.position.set(x, y, z); parent.add(result); return result;
}
function ball(parent, material, x, y, z, sx, sy = sx, sz = sx) {
  const result = mesh(parent, sphere, material, x, y, z);
  result.scale.set(sx, sy, sz); return result;
}
function surface(color, roughness = .56, metalness = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}
function grainTexture(dark = false, frosting = false) {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = frosting ? '#ededed' : dark ? '#65412b' : '#dfb873'; ctx.fillRect(0, 0, 512, 512);
  let seed = 27; const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (let i = 0; i < 12500; i++) {
    const value = random(); ctx.fillStyle = frosting ? `rgba(80,80,80,${value * .1})` : dark ? (value > .5 ? '#956a42' : '#3d241b') : (value > .5 ? '#f5d99c' : '#ae813f');
    ctx.globalAlpha = frosting ? .4 : .15 + random() * .38;
    ctx.beginPath(); ctx.ellipse(random() * 512, random() * 512, .5 + random() * (frosting ? 1.5 : 3), .4 + random() * 2, random() * 3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(2, 2); return texture;
}
const frostingTexture = grainTexture(false, true);
const lightCrumb = grainTexture(false), darkCrumb = grainTexture(true);

function rose(parent, x, y, z, radius, color) {
  const group = new THREE.Group(); group.position.set(x, y, z); parent.add(group);
  const material = surface(color, .65);
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 7; i++) {
      const angle = i / 7 * Math.PI * 2 + row * .42;
      const r = radius * (.2 + row * .22);
      const petal = ball(group, material, Math.cos(angle) * r, row * -.025, Math.sin(angle) * r, radius * .48, radius * .21, radius * .28);
      petal.rotation.y = -angle; petal.rotation.z = .2;
    }
  }
  ball(group, material, 0, .025, 0, radius * .21, radius * .25, radius * .21);
  return group;
}

function buildCake(kind) {
  const holder = new THREE.Group(), cake = new THREE.Group(); holder.add(cake);
  const segments = [], caps = [];
  const colors = {
    floral: ['#fff4dc', '#eaa5b6', '#9d3e5c'],
    chocolate: ['#46271e', '#71402d', '#be8c47'],
    rainbow: ['#fff4d8', '#edb4ba', '#aabb79'],
    gift: ['#e8d5e4', '#e2a1b8', '#9f5d83']
  }[kind];
  const cream = surface(colors[0], kind === 'chocolate' ? .3 : .67);
  cream.bumpMap = frostingTexture; cream.bumpScale = .025;
  const pipe = surface(colors[1], .53), gold = surface('#c0a06a', .28, .72);
  const board = mesh(cake, cylinder(kind === 'gift' ? 1.32 : 1.15, .065), gold, 0, -.86, 0);
  const radii = kind === 'floral' ? [1, .79, .57] : kind === 'gift' ? [.9, .9, .9] : [1.04, 1.04, 1.04];
  const heights = kind === 'floral' ? [.58, .52, .49] : [.36, .36, .36];
  let bottom = -.82;
  for (let i = 0; i < 3; i++) {
    const segment = new THREE.Group(); segment.position.y = bottom + heights[i] / 2; segment.userData.homeY = segment.position.y; cake.add(segment);
    const r = radii[i], h = heights[i]; mesh(segment, cylinder(r, h), cream);
    const crumb = new THREE.MeshStandardMaterial({ map: kind === 'chocolate' ? darkCrumb : lightCrumb, roughness: .96, transparent: true, opacity: 0, depthWrite: false });
    const cap = mesh(segment, new THREE.CircleGeometry(r * .982, 80), crumb, 0, h / 2 + .006, 0); cap.rotation.x = -Math.PI / 2; caps.push(cap);
    const lowerCap = mesh(segment, new THREE.CircleGeometry(r * .98, 80), crumb, 0, -h / 2 - .005, 0); lowerCap.rotation.x = Math.PI / 2;
    // Fine frosting ridges wrap each section instead of a perfectly smooth tube.
    for (let j = 0; j < 5; j++) {
      const ring = mesh(segment, new THREE.TorusGeometry(r + .003, .008, 6, 80), cream, 0, -.4 * h + j * h / 5, 0); ring.rotation.x = Math.PI / 2;
    }
    if (kind === 'floral' || i === 2) {
      for (let j = 0; j < 40; j++) { const a = j * Math.PI / 20; ball(segment, pipe, Math.cos(a) * r, h / 2 + .015, Math.sin(a) * r, .043, .05, .043); }
    }
    segments.push(segment); bottom += h;
  }
  const top = segments[2], topY = heights[2] / 2;
  if (kind === 'floral') {
    for (let i = 0; i < 5; i++) { const a = i * 1.23; rose(top, Math.cos(a) * .34, topY + .035, Math.sin(a) * .29, .16, i % 2 ? '#efb1be' : '#ad4d68'); }
    segments.forEach((s, i) => { rose(s, radii[i] * .91, heights[i] * .1, .23, .18, colors[1]); const leaf = ball(s, surface('#718366'), radii[i] * .96, -.1, .16, .19, .026, .08); leaf.rotation.z = .55; });
  } else if (kind === 'chocolate') {
    for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; ball(top, pipe, Math.cos(a) * 1.04, topY - .06 - (i % 3) * .02, Math.sin(a) * 1.04, .06, .13 + (i % 4) * .02, .06); }
    for (let i = 0; i < 9; i++) {
      const a = i * 2.4; const chocolate = mesh(top, new THREE.BoxGeometry(.22, .33, .07), surface('#2f1a15', .36), Math.cos(a) * .65, topY + .17, Math.sin(a) * .6); chocolate.rotation.set(.2, a, -.25 + (i % 3) * .25);
      ball(top, gold, Math.cos(a + .4) * .75, topY + .035, Math.sin(a + .4) * .75, .022);
    }
    const ribbon = mesh(segments[0], new THREE.TorusGeometry(1.05, .019, 8, 80), gold, 0, -.08, 0); ribbon.rotation.x = Math.PI / 2;
  } else if (kind === 'rainbow') {
    const rainbow = ['#dc8ea8', '#e8ba75', '#b7c98c', '#89b9bf', '#b0a0c8', '#e7bccd'];
    segments.forEach((s, i) => { for (let j = 0; j < 2; j++) mesh(s, cylinder(1.049, .178), surface(rainbow[i * 2 + j]), 0, -.09 + j * .18, 0); });
    rainbow.slice(0, 5).forEach((color, i) => mesh(top, new THREE.TorusGeometry(.35 + i * .085, .045, 10, 48, Math.PI), surface(color), 0, topY + .03, -.08));
    [-1, 1].forEach(side => { for (let i = 0; i < 3; i++) ball(top, cream, side * (.55 + i * .085), topY + .02, .02, .11); });
  } else {
    // A cake-and-flowers study on a larger gift board, with a physical ribbon.
    for (let i = 0; i < 5; i++) { const a = i * 1.24; rose(top, Math.cos(a) * .52, topY + .02, Math.sin(a) * .45, .22, i % 2 ? '#ead5d3' : '#c7819a'); }
    const ribbon = mesh(segments[1], new THREE.TorusGeometry(.913, .028, 8, 80), gold); ribbon.rotation.x = Math.PI / 2;
    for (const side of [-1, 1]) { const loop = mesh(top, new THREE.TorusGeometry(.16, .027, 10, 28), gold, side * .15, topY + .13, .55); loop.scale.set(1, .55, 1); loop.rotation.z = side * .5; }
  }
  return { holder, cake, segments, caps, board, kind, explode: 0, x: 0, targetX: 0, targetScale: 1, rotation: -.27, targetRotation: -.27 };
}

export function cakeScene(container) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setClearColor(0, 0); renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.2;
  renderer.domElement.setAttribute('role', 'img'); renderer.domElement.setAttribute('aria-label', 'Three-dimensional cake carousel; selected cake can separate into three illustrative sections.');
  container.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-5, 5, 2.6, -2.6, .1, 100); camera.position.set(0, 3.1, 9); camera.lookAt(0, 0, 0);
  scene.add(new THREE.HemisphereLight('#fff8e8', '#a57779', 3));
  const key = new THREE.DirectionalLight('#fff0db', 4); key.position.set(-5, 7, 6); scene.add(key);
  const rim = new THREE.DirectionalLight('#ffe5f1', 2); rim.position.set(4, 4, -3); scene.add(rim);
  const models = KINDS.map(buildCake); models.forEach(m => scene.add(m.holder));
  // Soft radial contact shadows remain grounded as the cake sections lift.
  const c = document.createElement('canvas'); c.width = c.height = 128; const ctx = c.getContext('2d'); const gradient = ctx.createRadialGradient(64, 64, 1, 64, 64, 64); gradient.addColorStop(0, '#65433055'); gradient.addColorStop(1, '#65433000'); ctx.fillStyle = gradient; ctx.fillRect(0, 0, 128, 128);
  const shadowMaterial = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false });
  models.forEach(m => { m.shadow = mesh(m.holder, new THREE.PlaneGeometry(3.1, 2.4), shadowMaterial, 0, -1.23, 0); m.shadow.rotation.x = -Math.PI / 2; });
  let selected = 0, exploded = false, visible = true, hidden = false, disposed = false, dirty = true, span = 3.5, raf;
  function targets() {
    models.forEach((m, i) => { let offset = (i - selected + 4) % 4; if (offset === 3) offset = -1; m.targetX = offset * span * (exploded ? 1.8 : 1); m.targetScale = offset === 0 ? 1 : .9; m.holder.visible = offset !== 2; }); dirty = true;
  }
  function resize() {
    const w = container.clientWidth, h = container.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h); const aspect = w / h;
    // At phone width, preserve the readable centre product and crop neighbours.
    const height = aspect < 1.1 ? 4.55 / Math.max(aspect, .72) : 4.55;
    camera.left = -height * aspect / 2; camera.right = height * aspect / 2; camera.top = height / 2; camera.bottom = -height / 2; camera.updateProjectionMatrix();
    span = aspect < 1.1 ? 2.7 : Math.max(3.1, height * aspect * .39); targets(); dirty = true;
  }
  const observer = new ResizeObserver(resize); observer.observe(container);
  const visibility = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) dirty = true; }); visibility.observe(container);
  resize(); targets(); models.forEach(m => { m.x = m.targetX; m.holder.position.x = m.x; m.holder.scale.setScalar(m.targetScale); });
  function pose(m, e) {
    m.segments.forEach((section, i) => {
      const level = i - 1; section.position.y = section.userData.homeY + level * .62 * e;
      section.position.x = (i === 1 ? .09 : -.06) * e; section.rotation.z = (i - 1) * -.055 * e; section.rotation.y = level * .055 * e;
    });
    m.caps.forEach((cap, i) => { cap.material.opacity = i === 2 ? 0 : e; });
    m.board.position.y = -.86 - .63 * e; m.cake.position.y = -.02 - (m.kind === 'floral' ? .13 : 0); m.cake.rotation.y = m.rotation;
    m.shadow.material.opacity = .95 - e * .18;
  }
  let previous = performance.now();
  function frame(now) {
    if (disposed) return; const dt = Math.min((now - previous) / 1000, .05); previous = now;
    if (visible && !hidden && !document.hidden) {
      let moving = false; const damping = reduced.matches ? 1 : 1 - Math.exp(-dt * 7);
      models.forEach((m, i) => {
        const targetExplode = i === selected && exploded ? 1 : 0;
        const delta = Math.abs(m.x - m.targetX) + Math.abs(m.explode - targetExplode) + Math.abs(m.rotation - m.targetRotation) + Math.abs(m.holder.scale.x - m.targetScale);
        if (delta > .0005) moving = true;
        m.x += (m.targetX - m.x) * damping; m.explode += (targetExplode - m.explode) * damping; m.rotation += (m.targetRotation - m.rotation) * damping;
        m.holder.position.x = m.x; m.holder.scale.setScalar(m.holder.scale.x + (m.targetScale - m.holder.scale.x) * damping); pose(m, smooth(m.explode));
      });
      if (moving || dirty) { renderer.render(scene, camera); dirty = false; }
    }
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  return {
    set(kind) { const next = KINDS.indexOf(kind); if (next < 0) return; selected = next; models[selected].targetRotation = -.27; targets(); },
    turn() { models[selected].targetRotation += Math.PI / 3; dirty = true; },
    explode(value) { exploded = Boolean(value); targets(); },
    hide(value) { hidden = Boolean(value); container.style.visibility = hidden ? 'hidden' : 'visible'; if (!hidden) dirty = true; },
    dispose() { disposed = true; cancelAnimationFrame(raf); observer.disconnect(); visibility.disconnect(); const geometries = new Set(), materials = new Set(); scene.traverse(o => { if (o.isMesh) { geometries.add(o.geometry); materials.add(o.material); } }); geometries.forEach(g => { if (g !== sphere) g.dispose(); }); materials.forEach(m => m.dispose()); renderer.dispose(); renderer.domElement.remove(); }
  };
}

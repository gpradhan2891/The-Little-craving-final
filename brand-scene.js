import * as T from './assets/vendor/three.module.js';

// A material and motion study. The original logo face is retained exactly;
// the surrounding depth and the quadruped are procedural interpretations.
const clamp = T.MathUtils.clamp;
const smooth = value => { const v = clamp(value, 0, 1); return v * v * (3 - 2 * v); };
const sphereGeometry = new T.SphereGeometry(1, 36, 28);

function addMesh(parent, geometry, material, position = [0, 0, 0], scale = [1, 1, 1]) {
  const mesh = new T.Mesh(geometry, material);
  mesh.position.set(...position); mesh.scale.set(...scale);
  mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh);
  return mesh;
}
function ellipsoid(parent, material, x, y, z, sx, sy, sz) {
  return addMesh(parent, sphereGeometry, material, [x, y, z], [sx, sy, sz]);
}
function microTexture(size = 256, strength = 26) {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d'), data = ctx.createImageData(size, size);
  let seed = 32817;
  for (let i = 0; i < data.data.length; i += 4) {
    seed = (seed * 16807) % 2147483647;
    const n = 128 + (seed / 2147483647 - .5) * strength;
    data.data[i] = data.data[i + 1] = data.data[i + 2] = n; data.data[i + 3] = 255;
  }
  ctx.putImageData(data, 0, 0);
  const texture = new T.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = T.RepeatWrapping; texture.repeat.set(8, 8);
  return texture;
}
function material(color, roughness = .6, extra = {}) {
  return new T.MeshPhysicalMaterial({ color, roughness, ...extra });
}
function environment(renderer) {
  const room = new T.Scene(); room.background = new T.Color('#655b58');
  const panel = (position, scale, color, intensity = 3) => {
    const p = new T.Mesh(new T.BoxGeometry(...scale), new T.MeshBasicMaterial({ color: new T.Color(color).multiplyScalar(intensity) }));
    p.position.set(...position); room.add(p);
  };
  panel([-4, 3, 2], [.1, 5, 4], '#fff6e8', 4);
  panel([4, 2, 1], [.1, 4, 2], '#f6d7e4', 2);
  panel([0, 5, 0], [6, .1, 4], '#fffaf1', 4);
  panel([0, 0, -5], [5, 4, .1], '#ead9d3', .8);
  const generator = new T.PMREMGenerator(renderer);
  const result = generator.fromScene(room, .02);
  generator.dispose(); room.traverse(o => { o.geometry?.dispose(); o.material?.dispose(); });
  return result;
}
async function logoTextures() {
  const img = await new Promise((resolve, reject) => {
    const image = new Image(); image.onload = () => resolve(image); image.onerror = reject;
    image.src = 'assets/logo-master.png';
  });
  const width = Math.min(1400, img.width), height = Math.round(width * img.height / img.width);
  const base = document.createElement('canvas'); base.width = width; base.height = height;
  const ctx = base.getContext('2d'); ctx.drawImage(img, 0, 0, width, height);
  const original = ctx.getImageData(0, 0, width, height);
  const faceCanvas = document.createElement('canvas'); faceCanvas.width = width; faceCanvas.height = height;
  const cakeCanvas = document.createElement('canvas'); cakeCanvas.width = width; cakeCanvas.height = height;
  const faceCtx = faceCanvas.getContext('2d'), cakeCtx = cakeCanvas.getContext('2d');
  const face = new ImageData(new Uint8ClampedArray(original.data), width, height);
  const cake = new ImageData(new Uint8ClampedArray(original.data), width, height);
  // The exact cake illustration and pedestal occupy this region of the
  // supplied master. Full-size layers align pixel-for-pixel at rest.
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 4;
    const u = x / width, v = y / height;
    const region = u > .615 && u < .875 && v > .07 && v < .64;
    if (region) face.data[i + 3] = 0;
    else cake.data[i + 3] = 0;
  }
  faceCtx.putImageData(face, 0, 0); cakeCtx.putImageData(cake, 0, 0);
  const texture = canvas => { const t = new T.CanvasTexture(canvas); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4; return t; };
  return { face: texture(faceCanvas), cake: texture(cakeCanvas), complete: texture(base) };
}
function heartShape() {
  const shape = new T.Shape();
  shape.moveTo(0, -1.48);
  shape.bezierCurveTo(-.48, -1.20, -1.64, -.46, -1.66, .42);
  shape.bezierCurveTo(-1.72, 1.48, -.48, 1.62, 0, .83);
  shape.bezierCurveTo(.48, 1.65, 1.68, 1.51, 1.68, .46);
  shape.bezierCurveTo(1.65, -.43, .48, -1.17, 0, -1.48);
  return shape;
}
function curveMesh(parent, points, radius, mat) {
  return addMesh(parent, new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p => new T.Vector3(...p))), Math.max(16, points.length * 8), radius, 8, false), mat);
}
function makePug() {
  const root = new T.Group(), bodyRig = new T.Group(); root.add(bodyRig);
  const bump = microTexture(128, 45);
  const fur = material('#bb9874', .86, { bumpMap: bump, bumpScale: .018, sheen: .28, sheenColor: new T.Color('#e9d4b8'), sheenRoughness: .7 });
  const pale = material('#d4ba96', .85, { bumpMap: bump, bumpScale: .012, sheen: .24 });
  const dark = material('#362a24', .88, { bumpMap: bump, bumpScale: .008 });
  const muzzle = material('#4a3930', .84, { bumpMap: bump, bumpScale: .009 });
  const noseMaterial = material('#1a1310', .3, { clearcoat: .25 });
  const eyeMaterial = material('#130d08', .05, { clearcoat: 1, clearcoatRoughness: .03 });
  const rose = material('#913d53', .7), gold = material('#c5a469', .24, { metalness: .85 });

  // Anatomical axes: +X is forward, Y is vertical, Z spans the four feet.
  ellipsoid(bodyRig, fur, -.08, .55, 0, .50, .29, .26);
  ellipsoid(bodyRig, fur, .28, .57, 0, .28, .32, .28);
  ellipsoid(bodyRig, pale, .38, .53, 0, .12, .26, .23);
  ellipsoid(bodyRig, fur, -.40, .53, 0, .24, .28, .25);
  ellipsoid(bodyRig, pale, .44, .77, 0, .22, .23, .22);

  const head = new T.Group(); head.position.set(.51, .86, 0); bodyRig.add(head);
  ellipsoid(head, fur, .015, 0, 0, .27, .25, .255);
  ellipsoid(head, dark, .205, -.02, 0, .12, .19, .215);
  for (const side of [-1, 1]) {
    // Small wet eyes, fleshy brows and short folded ears, rather than toy eyes.
    ellipsoid(head, dark, .16, .035, side * .171, .105, .115, .092);
    ellipsoid(head, eyeMaterial, .213, .056, side * .184, .055, .061, .050);
    ellipsoid(head, material('#c2bca5', .12), .25, .079, side * .197, .009, .012, .009);
    ellipsoid(head, muzzle, .247, -.075, side * .082, .092, .094, .109);
    const ear = ellipsoid(head, dark, -.073, .105, side * .228, .145, .128, .045);
    ear.rotation.x = side * .38; ear.rotation.z = -.44;
    const tip = ellipsoid(head, dark, -.014, .015, side * .233, .093, .112, .035);
    tip.rotation.z = -.26;
    curveMesh(head, [[.16, .13, side * .10], [.145, .16, side * .17], [.10, .12, side * .205]], .014, fur);
    curveMesh(head, [[.242, -.12, side * .03], [.23, -.15, side * .10], [.18, -.13, side * .15]], .009, dark);
    // Whisker follicle points remain very subtle at normal viewing distance.
    for (let i = 0; i < 3; i++) ellipsoid(head, dark, .302 - i * .017, -.085 - (i % 2) * .025, side * (.11 + i * .012), .006, .006, .006);
  }
  ellipsoid(head, noseMaterial, .326, -.022, 0, .055, .049, .075);
  ellipsoid(head, pale, .20, -.155, 0, .092, .036, .12);
  curveMesh(head, [[.17, .20, -.12], [.22, .214, -.045], [.22, .214, .045], [.17, .20, .12]], .014, fur);
  curveMesh(head, [[.11, .23, -.12], [.15, .246, 0], [.11, .23, .12]], .012, pale);

  const collar = addMesh(bodyRig, new T.TorusGeometry(.20, .021, 12, 64), rose, [.43, .73, 0]);
  collar.rotation.y = Math.PI / 2; collar.scale.y = 1.12;
  ellipsoid(bodyRig, gold, .455, .51, .025, .013, .04, .033);

  const curlPoints = [];
  for (let i = 0; i <= 36; i++) { const a = i / 36 * Math.PI * 2.1; curlPoints.push([-.53 - Math.sin(a) * .11, .76 + (1 - Math.cos(a)) * .11, -.01 + i * .0013]); }
  const tail = curveMesh(bodyRig, curlPoints, .052, fur);

  const legs = [];
  for (const front of [true, false]) for (const side of [-1, 1]) {
    const hip = new T.Vector3(front ? .29 : -.38, .46, side * .18);
    const upper = addMesh(root, new T.CylinderGeometry(front ? .075 : .095, .055, 1, 20), fur);
    const lower = addMesh(root, new T.CylinderGeometry(.057, .043, 1, 20), front ? pale : fur);
    const elbow = ellipsoid(root, fur, 0, 0, 0, .066, .070, .063);
    const paw = ellipsoid(root, pale, 0, 0, 0, .11, .052, .075);
    const toes = [];
    for (let j = 0; j < 3; j++) toes.push(ellipsoid(root, muzzle, 0, 0, 0, .019, .010, .012));
    legs.push({ hip, upper, lower, elbow, paw, toes, front, phase: front ? (side === -1 ? .25 : .75) : (side === -1 ? 0 : .5) });
  }
  const up = new T.Vector3(0, 1, 0);
  function segment(object, a, b) { const delta = new T.Vector3().subVectors(b, a); object.position.copy(a).add(b).multiplyScalar(.5); object.scale.y = delta.length(); object.quaternion.setFromUnitVectors(up, delta.normalize()); }
  function pose(walkSeconds, moving, speed = moving ? 1 : 0) {
    const strideCycle = walkSeconds / .64;
    const fade = moving ? 1 : 0;
    bodyRig.position.y = moving ? .009 * speed * Math.sin(strideCycle * Math.PI * 4) : 0;
    bodyRig.rotation.z = moving ? .012 * speed * Math.sin(strideCycle * Math.PI * 2) : 0;
    head.rotation.z = moving ? -.018 + .014 * Math.sin(strideCycle * Math.PI * 2) : -.035;
    tail.rotation.x = moving ? .03 * Math.sin(strideCycle * Math.PI * 2) : 0;
    for (const leg of legs) {
      const phase = ((strideCycle + leg.phase) % 1 + 1) % 1;
      let travel = 0, lift = 0;
      if (moving) {
        if (phase < .64) travel = .155 - .31 * phase / .64;
        else { const swing = (phase - .64) / .36; travel = -.155 + .31 * smooth(swing); lift = .085 * Math.sin(swing * Math.PI); }
      }
      travel *= speed; lift *= speed;
      const hip = leg.hip.clone(); hip.y += bodyRig.position.y;
      const foot = new T.Vector3(hip.x + travel, .065 + lift, hip.z);
      const delta = foot.clone().sub(hip), distance = Math.min(delta.length(), .43), l1 = .215, l2 = .225;
      const direction = delta.clone().normalize();
      const along = (l1*l1 - l2*l2 + distance*distance) / (2*distance);
      const bend = Math.sqrt(Math.max(0, l1*l1 - along*along));
      const perpendicular = new T.Vector3(-direction.y, direction.x, 0).multiplyScalar(leg.front ? -1 : 1);
      const knee = hip.clone().addScaledVector(direction, along).addScaledVector(perpendicular, bend);
      segment(leg.upper, hip, knee); segment(leg.lower, knee, foot);
      leg.elbow.position.copy(knee); leg.paw.position.copy(foot).add(new T.Vector3(.025, -.018, 0));
      leg.paw.rotation.z = moving && phase > .64 ? -.17 * Math.sin((phase-.64)/.36*Math.PI) : 0;
      leg.toes.forEach((toe, j) => toe.position.set(foot.x + .114, foot.y - .029, foot.z + (j-1)*.038));
    }
  }
  pose(0, false);
  return { root, pose };
}

export async function brandScene(container, onPhase = () => {}) {
  const scene = new T.Scene();
  const renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setClearColor(0, 0); renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
  renderer.outputColorSpace = T.SRGBColorSpace; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.domElement.setAttribute('aria-hidden', 'true'); container.append(renderer.domElement);
  const environmentMap = environment(renderer); scene.environment = environmentMap.texture; scene.environmentIntensity = .75;
  scene.add(new T.HemisphereLight('#fff3e5', '#925f74', 1.15));
  const key = new T.DirectionalLight('#fff5e7', 2.5); key.position.set(-3, 5, 6); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); key.shadow.camera.left = -3; key.shadow.camera.right = 3;
  key.shadow.camera.top = 3; key.shadow.camera.bottom = -3; key.shadow.bias = -.0006; key.shadow.normalBias = .025; scene.add(key);
  const rim = new T.DirectionalLight('#ffd9e8', 1.4); rim.position.set(4, 3, -3); scene.add(rim);
  const camera = new T.PerspectiveCamera(34, 1, .1, 40); camera.position.set(0, .22, 10); camera.lookAt(0, .1, 0);
  const logo = new T.Group(); logo.rotation.set(-.025, -.06, -.025); scene.add(logo);

  const pink = material('#e7a7b7', .24, { clearcoat: .95, clearcoatRoughness: .18, metalness: .04, transmission: .08, thickness: .3, ior: 1.44, iridescence: .08 });
  const heart = addMesh(logo, new T.ExtrudeGeometry(heartShape(), { depth: .16, bevelEnabled: true, bevelThickness: .12, bevelSize: .12, bevelSegments: 8, steps: 1, curveSegments: 64 }), pink, [0, .05, -.13]);
  const gold = material('#c8a759', .19, { metalness: .93, clearcoat: .3, bumpMap: microTexture(128, 18), bumpScale: .002 });
  const ring = addMesh(logo, new T.TorusGeometry(2.03, .033, 18, 200), gold, [0, 0, -.04]);
  const rimRing = addMesh(logo, new T.TorusGeometry(2.077, .008, 10, 200), material('#e0c689', .2, {metalness: .85}), [0, 0, -.04]);
  const textures = await logoTextures();
  const faceMaterial = material('#ffffff', .63, { map: textures.face, transparent: true, alphaTest: .01, roughness: .64, bumpMap: microTexture(128, 15), bumpScale: .0015 });
  const face = addMesh(logo, new T.PlaneGeometry(3.48, 2.897), faceMaterial, [0, .045, .167]);
  const cakeMaterial = faceMaterial.clone(); cakeMaterial.map = textures.cake;
  const cake = addMesh(logo, new T.PlaneGeometry(3.48, 2.897), cakeMaterial, [0, .045, .167]);
  face.castShadow = false; cake.castShadow = false; heart.castShadow = false;

  // An inconspicuous physical stage keeps all paws planted within the circle.
  const floor = addMesh(logo, new T.CircleGeometry(1.5, 96), new T.ShadowMaterial({ opacity: .18 }), [0, -1.72, .45]);
  floor.rotation.x = -Math.PI/2; floor.scale.y = .8; floor.castShadow = false;
  const pug = makePug(); logo.add(pug.root); pug.root.scale.setScalar(.49);

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let elapsed = reduced.matches ? 9.5 : 0, paused = reduced.matches, visible = true, disposed = false, dirty = true;
  let previous = performance.now(), lastPhase = '', raf = 0;
  const resize = () => {
    const w = container.clientWidth, h = container.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h); camera.aspect = w / h;
    camera.position.z = 5.25 / (2 * Math.tan(T.MathUtils.degToRad(17))) * Math.max(1, 1/camera.aspect);
    camera.updateProjectionMatrix(); dirty = true;
  };
  const observer = new ResizeObserver(resize); observer.observe(container); resize();
  const visibility = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; previous = performance.now(); dirty = true; }); visibility.observe(container);
  const resetClock = () => { previous = performance.now(); dirty = true; };
  document.addEventListener('visibilitychange', resetClock);
  window.addEventListener('pageshow', resetClock);
  const phase = (name, text) => {
    container.dataset.motionPhase = name;
    if (text !== lastPhase) { lastPhase = text; onPhase(text); }
  };
  function pose(t) {
    const heartProgress = smooth(t/1.7), ringProgress = smooth((t-.2)/1.8), faceProgress = smooth((t-.8)/1.7), cakeProgress = smooth((t-1.1)/1.9);
    heart.scale.set(1, .13 + .87*heartProgress, 1); heart.position.y = .05 + (1-heartProgress)*-.25;
    heart.rotation.y = (1-heartProgress)*-.5; heart.rotation.z = (1-heartProgress)*-.13;
    ring.scale.setScalar(.65+.35*ringProgress); ring.rotation.y = (1-ringProgress)*.7; ring.rotation.z = (1-ringProgress)*-.25;
    rimRing.scale.copy(ring.scale); rimRing.rotation.copy(ring.rotation);
    ring.material.opacity = ringProgress; ring.material.transparent = ringProgress < 1;
    rimRing.material.opacity = ringProgress; rimRing.material.transparent = ringProgress < 1;
    face.position.z = .167 + (1-faceProgress)*.6; face.material.opacity = faceProgress;
    cake.position.y = .045 + (1-cakeProgress)*.8; cake.position.z = .167 + (1-cakeProgress)*.6; cake.material.opacity = cakeProgress;
    // Once assembled, use the uninterrupted original face to remove layer seams.
    face.material.map = cakeProgress === 1 ? textures.complete : textures.face;
    cake.visible = cakeProgress < 1;

    const afterAssembly = Math.max(0, t-3), cycle = Math.floor(afterAssembly/7), inCycle = afterAssembly%7;
    const walking = inCycle < 6 && t >= 3;
    const ramp = .3, u = Math.min(inCycle, 6);
    const integral = v => v*v*v - .5*v*v*v*v;
    const travel = u < ramp ? ramp*integral(u/ramp) : u > 6-ramp ? 6-ramp-ramp*integral((6-u)/ramp) : u-ramp*.5;
    const walkSeconds = cycle*6 + travel*6/(6-ramp);
    const speed = walking ? Math.min(smooth(inCycle/ramp), smooth((6-inCycle)/ramp)) : 0;
    // The path is continuous across pauses. There is no reset/teleport at
    // the end of a six-second walk, and the stand lasts exactly one second.
    const angle = -2.35 + walkSeconds*.32;
    const px = .98*Math.cos(angle), pz = .51 + .39*Math.sin(angle);
    const vx = -.98*Math.sin(angle), vz = .39*Math.cos(angle);
    pug.root.position.set(px, -1.66, pz);
    pug.root.rotation.y = Math.atan2(-vz, vx);
    pug.root.visible = t >= 2.7;
    const dogReveal = smooth((t-2.7)/.3); pug.root.scale.setScalar(.49*dogReveal);
    pug.pose(walkSeconds, walking, speed);
    container.dataset.walkCycle = String(cycle);
    container.dataset.pauseDuration = '1';
    if (t < 3) phase('assembly', 'Watercolour, gold and a little love.');
    else if (walking) phase('walking', 'A little stroll inside the golden circle.');
    else phase('pause', 'A one-second pause. Then a little more exploring.');
  }
  function frame(now) {
    const dt = Math.max(0, (now-previous)/1000); previous = now;
    if (!disposed && visible && !document.hidden) {
      if (!paused) { elapsed += dt; dirty = true; }
      if (dirty) { pose(elapsed); renderer.render(scene, camera); dirty = false; }
    }
    if (!disposed) raf = requestAnimationFrame(frame);
  }
  const onReduced = event => { if (event.matches) { elapsed = 9.5; paused = true; dirty = true; } };
  reduced.addEventListener('change', onReduced);
  container.classList.add('loaded'); container.dataset.ready = 'true'; pose(elapsed); renderer.render(scene, camera); raf = requestAnimationFrame(frame);
  return {
    replay() { elapsed = 0; paused = false; dirty = true; },
    pause(value) { paused = value; dirty = true; },
    finish() { elapsed = 9.5; paused = true; dirty = true; },
    seek(value) { elapsed = Math.max(0, Number(value) || 0); dirty = true; pose(elapsed); renderer.render(scene, camera); },
    get time() { return elapsed; },
    dispose() { disposed = true; cancelAnimationFrame(raf); observer.disconnect(); visibility.disconnect(); document.removeEventListener('visibilitychange', resetClock); window.removeEventListener('pageshow', resetClock); reduced.removeEventListener('change', onReduced); renderer.dispose(); environmentMap.dispose(); renderer.domElement.remove(); }
  };
}

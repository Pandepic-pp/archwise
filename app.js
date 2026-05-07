/* =========================================================
   ArchWise Landing Page — Three.js + GSAP
   ========================================================= */

// ── 0. THEME TOGGLE ─────────────────────────────────────────
(function () {
  const html = document.documentElement;

  // Apply saved preference (default = dark, matching the site's design)
  if (localStorage.getItem('aw-theme') === 'light') {
    html.classList.add('light');
  }

  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const isLight = html.classList.toggle('light');
    localStorage.setItem('aw-theme', isLight ? 'light' : 'dark');
    window.dispatchEvent(new CustomEvent('themechange', { detail: { light: isLight } }));
  });
})();

// ── 1. THREE.JS HERO SCENE ──────────────────────────────────
(function () {
  const canvas = document.getElementById('three-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  // ── Scene / Camera / Renderer
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x060a12, 0.04);

  const camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0.3, 7);
  camera.lookAt(0, -0.2, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  // ── Lights
  const ambientLight = new THREE.AmbientLight(0x0d1527, 4);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0x3b82f6, 3.5);
  keyLight.position.set(3, 5, 4);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x6366f1, 1.5);
  fillLight.position.set(-5, 2, -2);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0x1e40af, 2);
  rimLight.position.set(0, -3, -5);
  scene.add(rimLight);

  const screenGlow = new THREE.PointLight(0x2563eb, 4, 4);
  screenGlow.position.set(2.4, -0.8, 1.5);
  scene.add(screenGlow);

  // ── Particle field (star-like background)
  const PARTICLE_COUNT = 250;
  const pPositions = new Float32Array(PARTICLE_COUNT * 3);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    pPositions[i * 3]     = (Math.random() - 0.5) * 30;
    pPositions[i * 3 + 1] = (Math.random() - 0.5) * 16;
    pPositions[i * 3 + 2] = (Math.random() - 0.5) * 22 - 4;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
  const particleMat = new THREE.PointsMaterial({ color: 0x93c5fd, size: 0.04, transparent: true, opacity: 0.7, sizeAttenuation: true });
  const particles = new THREE.Points(pGeo, particleMat);
  scene.add(particles);

  // ── Floating connection lines between nearby particles (static mesh)
  {
    const linePts = [];
    const threshold = 3.2;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      for (let j = i + 1; j < PARTICLE_COUNT; j++) {
        const dx = pPositions[i*3]   - pPositions[j*3];
        const dy = pPositions[i*3+1] - pPositions[j*3+1];
        const dz = pPositions[i*3+2] - pPositions[j*3+2];
        if (Math.sqrt(dx*dx + dy*dy + dz*dz) < threshold) {
          linePts.push(pPositions[i*3], pPositions[i*3+1], pPositions[i*3+2]);
          linePts.push(pPositions[j*3], pPositions[j*3+1], pPositions[j*3+2]);
        }
      }
    }
    const lGeo = new THREE.BufferGeometry();
    lGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePts, 3));
    scene.add(new THREE.LineSegments(lGeo, new THREE.LineBasicMaterial({ color: 0x1e40af, transparent: true, opacity: 0.12 })));
  }

  // ── Avatar workstation ──────────────────────────────────────
  const workstation = new THREE.Group();
  workstation.position.set(2.3, -1.6, 0);
  scene.add(workstation);

  const mat = {
    darkMetal:   new THREE.MeshStandardMaterial({ color: 0x0b1120, metalness: 0.9, roughness: 0.15 }),
    midMetal:    new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.8, roughness: 0.2 }),
    blue:        new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.6, roughness: 0.3 }),
    navy:        new THREE.MeshStandardMaterial({ color: 0x172554, metalness: 0.5, roughness: 0.4 }),
    robotHead:   new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.2 }),
    screen:      new THREE.MeshStandardMaterial({ color: 0x060d1f, emissive: 0x1d4ed8, emissiveIntensity: 0.5 }),
    eyeMat:      new THREE.MeshStandardMaterial({ color: 0x60a5fa, emissive: 0x3b82f6, emissiveIntensity: 3 }),
    codeBlue:    new THREE.MeshStandardMaterial({ color: 0x93c5fd, emissive: 0x60a5fa, emissiveIntensity: 1.8, transparent: true, opacity: 0.9 }),
    codeGreen:   new THREE.MeshStandardMaterial({ color: 0x6ee7b7, emissive: 0x34d399, emissiveIntensity: 1.5, transparent: true, opacity: 0.8 }),
    codeAmber:   new THREE.MeshStandardMaterial({ color: 0xfde68a, emissive: 0xfbbf24, emissiveIntensity: 1.2, transparent: true, opacity: 0.7 }),
  };

  // Desk top
  const desk = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.045, 0.95), mat.darkMetal);
  desk.position.y = 0;
  workstation.add(desk);

  // Desk edge glow strip
  const edgeGlow = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, 0.008, 0.01),
    new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x2563eb, emissiveIntensity: 2, transparent: true, opacity: 0.6 })
  );
  edgeGlow.position.set(0, 0.02, 0.475);
  workstation.add(edgeGlow);

  // Desk legs (4)
  const legG = new THREE.BoxGeometry(0.045, 0.65, 0.045);
  [[-0.88, 0.36], [-0.88, -0.36], [0.88, 0.36], [0.88, -0.36]].forEach(([x, z]) => {
    const leg = new THREE.Mesh(legG, mat.midMetal);
    leg.position.set(x, -0.35, z);
    workstation.add(leg);
  });

  // Monitor stand base
  const standBase = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.025, 20), mat.darkMetal);
  standBase.position.set(0, 0.035, -0.12);
  const standPole = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.28, 10), mat.darkMetal);
  standPole.position.set(0, 0.18, -0.12);
  workstation.add(standBase, standPole);

  // Monitor back
  const monitorBack = new THREE.Mesh(
    new THREE.BoxGeometry(0.98, 0.64, 0.048),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.92, roughness: 0.08 })
  );
  monitorBack.position.set(0, 0.42, -0.12);
  workstation.add(monitorBack);

  // Screen
  const screenMesh = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.56, 0.012), mat.screen);
  screenMesh.position.set(0, 0.42, -0.09);
  workstation.add(screenMesh);

  // Code lines on screen
  const codeLines = [
    { w: 0.32, y:  0.21, x: -0.12, m: mat.codeBlue },
    { w: 0.20, y:  0.21, x:  0.23, m: mat.codeAmber },
    { w: 0.42, y:  0.15, x: -0.06, m: mat.codeBlue },
    { w: 0.16, y:  0.09, x: -0.22, m: mat.codeGreen },
    { w: 0.28, y:  0.09, x:  0.06, m: mat.codeBlue },
    { w: 0.36, y:  0.03, x: -0.08, m: mat.codeGreen },
    { w: 0.24, y: -0.03, x: -0.16, m: mat.codeAmber },
    { w: 0.18, y: -0.03, x:  0.14, m: mat.codeBlue },
    { w: 0.30, y: -0.09, x: -0.10, m: mat.codeBlue },
    { w: 0.22, y: -0.15, x: -0.18, m: mat.codeGreen },
    { w: 0.14, y: -0.21, x: -0.24, m: mat.codeAmber },
  ];
  codeLines.forEach(({ w, y, x, m }) => {
    const cl = new THREE.Mesh(new THREE.BoxGeometry(w, 0.013, 0.006), m);
    cl.position.set(x + w / 2 - 0.35, 0.42 + y, -0.078);
    workstation.add(cl);
  });

  // Keyboard
  const kb = new THREE.Mesh(
    new THREE.BoxGeometry(0.65, 0.016, 0.24),
    new THREE.MeshStandardMaterial({ color: 0x1a1a2e, metalness: 0.5, roughness: 0.7 })
  );
  kb.position.set(0, 0.03, 0.26);
  workstation.add(kb);

  // Keycaps (small boxes on keyboard)
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 12; col++) {
      const key = new THREE.Mesh(
        new THREE.BoxGeometry(0.038, 0.01, 0.038),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.4, roughness: 0.8 })
      );
      key.position.set(-0.275 + col * 0.05, 0.039, 0.16 + row * 0.048);
      workstation.add(key);
    }
  }

  // Mouse
  const mouseMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.025, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.4 })
  );
  mouseMesh.position.set(0.44, 0.03, 0.22);
  workstation.add(mouseMesh);

  // ── Avatar ──────────────────────────────────────────────────
  const avatar = new THREE.Group();

  // Head (faceted octahedron for stylized look)
  const head = new THREE.Mesh(new THREE.OctahedronGeometry(0.14, 1), mat.robotHead);
  head.scale.set(1, 1.15, 1);
  head.position.set(0, 0.86, 0.42);
  avatar.add(head);

  // Visor (emissive band across face)
  const visor = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.055, 0.065),
    new THREE.MeshStandardMaterial({ color: 0x60a5fa, emissive: 0x3b82f6, emissiveIntensity: 2.5, transparent: true, opacity: 0.85 })
  );
  visor.position.set(0, 0.87, 0.51);
  avatar.add(visor);

  // Eyes
  const eyeG = new THREE.SphereGeometry(0.02, 8, 8);
  const eyeL = new THREE.Mesh(eyeG, mat.eyeMat);
  eyeL.position.set(-0.048, 0.88, 0.53);
  const eyeR = new THREE.Mesh(eyeG, mat.eyeMat);
  eyeR.position.set( 0.048, 0.88, 0.53);
  avatar.add(eyeL, eyeR);

  // Neck
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.042, 0.052, 0.1, 8),
    new THREE.MeshStandardMaterial({ color: 0x1a1a2e, metalness: 0.6 })
  );
  neck.position.set(0, 0.73, 0.42);
  avatar.add(neck);

  // Torso
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.38, 0.2), mat.blue);
  torso.position.set(0, 0.52, 0.42);
  avatar.add(torso);

  // Chest detail stripe
  const stripe = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.38, 0.006),
    new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x2563eb, emissiveIntensity: 1 })
  );
  stripe.position.set(0, 0.52, 0.522);
  avatar.add(stripe);

  // Upper arms
  const armG = new THREE.CylinderGeometry(0.055, 0.05, 0.3, 8);
  const armL = new THREE.Mesh(armG, mat.blue);
  armL.rotation.z =  0.45;
  armL.position.set(-0.22, 0.5, 0.42);
  const armR = new THREE.Mesh(armG, mat.blue);
  armR.rotation.z = -0.45;
  armR.position.set( 0.22, 0.5, 0.42);
  avatar.add(armL, armR);

  // Forearms (angled toward keyboard)
  const forearmG = new THREE.CylinderGeometry(0.04, 0.038, 0.26, 8);
  const forearmL = new THREE.Mesh(forearmG, mat.blue);
  forearmL.rotation.x = -0.7;
  forearmL.rotation.z =  0.12;
  forearmL.position.set(-0.23, 0.27, 0.57);
  const forearmR = new THREE.Mesh(forearmG, mat.blue);
  forearmR.rotation.x = -0.7;
  forearmR.rotation.z = -0.12;
  forearmR.position.set( 0.23, 0.27, 0.57);
  avatar.add(forearmL, forearmR);

  // Hands (on keyboard)
  const handG = new THREE.BoxGeometry(0.09, 0.025, 0.07);
  const handMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6 });
  const handL = new THREE.Mesh(handG, handMat);
  handL.position.set(-0.17, 0.04, 0.63);
  const handR = new THREE.Mesh(handG, handMat);
  handR.position.set( 0.17, 0.04, 0.63);
  avatar.add(handL, handR);

  // Thighs (seated)
  const thighG = new THREE.CylinderGeometry(0.068, 0.064, 0.36, 8);
  const thighMat = new THREE.MeshStandardMaterial({ color: 0x172554, roughness: 0.5 });
  const thighL = new THREE.Mesh(thighG, thighMat);
  thighL.rotation.x = Math.PI / 2;
  thighL.position.set(-0.1, 0.17, 0.64);
  const thighR = new THREE.Mesh(thighG, thighMat);
  thighR.rotation.x = Math.PI / 2;
  thighR.position.set( 0.1, 0.17, 0.64);
  avatar.add(thighL, thighR);

  // Chair back
  const chairBack = new THREE.Mesh(
    new THREE.BoxGeometry(0.46, 0.56, 0.05),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.7, roughness: 0.3 })
  );
  chairBack.position.set(0, 0.38, 0.77);
  const chairSeat = new THREE.Mesh(
    new THREE.BoxGeometry(0.46, 0.048, 0.42),
    new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.6, roughness: 0.4 })
  );
  chairSeat.position.set(0, 0.1, 0.63);
  const chairPole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 0.4, 8),
    new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.8 })
  );
  chairPole.position.set(0, -0.12, 0.63);

  workstation.add(avatar, chairBack, chairSeat, chairPole);

  // ── Architecture nodes (left side) ─────────────────────────
  const archGroup = new THREE.Group();
  scene.add(archGroup);

  const nodeData = [
    { label: 'API GW', color: 0x3b82f6, pos: [-3.0,  1.2, -0.5] },
    { label: 'CDN',    color: 0x818cf8, pos: [-4.5,  0.3, -1.5] },
    { label: 'DB',     color: 0x34d399, pos: [-3.2, -1.0, -0.8] },
    { label: 'Cache',  color: 0xfbbf24, pos: [-2.0,  0.5, -2.0] },
    { label: 'Queue',  color: 0xf87171, pos: [-4.0, -0.5, -0.3] },
  ];

  const archNodes = nodeData.map(({ color, pos }, i) => {
    const g = new THREE.Group();
    // Solid cube (semi-transparent)
    const solid = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, 0.26, 0.26),
      new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.12, roughness: 0.2, metalness: 0.9 })
    );
    // Wireframe cube
    const wire = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, 0.26, 0.26),
      new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.55 })
    );
    // Corner glow dots
    const dotMat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 2 });
    const dotG = new THREE.SphereGeometry(0.022, 6, 6);
    [[-1,-1,-1],[-1,-1,1],[-1,1,-1],[-1,1,1],[1,-1,-1],[1,-1,1],[1,1,-1],[1,1,1]].forEach(([cx,cy,cz]) => {
      const d = new THREE.Mesh(dotG, dotMat);
      d.position.set(cx * 0.13, cy * 0.13, cz * 0.13);
      g.add(d);
    });
    g.add(solid, wire);
    g.position.set(...pos);
    archGroup.add(g);
    return { group: g, basePos: [...pos], phase: i * 1.1 };
  });

  // Connections between architecture nodes
  const edges = [[0,1],[0,2],[0,3],[1,4],[2,4],[3,2],[1,2]];
  edges.forEach(([a, b]) => {
    const pts = [
      new THREE.Vector3(...nodeData[a].pos),
      new THREE.Vector3(...nodeData[b].pos),
    ];
    const lg = new THREE.BufferGeometry().setFromPoints(pts);
    archGroup.add(new THREE.Line(lg, new THREE.LineBasicMaterial({ color: 0x1d4ed8, transparent: true, opacity: 0.25 })));
  });

  // ── Holographic rings (decorative) ─────────────────────────
  const rings = [
    { r: 2.8, tube: 0.012, tilt: 0.4,  speed:  0.004, color: 0x3b82f6, center: [-1.5, 0, -2] },
    { r: 3.6, tube: 0.008, tilt: -0.6, speed: -0.003, color: 0x6366f1, center: [-1.5, 0, -2] },
    { r: 1.9, tube: 0.015, tilt: 1.1,  speed:  0.005, color: 0x34d399, center: [-1.5, 0, -2] },
  ].map(({ r, tube, tilt, speed, color, center }) => {
    const mesh = new THREE.Mesh(
      new THREE.TorusGeometry(r, tube, 8, 80),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.28 })
    );
    mesh.rotation.x = tilt;
    mesh.position.set(...center);
    scene.add(mesh);
    return { mesh, speed };
  });

  // ── Grid ground plane
  const gridHelper = new THREE.GridHelper(30, 30, 0x1e3a8a, 0x0f172a);
  gridHelper.position.y = -2.8;
  gridHelper.material.transparent = true;
  gridHelper.material.opacity = 0.35;
  scene.add(gridHelper);

  // ── Theme-aware scene colors ────────────────────────────────
  function applySceneTheme(isLight) {
    if (isLight) {
      scene.fog.color.setHex(0xf1f5f9);
      scene.fog.density    = 0.022;
      ambientLight.color.setHex(0xd1d5db);
      ambientLight.intensity = 3;
      keyLight.intensity   = 2.0;
      particleMat.color.setHex(0x2563eb);
      particleMat.opacity  = 0.45;
    } else {
      scene.fog.color.setHex(0x060a12);
      scene.fog.density    = 0.04;
      ambientLight.color.setHex(0x0d1527);
      ambientLight.intensity = 4;
      keyLight.intensity   = 3.5;
      particleMat.color.setHex(0x93c5fd);
      particleMat.opacity  = 0.7;
    }
  }
  applySceneTheme(document.documentElement.classList.contains('light'));
  window.addEventListener('themechange', e => applySceneTheme(e.detail.light));

  // ── Mouse parallax
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / innerWidth  - 0.5) * 2;
    mouseY = (e.clientY / innerHeight - 0.5) * 2;
  });

  // ── Scroll integration
  let scrollY = 0;
  window.addEventListener('scroll', () => { scrollY = window.scrollY; });

  // ── Animation loop
  const clock = new THREE.Clock();
  let avatarRef = avatar; // keep reference for breathing

  function tick() {
    requestAnimationFrame(tick);
    const t = clock.getElapsedTime();

    // Particle slow drift
    particles.rotation.y = t * 0.015;
    particles.rotation.x = Math.sin(t * 0.008) * 0.04;

    // Screen glow pulse
    screenGlow.intensity = 3.5 + Math.sin(t * 1.8) * 1.2;
    screenMesh.material.emissiveIntensity = 0.4 + Math.sin(t * 1.8) * 0.1;

    // Avatar subtle breathing
    workstation.position.y = -1.6 + Math.sin(t * 1.3) * 0.008;

    // Avatar head slight sway
    head.rotation.y = Math.sin(t * 0.7) * 0.06;

    // Arch nodes float + rotate
    archNodes.forEach(({ group, basePos, phase }) => {
      group.rotation.y = t * 0.55;
      group.rotation.x = t * 0.3;
      group.position.y = basePos[1] + Math.sin(t * 0.9 + phase) * 0.14;
    });

    // Rings spin
    rings.forEach(({ mesh, speed }) => {
      mesh.rotation.z += speed;
    });

    // Mouse parallax — smooth lerp
    targetX += (mouseX - targetX) * 0.03;
    targetY += (mouseY - targetY) * 0.03;
    camera.position.x = targetX * 0.4;
    camera.position.y = 0.3 - targetY * 0.15;

    // Scroll camera pullback
    const scrollFactor = scrollY * 0.0008;
    camera.position.z = 7 + scrollFactor * 3;
    archGroup.rotation.y = scrollFactor * 0.5;

    // Visor flicker
    visor.material.emissiveIntensity = 2.2 + Math.sin(t * 4.5) * 0.4;

    renderer.render(scene, camera);
  }
  tick();

  // ── Resize
  window.addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  });
})();


// ── 2. GSAP SCROLL ANIMATIONS ───────────────────────────────
(function () {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  // ── Navbar scroll behaviour
  const navbar = document.getElementById('navbar');
  ScrollTrigger.create({
    trigger: 'body',
    start: 'top -60px',
    onEnter:  () => navbar && navbar.classList.add('scrolled'),
    onLeaveBack: () => navbar && navbar.classList.remove('scrolled'),
  });

  // ── Scroll progress bar
  const progressBar = document.getElementById('scroll-progress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const doc = document.documentElement;
      const scrolled = doc.scrollTop;
      const max = doc.scrollHeight - doc.clientHeight;
      progressBar.style.width = (scrolled / max * 100) + '%';
    });
  }

  // ── Hero entrance animations (staggered on load)
  gsap.timeline({ delay: 0.2 })
    .to('.hero-eyebrow', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })
    .to('.hero-headline', { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.3')
    .to('.hero-sub',         { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4')
    .to('.hero-learn-badge', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3')
    .to('.hero-ctas',        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3')
    .to('.hero-stats',    { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.2');

  // ── Generic section reveal (all .reveal elements)
  document.querySelectorAll('.reveal').forEach((el) => {
    gsap.fromTo(el,
      { opacity: 0, y: 36 },
      {
        opacity: 1, y: 0,
        duration: 0.75,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
        delay: parseFloat(el.style.transitionDelay || '0') * 0.7,
      }
    );
  });

  // ── Stats counters (hero)
  document.querySelectorAll('.stat-number[data-target]').forEach((el) => {
    const target = parseInt(el.dataset.target);
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        gsap.to({ val: 0 }, {
          val: target,
          duration: 1.8,
          ease: 'power2.out',
          onUpdate() { el.textContent = Math.round(this.targets()[0].val).toLocaleString(); },
        });
      }
    });
  });

  // ── Stats counters (why section)
  document.querySelectorAll('.stat-count[data-target]').forEach((el) => {
    const target = parseInt(el.dataset.target);
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to({ val: 0 }, {
          val: target,
          duration: 2.0,
          ease: 'power2.out',
          onUpdate() { el.textContent = Math.round(this.targets()[0].val); },
        });
      }
    });
  });

  // ── Feature cards staggered reveal
  gsap.utils.toArray('#features .glass').forEach((card, i) => {
    gsap.fromTo(card,
      { opacity: 0, y: 40, scale: 0.97 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 0.6,
        ease: 'power2.out',
        delay: i * 0.08,
        scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none none' },
      }
    );
  });

  // ── Pricing card hover lift
  document.querySelectorAll('#pricing .glass, #pricing .pricing-popular').forEach((card) => {
    card.addEventListener('mouseenter', () => gsap.to(card, { y: -6, duration: 0.3, ease: 'power2.out' }));
    card.addEventListener('mouseleave', () => gsap.to(card, { y: 0,  duration: 0.4, ease: 'power2.out' }));
  });

  // ── Testimonial cards staggered reveal
  gsap.utils.toArray('#testimonials .testimonial-card').forEach((card, i) => {
    gsap.fromTo(card,
      { opacity: 0, x: i % 2 === 0 ? -30 : 30 },
      {
        opacity: 1, x: 0,
        duration: 0.7,
        ease: 'power2.out',
        delay: i * 0.1,
        scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none none' },
      }
    );
  });

  // ── Scroll-triggered score bars in features section
  document.querySelectorAll('#features [style*="width:"]').forEach((bar) => {
    const targetW = bar.style.width;
    bar.style.width = '0%';
    ScrollTrigger.create({
      trigger: bar,
      start: 'top 90%',
      once: true,
      onEnter: () => gsap.to(bar, { width: targetW, duration: 1.2, ease: 'power2.out', delay: 0.2 }),
    });
  });

  // ── Orbit rings continuous rotation (CSS-handled via keyframes already)
  // Additional GSAP pulse on the center ArchWise logo in About
  const aboutLogo = document.querySelector('#about .animate-float');
  if (aboutLogo) {
    gsap.to(aboutLogo, {
      boxShadow: '0 0 40px 12px rgba(59,130,246,0.4)',
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  }
})();


// ── 3. UI INTERACTIONS ──────────────────────────────────────
(function () {
  // ── Mobile menu toggle
  const toggle = document.getElementById('mobile-menu-toggle');
  const menu   = document.getElementById('mobile-menu');
  const icon   = document.getElementById('menu-icon');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      if (icon) {
        icon.innerHTML = open
          ? '<line x1="3" y1="5" x2="15" y2="13"/><line x1="3" y1="13" x2="15" y2="5"/>'  // X
          : '<line x1="3" y1="6" x2="15" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/>'; // Hamburger
      }
    });
    // Close on link click
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      menu.classList.remove('open');
      if (icon) icon.innerHTML = '<line x1="3" y1="6" x2="15" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/>';
    }));
  }

  // ── Contact form
  const form    = document.getElementById('contact-form');
  const submit  = document.getElementById('form-submit');
  const success = document.getElementById('form-success');
  if (form && submit && success) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name    = document.getElementById('name').value.trim();
      const email   = document.getElementById('email').value.trim();
      const subject = document.getElementById('subject').value;
      const message = document.getElementById('message').value.trim();

      submit.textContent = 'Sending...';
      submit.disabled = true;

      try {
        const apiBase = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
          ? 'http://localhost:5000'
          : 'https://archwise.konnecthr.online';
        const res = await fetch(`${apiBase}/api/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ name, email, subject, message }),
        });
        if (res.ok) {
          submit.style.display = 'none';
          success.classList.remove('hidden');
          form.reset();
        } else {
          throw new Error('Submission failed');
        }
      } catch {
        submit.textContent = 'Send Message';
        submit.disabled = false;
        alert('Could not send. Please email archwise.work@gmail.com directly.');
      }
    });
  }

  // ── Smooth scroll for all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── Feature card hover — subtle glow border
  document.querySelectorAll('#features .glass').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.boxShadow = '0 0 24px 2px rgba(59,130,246,0.1)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.boxShadow = '';
    });
  });

  // ── Testimonial card hover tilt
  document.querySelectorAll('.testimonial-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const rx = ((e.clientY - cy) / rect.height) * 8;
      const ry = ((e.clientX - cx) / rect.width ) * -8;
      card.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
      card.style.transition = 'transform 0.1s ease';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.4s ease';
    });
  });

  // ── Navbar active section highlighting
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('#navbar a[href^="#"]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          const active = link.getAttribute('href') === `#${id}`;
          link.classList.toggle('text-white', active);
          link.classList.toggle('text-gray-400', !active);
        });
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => observer.observe(s));

  // ── Cursor glow effect (desktop only)
  if (window.matchMedia('(pointer: fine)').matches) {
    const cursor = document.createElement('div');
    cursor.style.cssText = `
      position: fixed; pointer-events: none; z-index: 9999;
      width: 300px; height: 300px; border-radius: 50%;
      background: radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%);
      transform: translate(-50%, -50%);
      transition: opacity 0.3s ease;
    `;
    document.body.appendChild(cursor);
    let cx = 0, cy = 0;
    window.addEventListener('mousemove', e => {
      cx += (e.clientX - cx) * 0.12;
      cy += (e.clientY - cy) * 0.12;
      cursor.style.left = cx + 'px';
      cursor.style.top  = cy + 'px';
    });
    window.addEventListener('mouseleave', () => cursor.style.opacity = '0');
    window.addEventListener('mouseenter', () => cursor.style.opacity = '1');
  }
})();

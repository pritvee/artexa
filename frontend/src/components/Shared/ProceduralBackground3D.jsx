/**
 * ProceduralBackground3D — Crash-Proof Procedural Three.js Background
 *
 * ─── CRASH-PROOF GUARANTEES ─────────────────────────────────────────────
 *  • Runs entirely on a hidden canvas ref — ZERO React state in RAF loop.
 *  • WebGL availability checked before any Three.js code runs.
 *  • try/catch wraps all renderer creation — falls back to null silently.
 *  • All Three.js objects (geometries, materials, scene, renderer) are
 *    explicitly disposed on unmount — no memory leaks.
 *  • RAF has an `alive` flag — cancelled immediately on unmount.
 *  • No GLB/GLTF models — 100% procedural geometry, zero network requests.
 *  • prefers-reduced-motion: skips RAF, renders one static frame then stops.
 *  • Mobile: halves geometry complexity and object count automatically.
 *  • dpr capped at 1.5 to protect lower-end GPUs.
 *  • Only compositor-only operations per frame:
 *      matrix updates → GPU only ✅
 *      no layout/paint ✅
 *
 * ─── VISIBLE EFFECTS ────────────────────────────────────────────────────
 *  • 12 floating objects: torus knots, icosahedra, octahedra, toruses
 *  • Semi-transparent wireframe + solid inner glow mesh per object
 *  • Each shape drifts on independent sine paths (organic, non-repeating)
 *  • Subtle mouse parallax (< 0.5 units total movement)
 *  • Emissive color shifts slowly across brand palette over time
 *  • Depth: objects at varying Z distances for true 3D layering
 */

import { useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import * as THREE from 'three';

// ── WebGL check ────────────────────────────────────────────────────────
const isWebGLAvailable = () => {
    try {
        const c = document.createElement('canvas');
        return !!(
            window.WebGLRenderingContext &&
            (c.getContext('webgl') || c.getContext('experimental-webgl'))
        );
    } catch {
        return false;
    }
};

// ── Brand colour palette (hsl for easy interpolation) ─────────────────
const BRAND_COLORS = [
    new THREE.Color(0x7c3aed), // violet
    new THREE.Color(0xb066fe), // purple
    new THREE.Color(0xec4899), // pink
    new THREE.Color(0x38bdf8), // sky
    new THREE.Color(0x14b8a6), // teal
    new THREE.Color(0x6366f1), // indigo
];

// ── Route-aware opacity ────────────────────────────────────────────────
const ROUTE_OPACITY = {
    '/':          0.35,
    '/shop':      0.28,
    '/cart':      0.22,
    '/checkout':  0.20,
    '/login':     0.30,
    '/register':  0.30,
    'default':    0.25,
};

const getRouteOpacity = (path) => {
    if (path === '/')               return ROUTE_OPACITY['/'];
    if (path.startsWith('/shop'))   return ROUTE_OPACITY['/shop'];
    if (path.startsWith('/cart'))   return ROUTE_OPACITY['/cart'];
    if (path.startsWith('/checkout')) return ROUTE_OPACITY['/checkout'];
    if (path.startsWith('/login'))  return ROUTE_OPACITY['/login'];
    if (path.startsWith('/register')) return ROUTE_OPACITY['/register'];
    if (path.startsWith('/customize/')) return 0; // customizer has its own bg
    return ROUTE_OPACITY['default'];
};

// ── Shape factory ──────────────────────────────────────────────────────
const makeShape = (type, isMobile) => {
    const seg = isMobile ? 2 : 3;
    switch (type) {
        case 'torusKnot':
            return new THREE.TorusKnotGeometry(0.55, 0.18, isMobile ? 60 : 100, isMobile ? 10 : 16, 2, 3);
        case 'icosahedron':
            return new THREE.IcosahedronGeometry(0.7, seg - 1);
        case 'octahedron':
            return new THREE.OctahedronGeometry(0.8, seg - 1);
        case 'torus':
            return new THREE.TorusGeometry(0.55, 0.22, isMobile ? 12 : 20, isMobile ? 30 : 50);
        case 'dodecahedron':
            return new THREE.DodecahedronGeometry(0.7, 0);
        case 'tetrahedron':
        default:
            return new THREE.TetrahedronGeometry(0.8, 0);
    }
};

// ── Component ──────────────────────────────────────────────────────────
const ProceduralBackground3D = () => {
    const canvasRef = useRef(null);
    const location  = useLocation();

    const isCustomizer = useMemo(
        () => location.pathname.includes('/customize/'),
        [location.pathname]
    );

    const targetOpacity = useMemo(
        () => getRouteOpacity(location.pathname),
        [location.pathname]
    );

    // Current opacity ref for smooth fade on route change
    const opacityRef       = useRef(targetOpacity);
    const targetOpacityRef = useRef(targetOpacity);

    // Update target when route changes
    useEffect(() => {
        targetOpacityRef.current = getRouteOpacity(location.pathname);
    }, [location.pathname]);

    useEffect(() => {
        // Skip for customizer pages
        if (isCustomizer) return;
        if (!isWebGLAvailable()) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const isMobile = window.innerWidth < 768;

        // ── Three.js setup ───────────────────────────────────────────
        let renderer, scene, camera;
        try {
            renderer = new THREE.WebGLRenderer({
                canvas,
                alpha: true,
                antialias: !isMobile,
                powerPreference: 'default',
                precision: 'mediump',
                stencil: false,
            });
        } catch {
            return; // WebGL creation failed — exit silently
        }

        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        renderer.setPixelRatio(dpr);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0);
        renderer.shadowMap.enabled = false;

        scene  = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.set(0, 0, 14);

        // ── Lights ──────────────────────────────────────────────────
        const ambLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambLight);

        const ptLight1 = new THREE.PointLight(0x7c3aed, 8, 30);
        ptLight1.position.set(-6, 4, 5);
        scene.add(ptLight1);

        const ptLight2 = new THREE.PointLight(0xec4899, 6, 30);
        ptLight2.position.set(6, -4, 5);
        scene.add(ptLight2);

        // ── Object definitions ──────────────────────────────────────
        const SHAPE_TYPES = ['torusKnot', 'icosahedron', 'octahedron', 'torus', 'dodecahedron', 'tetrahedron'];
        const COUNT = isMobile ? 6 : 11;

        const toDispose = [];   // geometries + materials for cleanup
        const objects   = [];   // { mesh(wireframe), solidMesh, params }

        for (let i = 0; i < COUNT; i++) {
            const type     = SHAPE_TYPES[i % SHAPE_TYPES.length];
            const geo      = makeShape(type, isMobile);
            toDispose.push(geo);

            const colorIdx  = i % BRAND_COLORS.length;
            const baseColor = BRAND_COLORS[colorIdx].clone();

            // ── Wireframe shell ─────────────────────────────────
            const wireGeo = new THREE.WireframeGeometry(geo);
            toDispose.push(wireGeo);

            const wireMat = new THREE.LineBasicMaterial({
                color: baseColor,
                transparent: true,
                opacity: 0.55,
                depthWrite: false,
            });
            toDispose.push(wireMat);

            const wireMesh = new THREE.LineSegments(wireGeo, wireMat);

            // ── Solid inner mesh (slightly smaller, emissive glow) ─
            const solidMat = new THREE.MeshStandardMaterial({
                color: baseColor,
                emissive: baseColor,
                emissiveIntensity: 0.35,
                transparent: true,
                opacity: 0.08,
                depthWrite: false,
                side: THREE.FrontSide,
            });
            toDispose.push(solidMat);

            const solidScale = 0.88;
            const solidMesh  = new THREE.Mesh(geo, solidMat);
            solidMesh.scale.setScalar(solidScale);

            // Group to hold both
            const group = new THREE.Group();
            group.add(wireMesh);
            group.add(solidMesh);
            scene.add(group);

            // ── Position — spread across view ───────────────────
            // Use a fibonacci-spiral-like distribution
            const spread  = isMobile ? 4.5 : 7.5;
            const angle   = (i / COUNT) * Math.PI * 2;
            const radius  = spread * (0.3 + 0.7 * (i / COUNT));
            const depthZ  = -3 - (i / COUNT) * 5;

            group.position.set(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius * 0.6,
                depthZ
            );

            const scale = isMobile
                ? 0.35 + Math.random() * 0.3
                : 0.5 + Math.random() * 0.55;
            group.scale.setScalar(scale);

            objects.push({
                group,
                wireMat,
                solidMat,
                baseColor: baseColor.clone(),
                // Unique animation parameters per object
                phase:          (i / COUNT) * Math.PI * 2,
                freqX:          0.18 + i * 0.037,
                freqY:          0.14 + i * 0.029,
                freqZ:          0.11 + i * 0.021,
                rotSpeedX:      (0.008 + i * 0.003) * (i % 2 === 0 ? 1 : -1),
                rotSpeedY:      (0.012 + i * 0.004) * (i % 3 === 0 ? 1 : -1),
                rotSpeedZ:      (0.005 + i * 0.002) * (i % 2 === 0 ? -1 : 1),
                driftAmpX:      (0.4 + i * 0.06) * (isMobile ? 0.5 : 1),
                driftAmpY:      (0.28 + i * 0.04) * (isMobile ? 0.5 : 1),
                driftAmpZ:      0.18 + i * 0.025,
                originX:        group.position.x,
                originY:        group.position.y,
                originZ:        group.position.z,
                colorPhase:     (i / COUNT) * Math.PI * 4,
                colorSpeed:     0.003 + i * 0.0008,
            });
        }

        // ── 5. Particle System (Bubbles/Stars) ──
        const partCount = isMobile ? 160 : 400; // slightly lower for performance
        const partGeo   = new THREE.BufferGeometry();
        const partPos   = new Float32Array(partCount * 3);
        const partVels  = new Float32Array(partCount);
        
        for (let i = 0; i < partCount; i++) {
            partPos[i * 3]     = (Math.random() - 0.5) * 35;
            partPos[i * 3 + 1] = (Math.random() - 0.5) * 20;
            partPos[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;
            partVels[i]        = 0.002 + Math.random() * 0.006;
        }
        partGeo.setAttribute('position', new THREE.BufferAttribute(partPos, 3));
        toDispose.push(partGeo);

        const partMat = new THREE.PointsMaterial({
            color: 0xffffff,
            size: isMobile ? 0.05 : 0.035,
            transparent: true,
            opacity: 0.22,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
        toDispose.push(partMat);

        const particles = new THREE.Points(partGeo, partMat);
        scene.add(particles);

        // ── Unified Interaction (Pointer Events) ───────────────────
        let mx = 0, my = 0;
        const setPos = (x, y) => {
            mx = (x / window.innerWidth  - 0.5) * 2;
            my = (y / window.innerHeight - 0.5) * 2;
        };

        const onPointerMove = (e) => setPos(e.clientX, e.clientY);
        const onPointerDown = (e) => setPos(e.clientX, e.clientY);

        window.addEventListener('pointermove', onPointerMove, { passive: true });
        window.addEventListener('pointerdown', onPointerDown, { passive: true });

        // ── Resize handler ──────────────────────────────────────────
        const onResize = () => {
            // Use visual viewport if available for more accurate mobile height
            const w = window.innerWidth;
            const h = window.innerHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h, false);
        };
        window.addEventListener('resize', onResize);

        // ── RAF loop ────────────────────────────────────────────────
        let alive  = true;
        let rafId  = null;
        let t      = 0;
        let lerpMx = 0, lerpMy = 0;

        const tick = () => {
            if (!alive) return;

            t += 0.008;
            lerpMx += (mx - lerpMx) * 0.04;
            lerpMy += (my - lerpMy) * 0.04;

            const curOp = opacityRef.current;
            const tarOp = targetOpacityRef.current;
            if (Math.abs(curOp - tarOp) > 0.01) {
                opacityRef.current += (tarOp - curOp) * 0.035;
            }

            ptLight1.position.x = -6 + Math.sin(t * 0.3) * 2;
            ptLight1.position.y =  4 + Math.cos(t * 0.2) * 2;
            ptLight2.position.x =  6 + Math.cos(t * 0.25) * 2;
            ptLight2.position.y = -4 + Math.sin(t * 0.35) * 2;

            objects.forEach((obj) => {
                const { group, wireMat, solidMat, baseColor, phase, freqX, freqY, freqZ,
                        rotSpeedX, rotSpeedY, rotSpeedZ, driftAmpX, driftAmpY, driftAmpZ,
                        originX, originY, originZ, colorPhase, colorSpeed } = obj;

                const dx = Math.sin(t * freqX + phase)      * driftAmpX;
                const dy = Math.cos(t * freqY + phase + 1.3) * driftAmpY;
                const dz = Math.sin(t * freqZ + phase + 2.7) * driftAmpZ;

                // Magnetic "Push"
                const distToCursorX = (group.position.x / 10) - (lerpMx * 0.8);
                const distToCursorY = (group.position.y / 6)  - (-lerpMy * 0.8);
                const distance = Math.sqrt(distToCursorX * distToCursorX + distToCursorY * distToCursorY);
                const pushStrength = Math.max(0, 1.8 - distance) * 0.45;

                group.position.x = originX + dx + (lerpMx * 0.22) + (distToCursorX * pushStrength);
                group.position.y = originY + dy - (lerpMy * 0.18) + (distToCursorY * pushStrength);
                group.position.z = originZ + dz;

                group.rotation.x += rotSpeedX;
                group.rotation.y += rotSpeedY;
                group.rotation.z += rotSpeedZ;

                const cp = (t * colorSpeed + colorPhase);
                const c1 = BRAND_COLORS[Math.floor(cp) % BRAND_COLORS.length];
                const c2 = BRAND_COLORS[(Math.floor(cp) + 1) % BRAND_COLORS.length];
                const liveColor = c1.clone().lerp(c2, cp % 1);

                const pulse = 0.5 + Math.sin(t * 1.5 + phase) * 0.4;
                wireMat.color.copy(liveColor);
                solidMat.color.copy(liveColor);
                solidMat.emissive.copy(liveColor);
                solidMat.emissiveIntensity = 0.2 + pulse * 0.5;

                const op = opacityRef.current;
                wireMat.opacity  = 0.55 * op * 3;
                solidMat.opacity = 0.08 * op * 3;
            });

            // Particle Animation updates
            const positions = partGeo.attributes.position.array;
            for (let i = 0; i < partCount; i++) {
                positions[i * 3 + 1] += partVels[i];
                if (positions[i * 3 + 1] > 12) positions[i * 3 + 1] = -12;
            }
            partGeo.attributes.position.needsUpdate = true;
            particles.position.x = lerpMx * 0.45;
            particles.position.y = -lerpMy * 0.40;

            renderer.render(scene, camera);
            if (!prefersReduced) rafId = requestAnimationFrame(tick);
        };

        rafId = requestAnimationFrame(tick);

        return () => {
            alive = false;
            if (rafId) cancelAnimationFrame(rafId);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('resize',      onResize);

            scene.remove(particles);
            objects.forEach(({ group }) => scene.remove(group));
            scene.remove(ambLight, ptLight1, ptLight2);
            toDispose.forEach((obj) => obj.dispose?.());
            renderer.dispose();
        };
    }, [isCustomizer]); // re-run if customizer status changes

    if (isCustomizer) return null;

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 0,
                pointerEvents: 'none',
                opacity: 1,           // per-object opacity handled in Three.js
                mixBlendMode: 'screen',  // blends with PremiumBackground glows
                display: 'block',
            }}
            aria-hidden="true"
        />
    );
};

export default ProceduralBackground3D;

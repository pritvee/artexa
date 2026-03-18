import React, { Suspense, useMemo, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, RoundedBox, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const CHOC_CONFIG = {
    dairymilk: { color: '#5B2D8E', accent: '#FFD700', size: [0.6, 0.12, 0.32] },
    kitkat:    { color: '#D32F2F', accent: '#fff',     size: [0.55, 0.14, 0.28] },
    ferrero:   { color: '#D4AF37', accent: '#8B4513', size: [0.28, 0.28, 0.28], shape: 'sphere' },
    snickers:  { color: '#5D4037', accent: '#fff',     size: [0.6, 0.15, 0.3] },
    lindt:     { color: '#C2185B', accent: '#fff',     size: [0.32, 0.32, 0.32], shape: 'sphere' },
    toblerone: { color: '#F9A825', accent: '#8B4513', size: [0.55, 0.22, 0.22], shape: 'prism' },
    five_star: { color: '#FFD700', accent: '#8B4513', size: [0.5, 0.15, 0.25] },
    munch:     { color: '#1A237E', accent: '#fff',     size: [0.5, 0.12, 0.22] },
    perk:      { color: '#FDD835', accent: '#D32F2F', size: [0.55, 0.1, 0.2] },
    bournville:{ color: '#212121', accent: '#FFD700', size: [0.6, 0.12, 0.35] },
};

// ─── Utility: stable material cache (module-level, never re-created) ───
const globalMatCache = new Map();
function getCachedMaterial(color, props = {}) {
    const key = `${color}-${JSON.stringify(props)}`;
    if (!globalMatCache.has(key)) {
        globalMatCache.set(key, new THREE.MeshStandardMaterial({ color, ...props }));
    }
    return globalMatCache.get(key);
}

// ─── Shared Geometry Cache (module-level) ───
let sharedGeos = null;
function getSharedGeos() {
    if (!sharedGeos) {
        sharedGeos = {
            sphere:      new THREE.SphereGeometry(0.15, 14, 14),
            smallSphere: new THREE.SphereGeometry(0.1, 8, 8),
            dot:         new THREE.SphereGeometry(0.04, 8, 8),
            leaf:        new THREE.SphereGeometry(0.2, 12, 8),
        };
    }
    return sharedGeos;
}

// ─── Petal ───
const Petal = React.memo(({ angle, orbit, tilt, pSize, color, opacity = 1 }) => {
    const geos = getSharedGeos();
    const mat = useMemo(
        () => getCachedMaterial(color, { roughness: 0.7, side: THREE.DoubleSide, transparent: opacity < 1, opacity }),
        [color, opacity]
    );
    return (
        <mesh
            position={[Math.cos(angle) * orbit, Math.sin(tilt) * 0.2, Math.sin(angle) * orbit]}
            rotation={[tilt, -angle, 0]}
            scale={[pSize, pSize * 0.4, pSize * 1.3]}
            geometry={geos.sphere}
            material={mat}
        />
    );
});

// ─── RealisticRose ───
const RealisticRose = React.memo(({ position, color = '#e91e63', scale = 1 }) => {
    const geos = getSharedGeos();
    const innerColor = useMemo(() => new THREE.Color(color).clone().multiplyScalar(0.7).getStyle(), [color]);
    const outerColor = useMemo(() => new THREE.Color(color).clone().multiplyScalar(0.85).getStyle(), [color]);
    const innerMat = useMemo(() => getCachedMaterial(innerColor), [innerColor]);
    return (
        <group position={position} scale={[scale, scale, scale]}>
            <mesh geometry={geos.dot} material={innerMat} />
            {[0, 2, 4].map(i => <Petal key={`i${i}`} angle={(i / 3) * Math.PI * 2} orbit={0.06} tilt={-0.3} pSize={0.75} color={color} />)}
            {[0, 1, 2, 3, 4].map(i => <Petal key={`m${i}`} angle={(i / 5) * Math.PI * 2} orbit={0.16} tilt={-0.6} pSize={0.95} color={color} />)}
            {[0, 1, 2, 3, 4, 5, 6].map(i => <Petal key={`o${i}`} angle={(i / 7) * Math.PI * 2} orbit={0.3} tilt={-0.95} pSize={1.2} color={outerColor} />)}
        </group>
    );
});

// ─── SmallFlower ───
const SmallFlower = React.memo(({ position, color = '#f8bbd0', scale = 0.5 }) => {
    const geos = getSharedGeos();
    const mat = useMemo(() => getCachedMaterial(color), [color]);
    const whiteMat = useMemo(() => getCachedMaterial('#ffffff'), []);
    return (
        <group position={position} scale={[scale, scale, scale]}>
            {[0, 1, 2, 3].map(i => {
                const a = (i / 4) * Math.PI * 2;
                return (
                    <mesh key={i} position={[Math.cos(a) * 0.1, 0, Math.sin(a) * 0.1]} rotation={[0.2, -a, 0]} geometry={geos.smallSphere} material={mat} />
                );
            })}
            <mesh geometry={geos.dot} material={whiteMat} />
        </group>
    );
});

// ─── FlowerAccent ───
const FlowerAccent = React.memo(({ style }) => {
    const geos = getSharedGeos();
    const yPos = style === 'gift_basket' ? 2.3 : (style === 'wooden_box' ? 1.8 : 1.45);
    const leafMat = useMemo(() => getCachedMaterial('#1B5E20', { roughness: 0.8 }), []);
    return (
        <group position={[0, yPos, 0]}>
            <RealisticRose position={[0, 0.05, 0.1]} color="#FF80AB" scale={1.4} />
            <SmallFlower position={[-0.3, -0.1, 0.2]} color="#E1BEE7" scale={0.7} />
            <SmallFlower position={[0.25, -0.05, 0.15]} color="#FCE4EC" scale={0.65} />
            <SmallFlower position={[0, -0.15, 0.3]} color="#F8BBD0" scale={0.75} />
            {Array.from({ length: 3 }).map((_, i) => {
                const a = (i / 3) * Math.PI * 2 + 0.5;
                return (
                    <mesh key={i} position={[Math.cos(a) * 0.6, -0.05, Math.sin(a) * 0.4]} rotation={[0.4, a, 1.2]} scale={[1.2, 0.2, 2.2]}
                        geometry={geos.leaf} material={leafMat} />
                );
            })}
        </group>
    );
});

// ─── TulleWrap ───
const TulleWrap = React.memo(({ style }) => {
    const isLarge = style === 'wooden_box' || style === 'gift_basket';
    const meshColor = '#f9f6e6';
    const baseScale = isLarge ? 2.4 : 2.0;
    const yCenter = isLarge ? 1.0 : 0.8;
    const flareHeight = isLarge ? 1.9 : 1.55;
    const mat1 = useMemo(() => getCachedMaterial(meshColor, { transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false }), []);
    const mat2 = useMemo(() => getCachedMaterial(meshColor, { transparent: true, opacity: 0.15, side: THREE.DoubleSide, depthWrite: false }), []);
    return (
        <group>
            <mesh position={[0, yCenter, 0]}>
                <coneGeometry args={[baseScale, 2.5, 32, 2, true]} />
                <primitive object={mat1} attach="material" />
            </mesh>
            <group position={[0, flareHeight, 0]}>
                {Array.from({ length: 12 }).map((_, i) => (
                    <mesh key={i} rotation={[0, (i / 12) * Math.PI * 2, 0.4]}>
                        <sphereGeometry args={[0.55, 12, 12, 0, Math.PI, 0, Math.PI * 0.5]} />
                        <primitive object={mat2} attach="material" />
                    </mesh>
                ))}
            </group>
        </group>
    );
});

// ─── SatinRibbon ───
const SatinRibbon = React.memo(({ color = '#D32F2F', style }) => {
    const yPos = style === 'gift_basket' ? 2.3 : (style === 'wooden_box' ? 1.8 : 1.45);
    const mat = useMemo(() => getCachedMaterial(color, { roughness: 0.1, metalness: 0.4 }), [color]);
    return (
        <group position={[0, yPos - 0.1, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} material={mat}>
                <torusGeometry args={[0.3, 0.05, 12, 32]} />
            </mesh>
            <group position={[0, 0, 0.2]}>
                <mesh rotation={[0, 0.4, 0.3]} position={[-0.3, 0.1, 0]} material={mat}>
                    <torusGeometry args={[0.25, 0.06, 16, 32, Math.PI * 1.8]} />
                </mesh>
                <mesh rotation={[0, -0.4, -0.3]} position={[0.3, 0.1, 0]} material={mat}>
                    <torusGeometry args={[0.25, 0.06, 16, 32, Math.PI * 1.8]} />
                </mesh>
                <mesh position={[0, 0, 0.05]} material={mat}>
                    <sphereGeometry args={[0.1, 16, 16]} />
                </mesh>
            </group>
        </group>
    );
});

// ─── LatticeWall (used by HamperContainer) ───
const LatticeWall = React.memo(({ axis, pos, len, height, color }) => {
    const mat = useMemo(() => getCachedMaterial(color, { metalness: 0.9, roughness: 0.1 }), [color]);
    return (
        <group position={pos}>
            {[0, height / 2, -height / 2].map((y, i) => (
                <mesh key={i} position={[0, y, 0]}>
                    <boxGeometry args={[axis === 'x' ? len : 0.04, 0.04, axis === 'z' ? len : 0.04]} />
                    <primitive object={mat} attach="material" />
                </mesh>
            ))}
            {Array.from({ length: Math.ceil(len * 6) }).map((_, i) => (
                <mesh key={i} position={[axis === 'x' ? -len / 2 + (i / Math.ceil(len * 6)) * len : 0, 0, axis === 'z' ? -len / 2 + (i / Math.ceil(len * 6)) * len : 0]}>
                    <boxGeometry args={[axis === 'x' ? 0.02 : 0.05, height, axis === 'z' ? 0.02 : 0.05]} />
                    <primitive object={mat} attach="material" />
                </mesh>
            ))}
        </group>
    );
});

// ─── HamperContainer ───
const HamperContainer = React.memo(({ hStyle = 'gift_basket', color = '#D4AF37', hSize }) => {
    const sVal = (hSize?.value || 'medium').toLowerCase();
    const scFactor = sVal === 'small' ? 0.75 : (sVal === 'premium' ? 1.25 : 1.0);
    const W = 3.6 * scFactor, D = 2.8 * scFactor;
    const gold = color || '#D4AF37';

    const baseMat  = useMemo(() => getCachedMaterial(color, { roughness: 0.3, metalness: 0.6 }), [color]);
    const darkMat  = useMemo(() => getCachedMaterial('#2d1a0a', { roughness: 1 }), []);
    const goldMat  = useMemo(() => getCachedMaterial(gold, { metalness: 0.9, roughness: 0.1 }), [gold]);
    const goldMat1 = useMemo(() => getCachedMaterial(gold, { metalness: 1 }), [gold]);
    const goldHandleMat = useMemo(() => getCachedMaterial(gold, { metalness: 0.9, roughness: 0.1 }), [gold]);

    const darkerWood = useMemo(() => new THREE.Color(color).clone().multiplyScalar(0.7).getStyle(), [color]);
    const darkerMat  = useMemo(() => getCachedMaterial(darkerWood), [darkerWood]);
    const woodBase   = useMemo(() => new THREE.Color(color).getStyle(), [color]);
    const woodMat    = useMemo(() => getCachedMaterial(woodBase, { roughness: 0.9 }), [woodBase]);
    const woodMat2   = useMemo(() => getCachedMaterial(woodBase, { roughness: 0.8 }), [woodBase]);
    const woodMat3   = useMemo(() => getCachedMaterial(woodBase, { roughness: 0.7 }), [woodBase]);

    const basketMat  = useMemo(() => getCachedMaterial(color, { roughness: 0.8, side: THREE.DoubleSide }), [color]);
    const basketFloor = useMemo(() => getCachedMaterial(darkerWood), [darkerWood]);
    const basketRing  = useMemo(() => getCachedMaterial(color, { roughness: 0.9 }), [color]);
    const basketHandle = useMemo(() => getCachedMaterial(color), [color]);

    if (hStyle === 'luxury_box' || hStyle === 'rectangle_tray') {
        const wallH = 0.55;
        return (
            <group position={[0, -0.35, 0]}>
                <mesh position={[0, 0.02, 0]} receiveShadow><boxGeometry args={[W, 0.05, D]} /><primitive object={goldMat} attach="material" /></mesh>
                <LatticeWall axis="x" pos={[0, wallH / 2, D / 2]}  len={W} height={wallH} color={gold} />
                <LatticeWall axis="x" pos={[0, wallH / 2, -D / 2]} len={W} height={wallH} color={gold} />
                <LatticeWall axis="z" pos={[W / 2, wallH / 2, 0]}  len={D} height={wallH} color={gold} />
                <LatticeWall axis="z" pos={[-W / 2, wallH / 2, 0]} len={D} height={wallH} color={gold} />
                {[[-W / 2, D / 2], [W / 2, D / 2], [-W / 2, -D / 2], [W / 2, -D / 2]].map(([x, z], i) => (
                    <mesh key={i} position={[x, wallH, z]} material={goldMat1}><sphereGeometry args={[0.08, 16, 16]} /></mesh>
                ))}
                <mesh position={[0, wallH, 0]} rotation={[0, Math.PI / 2, 0]} material={goldHandleMat}>
                    <torusGeometry args={[1.2, 0.05, 16, 64, Math.PI]} />
                </mesh>
            </group>
        );
    }

    if (hStyle === 'wooden_box') {
        const boardT = 0.12;
        return (
            <group position={[0, -0.4, 0]}>
                <mesh position={[0, boardT / 2, 0]} receiveShadow><boxGeometry args={[W, boardT, D]} /><primitive object={woodMat} attach="material" /></mesh>
                {[{ pos: [0, 0.4, D / 2 - boardT / 2], size: [W, 0.8, boardT] }, { pos: [0, 0.4, -D / 2 + boardT / 2], size: [W, 0.8, boardT] },
                    { pos: [W / 2 - boardT / 2, 0.4, 0], size: [boardT, 0.8, D] }, { pos: [-W / 2 + boardT / 2, 0.4, 0], size: [boardT, 0.8, D] }].map((p, i) => (
                    <mesh key={i} position={p.pos} castShadow receiveShadow><boxGeometry args={p.size} /><primitive object={woodMat2} attach="material" /></mesh>
                ))}
                {[[-W / 2 + 0.06, D / 2 - 0.06], [W / 2 - 0.06, D / 2 - 0.06], [-W / 2 + 0.06, -D / 2 + 0.06], [W / 2 - 0.06, -D / 2 + 0.06]].map(([x, z], i) => (
                    <mesh key={i} position={[x, 0.4, z]} material={darkerMat}><boxGeometry args={[0.12, 0.8, 0.12]} /></mesh>
                ))}
                <group position={[0, 0, 0]}>
                    <mesh position={[-W / 2 - 0.05, 0.9, 0]} castShadow><boxGeometry args={[0.08, 1.8, 0.2]} /><primitive object={woodMat3} attach="material" /></mesh>
                    <mesh position={[W / 2 + 0.05, 0.9, 0]} castShadow><boxGeometry args={[0.08, 1.8, 0.2]} /><primitive object={woodMat3} attach="material" /></mesh>
                    <mesh position={[0, 1.8, 0]} castShadow><boxGeometry args={[W + 0.2, 0.1, 0.2]} /><primitive object={woodMat3} attach="material" /></mesh>
                </group>
            </group>
        );
    }

    if (hStyle === 'gift_basket') {
        return (
            <group position={[0, -0.4, 0]}>
                <mesh position={[0, 0.35, 0]} rotation={[Math.PI, 0, 0]} castShadow receiveShadow>
                    <cylinderGeometry args={[1.8, 1.4, 0.7, 32, 1, true]} />
                    <primitive object={basketMat} attach="material" />
                </mesh>
                <mesh position={[0, 0, 0]} material={basketFloor}><cylinderGeometry args={[1.4, 1.4, 0.05, 32]} /></mesh>
                {Array.from({ length: 8 }).map((_, i) => (
                    <mesh key={i} position={[0, i * 0.09, 0]} rotation={[Math.PI / 2, 0, 0]} material={basketRing}>
                        <torusGeometry args={[1.4 + (i * 0.4 / 8), 0.03, 12, 64]} />
                    </mesh>
                ))}
                <group position={[0, 0.65, 0]}>
                    <mesh castShadow material={basketHandle}><torusGeometry args={[1.8, 0.08, 16, 64, Math.PI]} /></mesh>
                </group>
            </group>
        );
    }

    return null;
});

// ─── DecorationItem ───
const DecorationItem = React.memo(({ type, position, rotation, color = '#ff4081' }) => {
    const geos = getSharedGeos();
    const mat = useMemo(() => getCachedMaterial(color), [color]);
    const starMat = useMemo(() => getCachedMaterial(color, { metalness: 0.6, roughness: 0.2 }), [color]);
    switch (type) {
        case 'heart':
            return (
                <group position={position} rotation={rotation} scale={0.4}>
                    <mesh castShadow material={mat} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.4, 0.4, 0.15, 3]} /></mesh>
                    <mesh position={[-0.2, 0, -0.1]} castShadow material={mat} geometry={geos.leaf} />
                    <mesh position={[0.2, 0, -0.1]} castShadow material={mat} geometry={geos.leaf} />
                </group>
            );
        case 'star':
            return <mesh position={position} rotation={rotation} castShadow scale={0.35} material={starMat}><octahedronGeometry args={[0.5]} /></mesh>;
        case 'confetti':
            return <mesh position={position} rotation={rotation} castShadow material={mat}><boxGeometry args={[0.1, 0.01, 0.15]} /></mesh>;
        default: return null;
    }
});

// ─── Realistic Chocolate Shapes ───

const DairyMilkShape = ({ color = '#5B2D8E', size = [0.6, 0.12, 0.32] }) => {
    const barMat = useMemo(() => getCachedMaterial('#3d1f05', { roughness: 0.4 }), []);
    const wrapperMat = useMemo(() => getCachedMaterial(color, { roughness: 0.2, metalness: 0.8 }), [color]);
    const goldMat = useMemo(() => getCachedMaterial('#D4AF37', { metalness: 1, roughness: 0.2 }), []);

    return (
        <group>
            {/* The Chocolate Bar Inside */}
            <mesh position={[0, -0.01, 0]}>
                <boxGeometry args={[size[0] - 0.05, size[1], size[2] - 0.05]} />
                <primitive object={barMat} attach="material" />
            </mesh>
            {/* The Wrapper */}
            <RoundedBox args={[size[0], size[1] + 0.02, size[2]]} radius={0.02} smoothness={4} castShadow>
                <primitive object={wrapperMat} attach="material" />
            </RoundedBox>
            {/* Foil Strip */}
            <mesh position={[-size[0] * 0.2, 0, 0]}>
                <boxGeometry args={[size[0] * 0.15, size[1] + 0.03, size[2] + 0.005]} />
                <primitive object={goldMat} attach="material" />
            </mesh>
            {/* Dairy Milk Label Logo (White stripe) */}
            <mesh position={[0, size[1] / 2 + 0.012, 0]}>
                <boxGeometry args={[size[0] * 0.6, 0.005, size[2] * 0.4]} />
                <meshStandardMaterial color="white" roughness={0.5} />
            </mesh>
        </group>
    );
};

const FerreroRocherShape = () => {
    const foilMat = useMemo(() => getCachedMaterial('#D4AF37', { 
        metalness: 1, roughness: 0.4, 
        bumpScale: 0.1,
    }), []);
    const labelMat = useMemo(() => getCachedMaterial('#fff', { roughness: 0.5 }), []);
    const brownMat = useMemo(() => getCachedMaterial('#5D4037', { roughness: 0.8 }), []);

    return (
        <group>
            {/* Crinkled Gold Foil Sphere */}
            <mesh castShadow>
                <sphereGeometry args={[0.2, 32, 32]} />
                <primitive object={foilMat} attach="material" />
            </mesh>
            {/* Signature White Label Band */}
            <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.205, 0.03, 16, 32]} />
                <primitive object={labelMat} attach="material" />
            </mesh>
            {/* Dark Chocolate Base Cup */}
            <mesh position={[0, -0.15, 0]} rotation={[Math.PI, 0, 0]}>
                <cylinderGeometry args={[0.15, 0.1, 0.1, 16]} />
                <primitive object={brownMat} attach="material" />
            </mesh>
        </group>
    );
};

const KitKatShape = ({ size = [0.55, 0.14, 0.28] }) => {
    const redMat = useMemo(() => getCachedMaterial('#D32F2F', { roughness: 0.2, metalness: 0.5 }), []);
    const innerMat = useMemo(() => getCachedMaterial('#fff', { roughness: 0.8 }), []);
    
    return (
        <group>
            <RoundedBox args={size} radius={0.02} smoothness={4} castShadow>
                <primitive object={redMat} attach="material" />
            </RoundedBox>
            {/* Separate the 2 bars with a groove */}
            <mesh position={[0, size[1] / 2 + 0.001, 0]}>
                <boxGeometry args={[size[0] - 0.05, 0.005, 0.02]} />
                <meshStandardMaterial color="#b71c1c" roughness={0.8} />
            </mesh>
            {/* Logo area */}
            <mesh position={[0, size[1] / 2 + 0.008, 0]}>
                <boxGeometry args={[size[0] * 0.6, 0.005, size[2] * 0.5]} />
                <primitive object={innerMat} attach="material" />
            </mesh>
        </group>
    );
};

const SnickersShape = ({ size = [0.6, 0.15, 0.3] }) => {
    const brownMat = useMemo(() => getCachedMaterial('#5D4037', { roughness: 0.3, metalness: 0.2 }), []);
    const blueMat = useMemo(() => getCachedMaterial('#1A237E', { roughness: 0.4 }), []);
    
    return (
        <group>
            {/* Main Wrapper */}
            <RoundedBox args={size} radius={0.03} smoothness={4} castShadow>
                <primitive object={brownMat} attach="material" />
            </RoundedBox>
            {/* Blue Banner with Text area */}
            <mesh position={[0, size[1] / 2 + 0.008, 0]}>
                <boxGeometry args={[size[0] * 0.7, 0.005, size[2] * 0.6]} />
                <primitive object={blueMat} attach="material" />
            </mesh>
            {/* White inner for text simulation */}
            <mesh position={[0, size[1] / 2 + 0.012, 0]}>
                <boxGeometry args={[size[0] * 0.5, 0.002, size[2] * 0.3]} />
                <meshStandardMaterial color="white" />
            </mesh>
        </group>
    );
};

const TobleroneShape = ({ size = [0.55, 0.22, 0.22] }) => {
    const goldMat = useMemo(() => getCachedMaterial('#F9A825', { roughness: 0.3, metalness: 0.6 }), []);
    const blackMat = useMemo(() => getCachedMaterial('#212121', { roughness: 0.8 }), []);
    
    return (
        <group rotation={[0, 0, 0]}>
            {/* Triangular Prism Geometry */}
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[size[1], size[1], size[0], 3]} />
                <primitive object={goldMat} attach="material" />
            </mesh>
            {/* Mountain Logo strip */}
            <mesh position={[0, size[1] / 2, 0]}>
                <boxGeometry args={[size[0] * 0.4, 0.01, size[2] * 0.1]} />
                <primitive object={blackMat} attach="material" />
            </mesh>
        </group>
    );
};

const LindtShape = ({ color = '#C2185B' }) => {
    const foilMat = useMemo(() => getCachedMaterial(color, { metalness: 0.9, roughness: 0.2 }), [color]);
    const goldMat = useMemo(() => getCachedMaterial('#D4AF37', { metalness: 1, roughness: 0.1 }), []);
    
    return (
        <group>
            {/* Shiny Foil Ball */}
            <mesh castShadow>
                <sphereGeometry args={[0.2, 32, 32]} />
                <primitive object={foilMat} attach="material" />
            </mesh>
            {/* Foil "Tails" on sides (Lindor style) */}
            <mesh position={[-0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.5, 1, 1]}>
                <coneGeometry args={[0.1, 0.15, 8]} />
                <primitive object={foilMat} attach="material" />
            </mesh>
            <mesh position={[0.2, 0, 0]} rotation={[0, 0, -Math.PI / 2]} scale={[0.5, 1, 1]}>
                <coneGeometry args={[0.1, 0.15, 8]} />
                <primitive object={foilMat} attach="material" />
            </mesh>
            {/* Gold Seal Label */}
            <mesh position={[0, 0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.08, 16]} />
                <primitive object={goldMat} attach="material" />
            </mesh>
        </group>
    );
};

// ─── ChocolateItem ───
const ChocolateItem = React.memo(({ type, position, rotation }) => {
    const config = CHOC_CONFIG[type] || CHOC_CONFIG.dairymilk;
    const { color, size } = config;
    
    let ShapeComp;
    switch (type) {
        case 'dairymilk': ShapeComp = <DairyMilkShape color={color} size={size} />; break;
        case 'ferrero':    ShapeComp = <FerreroRocherShape />; break;
        case 'kitkat':     ShapeComp = <KitKatShape size={size} />; break;
        case 'snickers':   ShapeComp = <SnickersShape size={size} />; break;
        case 'toblerone':  ShapeComp = <TobleroneShape size={size} />; break;
        case 'lindt':      ShapeComp = <LindtShape color={color} />; break;
        default:
            const barMat = useMemo(() => getCachedMaterial(color, { roughness: 0.4, metalness: 0.3 }), [color]);
            ShapeComp = (
                <RoundedBox args={size || [0.5, 0.15, 0.25]} radius={0.03} smoothness={4} castShadow>
                    <primitive object={barMat} attach="material" />
                </RoundedBox>
            );
    }

    return (
        <group position={position} rotation={rotation}>
            {ShapeComp}
        </group>
    );
});

// ─── Main Component ───
const ChocolateHamper3DPreview = ({ containerStyle, hamperColor, size, chocolates = [], decorations = [] }) => {
    const [canvasKey, setCanvasKey] = React.useState(0);
    const sVal = (size?.value || 'medium').toLowerCase();
    const scFactor = sVal === 'small' ? 0.75 : (sVal === 'premium' ? 1.25 : 1.0);

    const triggerContextRecovery = React.useCallback(() => {
        console.warn('ChocolateHamper3D: WebGL Context Lost — recovering...');
        setCanvasKey(prev => prev + 1);
    }, []);

    const getItemY = () => {
        if (containerStyle === 'gift_basket') return -0.38;
        if (containerStyle === 'wooden_box') return -0.28;
        if (containerStyle === 'rectangle_tray' || containerStyle === 'luxury_box') return -0.32;
        return -0.3;
    };
    const hasDecor = (t) => decorations.some(d => d.type === t);
    const ribbonDecor = decorations.find(d => d.type === 'ribbon');

    const glConfig = React.useMemo(() => ({ 
        antialias: true, 
        powerPreference: 'high-performance',
        stencil: false,
        depth: true,
        failIfMajorPerformanceCaveat: false
    }), []);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', background: 'linear-gradient(to bottom, #0f0f1a, #050508)' }}>
            <Canvas 
                key={canvasKey}
                shadows={{ type: THREE.PCFShadowMap }} 
                camera={{ position: [0, 6, 8], fov: 35 }} 
                dpr={[1, 2]} 
                gl={glConfig}
                onCreated={({ gl, scene }) => {
                    const handleContextLost = (event) => {
                        event.preventDefault();
                        triggerContextRecovery();
                    };

                    const canvas = gl.domElement;
                    canvas.addEventListener('webglcontextlost', handleContextLost, false);
                    
                    // Cleanup
                    return () => {
                        canvas.removeEventListener('webglcontextlost', handleContextLost);
                        if (gl.forceContextLoss) gl.forceContextLoss();
                        if (gl.dispose) gl.dispose();
                        scene.clear();
                    };
                }}
            >
                <Suspense fallback={null}>
                    <ambientLight intensity={0.7} />
                    <spotLight position={[5, 15, 5]} angle={0.3} penumbra={1} intensity={2} castShadow />
                    <Environment preset="apartment" />
                    <group position={[0, 0, 0]}>
                        <HamperContainer hStyle={containerStyle} color={hamperColor} hSize={size} />
                        <group position={[0, getItemY(), 0]}>
                            {chocolates.map(c => (
                                <ChocolateItem
                                    key={c.id}
                                    type={c.type}
                                    position={[((c.x - 310) / 160) * scFactor, (CHOC_CONFIG[c.type]?.size[1] || 0.15) / 2, ((c.y - 260) / 160) * scFactor]}
                                    rotation={[0, (c.rotation || 0) * (Math.PI / 180), 0]}
                                />
                            ))}
                            {decorations.map(d => (
                                <DecorationItem
                                    key={d.id}
                                    type={d.type}
                                    position={[((d.x - 310) / 160) * scFactor, 0.05, ((d.y - 260) / 160) * scFactor]}
                                    rotation={[0, (d.rotation || 0) * (Math.PI / 180), 0]}
                                    color={d.color}
                                />
                            ))}
                        </group>
                        {hasDecor('wrapping') && <TulleWrap style={containerStyle} />}
                        {hasDecor('ribbon') && <SatinRibbon color={ribbonDecor?.color || '#D32F2F'} style={containerStyle} />}
                        {hasDecor('flower') && <FlowerAccent style={containerStyle} />}
                    </group>
                    <OrbitControls enablePan={false} minDistance={3} maxDistance={12} minPolarAngle={0} maxPolarAngle={Math.PI / 2.2} makeDefault />
                </Suspense>
            </Canvas>
        </div>
    );
};

ChocolateHamper3DPreview.propTypes = {
    containerStyle: PropTypes.string,
    hamperColor: PropTypes.string,
    size: PropTypes.object,
    chocolates: PropTypes.array,
    decorations: PropTypes.array
};

export default ChocolateHamper3DPreview;

import React, { useRef, useState, useMemo, Suspense } from 'react';
import PropTypes from 'prop-types';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, RoundedBox, Text, Float } from '@react-three/drei';
import * as THREE from 'three';

/* ─── Item visual config ─── */
const ITEM_CONFIG = {
    chocolates:     { color: '#5C3317', label: 'Chocolates' },
    perfume:        { color: '#C78DA8', label: 'Perfume' },
    dairy_milk:     { color: '#4F2E80', label: 'Dairy Milk', shape: 'box' },
    ferrero_rocher: { color: '#D4AF37', label: 'Ferrero Rocher', shape: 'sphere_gold' },
    teddy_bear:     { color: '#C19A6B', label: 'Teddy Bear', shape: 'teddy' },
    frame_4x4:      { color: '#E0E0E0', label: '4x4 Frame', shape: 'frame' },
    frame_5x5:      { color: '#E0E0E0', label: '5x5 Frame', shape: 'frame' },
    crystal_cube:   { color: '#B2EBF2', label: 'Crystal Cube', shape: 'crystal' },
};

/* ─── Helpers ─── */
function scaleDim(bd) {
    const factor = 45; 
    return {
        w: (bd?.w || 110) / factor,
        d: (bd?.d || 100) / factor,
        h: (bd?.h || 75) / factor,
    };
}

function buildMat(color, mat) {
    switch (mat) {
        case 'glossy':    return { color, roughness: 0.1, metalness: 0.4 };
        case 'velvet':    return { color, roughness: 1.0, metalness: 0.0 };
        case 'gold_foil': return { color: '#E5C100', roughness: 0.15, metalness: 1.0 };
        case 'kraft':     return { color: '#B88B4A', roughness: 0.95, metalness: 0.0 };
        default:          return { color, roughness: 0.55, metalness: 0.1 };
    }
}

/* ─── Ribbon components ─── */
const Bow = ({ color, scale = 1 }) => {
    return (
        <group scale={scale} position={[0, 0.02, 0]}>
            <mesh position={[-0.1, 0.05, 0]} rotation={[0, 0, Math.PI / 4]}>
                <torusGeometry args={[0.08, 0.025, 8, 20]} />
                <meshStandardMaterial color={color} roughness={0.3} />
            </mesh>
            <mesh position={[0.1, 0.05, 0]} rotation={[0, 0, -Math.PI / 4]}>
                <torusGeometry args={[0.08, 0.025, 8, 20]} />
                <meshStandardMaterial color={color} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.02, 0]}>
                <sphereGeometry args={[0.04, 16, 16]} />
                <meshStandardMaterial color={color} roughness={0.3} />
            </mesh>
            <mesh position={[-0.06, -0.05, 0]} rotation={[0, 0, Math.PI / 6]}>
                <boxGeometry args={[0.02, 0.12, 0.005]} />
                <meshStandardMaterial color={color} />
            </mesh>
            <mesh position={[0.06, -0.05, 0]} rotation={[0, 0, -Math.PI / 6]}>
                <boxGeometry args={[0.02, 0.12, 0.005]} />
                <meshStandardMaterial color={color} />
            </mesh>
        </group>
    );
};

const RibbonSystem = ({ dim, settings, isOpen, isLidPart }) => {
    if (!settings || !settings.enabled) return null;
    const { style, color, width, showBow } = settings;

    const { w, h, d } = dim;
    const ribW = (width / 150) || 0.15;
    const thick = 0.025;
    const offset = 0.02;

    const verticalWrap = (
        <group>
            <mesh position={[0, h / 2, d / 2 + offset]}>
                <boxGeometry args={[ribW, h, thick]} />
                <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
            </mesh>
            <mesh position={[0, h / 2, -d / 2 - offset]}>
                <boxGeometry args={[ribW, h, thick]} />
                <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
            </mesh>
            <mesh position={[-w / 2 - offset, h / 2, 0]}>
                <boxGeometry args={[thick, h, ribW]} />
                <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
            </mesh>
            <mesh position={[w / 2 + offset, h / 2, 0]}>
                <boxGeometry args={[thick, h, ribW]} />
                <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
            </mesh>
            <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <boxGeometry args={[ribW, d + offset * 2, thick]} />
                <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
            </mesh>
            <mesh position={[0, -0.005, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <boxGeometry args={[w + offset * 2, ribW, thick]} />
                <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
            </mesh>
        </group>
    );

    const showWrap = style === 'side' || style === 'cross' || style === 'full' || style === 'side_only';
    const showHorizontal = style === 'full';

    const horizontalWrap = (
        <group>
            <mesh position={[0, h / 2, d / 2 + offset]}>
                <boxGeometry args={[w + offset * 2, ribW, thick]} />
                <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
            </mesh>
            <mesh position={[0, h / 2, -d / 2 - offset]}>
                <boxGeometry args={[w + offset * 2, ribW, thick]} />
                <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
            </mesh>
            <mesh position={[-w / 2 - offset, h / 2, 0]}>
                <boxGeometry args={[thick, ribW, d + offset * 2]} />
                <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
            </mesh>
            <mesh position={[w / 2 + offset, h / 2, 0]}>
                <boxGeometry args={[thick, ribW, d + offset * 2]} />
                <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
            </mesh>
        </group>
    );

    if (isLidPart) {
        const hasTopStrap = style === 'top' || style === 'cross' || style === 'full';
        const hasCrossStrap = style === 'cross' || style === 'full';
        const hasBow = showBow && style !== 'side' && style !== 'side_only';

        return (
            <group position={[0, 0, 0]}>
                {hasTopStrap && (
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                        <boxGeometry args={[ribW, d + offset * 2, thick * 1.5]} />
                        <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
                    </mesh>
                )}
                {hasCrossStrap && (
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
                        <boxGeometry args={[w + offset * 2, ribW, thick * 1.5]} />
                        <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
                    </mesh>
                )}
                {hasBow && (
                    <group position={[0, 0.05, 0]}>
                        <Bow color={color} scale={ribW * 8} />
                    </group>
                )}
            </group>
        );
    }

    return (
        <group position={[0, 0, 0]}>
            {showWrap && verticalWrap}
            {showHorizontal && horizontalWrap}
        </group>
    );
};

/* ─── 3D Item inside the box ─── */

// Frame with photo
const FrameItemWithPhoto = ({ cfg, scale, photoUrl }) => {
    const texture = useLoader(THREE.TextureLoader, photoUrl, (loader) => {
        loader.setCrossOrigin('anonymous');
    });
    
    return (
        <group rotation={[-Math.PI/2, 0, 0]} position={[0, scale*0.1, 0]}>
            <mesh castShadow position={[0, 0, -scale*0.1]}>
                <boxGeometry args={[scale*2.2, scale*2.2, scale*0.2]} />
                <meshStandardMaterial color="#8B4513" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0, 0.01]}>
                <planeGeometry args={[scale*1.8, scale*1.8]} />
                <meshBasicMaterial map={texture} />
            </mesh>
        </group>
    );
};

const FrameItemEmpty = ({ cfg, scale }) => (
    <group rotation={[-Math.PI/2, 0, 0]} position={[0, scale*0.1, 0]}>
        <mesh castShadow position={[0, 0, -scale*0.1]}>
            <boxGeometry args={[scale*2.2, scale*2.2, scale*0.2]} />
            <meshStandardMaterial color="#8B4513" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[scale*1.8, scale*1.8]} />
            <meshBasicMaterial color="#e0e0e0" />
        </mesh>
    </group>
);

/* ─── Realistic Dairy Milk Bar ─── */
const DairyMilkShape = ({ scale }) => (
    <group position={[0, scale * 0.18, 0]}>
        {/* Main wrapper */}
        <RoundedBox args={[scale * 1.9, scale * 0.35, scale * 1.0]} radius={0.02} smoothness={4} castShadow>
            <meshStandardMaterial color="#4A0E78" roughness={0.5} metalness={0.15} />
        </RoundedBox>
        {/* Foil strip on top */}
        <mesh position={[0, scale * 0.18, 0]}>
            <boxGeometry args={[scale * 1.85, scale * 0.01, scale * 0.95]} />
            <meshStandardMaterial color="#C9B037" metalness={0.8} roughness={0.15} />
        </mesh>
        {/* Brand label */}
        <mesh position={[0, scale * 0.19, 0]}>
            <boxGeometry args={[scale * 1.2, scale * 0.005, scale * 0.5]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.8} />
        </mesh>
        {/* Chocolate segments underneath (visible subtle detail) */}
        {[-0.5, 0, 0.5].map((xo, i) => (
            <mesh key={i} position={[xo * scale, -scale * 0.03, 0]} castShadow>
                <boxGeometry args={[scale * 0.55, scale * 0.28, scale * 0.9]} />
                <meshStandardMaterial color="#3A0A60" roughness={0.6} />
            </mesh>
        ))}
    </group>
);

/* ─── Realistic Ferrero Rocher ─── */
const FerreroRocherShape = ({ scale }) => (
    <group position={[0, scale * 0.5, 0]}>
        {/* Gold foil ball */}
        <mesh castShadow>
            <sphereGeometry args={[scale * 0.65, 32, 32]} />
            <meshStandardMaterial color="#C9A032" metalness={0.95} roughness={0.08} />
        </mesh>
        {/* Crinkle texture layer */}
        <mesh scale={1.02}>
            <sphereGeometry args={[scale * 0.65, 12, 8]} />
            <meshStandardMaterial color="#B8912A" metalness={0.7} roughness={0.25} wireframe />
        </mesh>
        {/* Inner dark chocolate visible at top seam */}
        <mesh position={[0, scale * 0.2, 0]} rotation={[0.3, 0, 0]}>
            <sphereGeometry args={[scale * 0.35, 16, 16, 0, Math.PI * 2, 0, Math.PI / 3]} />
            <meshStandardMaterial color="#5C3A1E" roughness={0.7} />
        </mesh>
        {/* Wafer cup at the bottom */}
        <mesh position={[0, -scale * 0.52, 0]}>
            <cylinderGeometry args={[scale * 0.45, scale * 0.55, scale * 0.2, 16]} />
            <meshStandardMaterial color="#8B6914" roughness={0.9} />
        </mesh>
        {/* Signature label on top */}
        <mesh position={[0, scale * 0.67, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[scale * 0.18, 16]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.9} />
        </mesh>
    </group>
);

/* ─── Realistic Teddy Bear ─── */
const TeddyBearShape = ({ scale }) => (
    <group position={[0, scale * 0.4, 0]}>
        {/* Body (slightly egg-shaped) */}
        <mesh position={[0, -scale * 0.15, 0]} castShadow>
            <sphereGeometry args={[scale * 0.85, 20, 20]} />
            <meshStandardMaterial color="#C19A6B" roughness={0.95} />
        </mesh>
        {/* Tummy patch */}
        <mesh position={[0, -scale * 0.15, scale * 0.72]}>
            <sphereGeometry args={[scale * 0.55, 16, 16]} />
            <meshStandardMaterial color="#E8D5B7" roughness={0.95} />
        </mesh>
        {/* Head */}
        <mesh position={[0, scale * 0.65, 0]} castShadow>
            <sphereGeometry args={[scale * 0.6, 20, 20]} />
            <meshStandardMaterial color="#C19A6B" roughness={0.95} />
        </mesh>
        {/* Snout */}
        <mesh position={[0, scale * 0.52, scale * 0.45]}>
            <sphereGeometry args={[scale * 0.22, 16, 16]} />
            <meshStandardMaterial color="#E8D5B7" roughness={0.95} />
        </mesh>
        {/* Nose */}
        <mesh position={[0, scale * 0.56, scale * 0.65]}>
            <sphereGeometry args={[scale * 0.08, 12, 12]} />
            <meshStandardMaterial color="#2C1810" roughness={0.4} />
        </mesh>
        {/* Eyes */}
        {[-1, 1].map((side, i) => (
            <mesh key={i} position={[side * scale * 0.2, scale * 0.72, scale * 0.5]}>
                <sphereGeometry args={[scale * 0.07, 12, 12]} />
                <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.6} />
            </mesh>
        ))}
        {/* Ears */}
        {[-1, 1].map((side, i) => (
            <group key={`ear-${i}`}>
                <mesh position={[side * scale * 0.45, scale * 1.05, 0]} castShadow>
                    <sphereGeometry args={[scale * 0.2, 16, 16]} />
                    <meshStandardMaterial color="#C19A6B" roughness={0.95} />
                </mesh>
                <mesh position={[side * scale * 0.45, scale * 1.05, scale * 0.08]}>
                    <sphereGeometry args={[scale * 0.12, 12, 12]} />
                    <meshStandardMaterial color="#E8A0B0" roughness={0.9} />
                </mesh>
            </group>
        ))}
        {/* Arms */}
        {[-1, 1].map((side, i) => (
            <mesh key={`arm-${i}`} position={[side * scale * 0.75, scale * 0.1, scale * 0.15]} rotation={[0.3, side * 0.5, side * 0.7]} castShadow>
                <capsuleGeometry args={[scale * 0.18, scale * 0.5, 8, 8]} />
                <meshStandardMaterial color="#B08A5B" roughness={0.95} />
            </mesh>
        ))}
        {/* Legs */}
        {[-1, 1].map((side, i) => (
            <mesh key={`leg-${i}`} position={[side * scale * 0.35, -scale * 0.85, scale * 0.2]} rotation={[0.5, 0, 0]} castShadow>
                <capsuleGeometry args={[scale * 0.22, scale * 0.35, 8, 8]} />
                <meshStandardMaterial color="#B08A5B" roughness={0.95} />
            </mesh>
        ))}
        {/* Bow Tie */}
        <mesh position={[0, scale * 0.25, scale * 0.7]} rotation={[0.3, 0, 0]}>
            <torusGeometry args={[scale * 0.1, scale * 0.04, 8, 16]} />
            <meshStandardMaterial color="#E53935" roughness={0.4} />
        </mesh>
        <mesh position={[0, scale * 0.25, scale * 0.73]} rotation={[0.3, 0, 0]}>
            <sphereGeometry args={[scale * 0.05, 8, 8]} />
            <meshStandardMaterial color="#E53935" roughness={0.4} />
        </mesh>
    </group>
);

/* ─── Realistic Perfume Bottle ─── */
const PerfumeShape = ({ scale }) => (
    <group position={[0, scale * 0.3, 0]}>
        {/* Glass body */}
        <mesh castShadow position={[0, 0, 0]}>
            <cylinderGeometry args={[scale * 0.45, scale * 0.55, scale * 1.4, 24]} />
            <meshPhysicalMaterial 
                color="#E8B4C8" 
                transmission={0.6} 
                thickness={1.5} 
                roughness={0.05} 
                metalness={0.05}
                transparent
                opacity={0.7}
            />
        </mesh>
        {/* Liquid inside */}
        <mesh position={[0, -scale * 0.15, 0]}>
            <cylinderGeometry args={[scale * 0.38, scale * 0.48, scale * 0.9, 20]} />
            <meshStandardMaterial color="#D4648E" roughness={0.3} transparent opacity={0.85} />
        </mesh>
        {/* Bottle neck */}
        <mesh position={[0, scale * 0.85, 0]}>
            <cylinderGeometry args={[scale * 0.15, scale * 0.3, scale * 0.35, 16]} />
            <meshPhysicalMaterial 
                color="#E8B4C8" 
                transmission={0.5} 
                roughness={0.05}
                transparent
                opacity={0.7}
            />
        </mesh>
        {/* Gold cap */}
        <mesh position={[0, scale * 1.15, 0]} castShadow>
            <cylinderGeometry args={[scale * 0.2, scale * 0.18, scale * 0.35, 16]} />
            <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Cap tip */}
        <mesh position={[0, scale * 1.35, 0]}>
            <sphereGeometry args={[scale * 0.12, 12, 12]} />
            <meshStandardMaterial color="#D4AF37" metalness={0.95} roughness={0.05} />
        </mesh>
        {/* Label band */}
        <mesh position={[0, 0.02, scale * 0.56]}>
            <boxGeometry args={[scale * 0.6, scale * 0.4, scale * 0.01]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.9} />
        </mesh>
    </group>
);

/* ─── Realistic Assorted Chocolates Box ─── */
const ChocolatesBoxShape = ({ scale }) => (
    <group position={[0, scale * 0.2, 0]}>
        {/* Box base */}
        <RoundedBox args={[scale * 2.0, scale * 0.35, scale * 1.3]} radius={0.02} smoothness={4} castShadow>
            <meshStandardMaterial color="#5C3317" roughness={0.7} />
        </RoundedBox>
        {/* Individual chocolates arranged inside */}
        {[
            { x: -0.5, z: -0.25, color: '#2C1810', type: 'sphere' },
            { x: 0, z: -0.25, color: '#D4AF37', type: 'sphere' },
            { x: 0.5, z: -0.25, color: '#8B4513', type: 'sphere' },
            { x: -0.25, z: 0.25, color: '#3E2723', type: 'box' },
            { x: 0.25, z: 0.25, color: '#C2185B', type: 'box' },
        ].map((choc, i) => (
            <group key={i} position={[choc.x * scale, scale * 0.25, choc.z * scale]}>
                {choc.type === 'sphere' ? (
                    <mesh castShadow>
                        <sphereGeometry args={[scale * 0.18, 16, 16]} />
                        <meshStandardMaterial color={choc.color} roughness={0.3} metalness={choc.color === '#D4AF37' ? 0.8 : 0.1} />
                    </mesh>
                ) : (
                    <RoundedBox args={[scale * 0.35, scale * 0.15, scale * 0.25]} radius={0.01} smoothness={2} castShadow>
                        <meshStandardMaterial color={choc.color} roughness={0.5} />
                    </RoundedBox>
                )}
            </group>
        ))}
    </group>
);

/* ─── Crystal Cube ─── */
const CrystalCubeShape = ({ scale }) => (
    <group position={[0, scale * 0.5, 0]}>
        <mesh castShadow>
            <boxGeometry args={[scale * 1.5, scale * 1.5, scale * 1.5]} />
            <meshPhysicalMaterial 
                color="#B2EBF2" 
                transmission={0.9} 
                thickness={0.5} 
                roughness={0} 
                metalness={0.1}
                transparent
                opacity={0.6}
            />
        </mesh>
        {/* Inner etching effect */}
        <mesh scale={0.7}>
            <boxGeometry args={[scale * 1.5, scale * 1.5, scale * 1.5]} />
            <meshStandardMaterial color="#fff" wireframe opacity={0.15} transparent />
        </mesh>
        {/* LED glow at base */}
        <mesh position={[0, -scale * 0.72, 0]}>
            <boxGeometry args={[scale * 1.6, scale * 0.08, scale * 1.6]} />
            <meshStandardMaterial color="#1a1a2e" roughness={0.3} />
        </mesh>
    </group>
);

const ItemShape = ({ cfg, scale, photoUrl }) => {
    switch (cfg.shape) {
        case 'box':
            return <DairyMilkShape scale={scale} />;
        case 'sphere_gold':
            return <FerreroRocherShape scale={scale} />;
        case 'teddy':
            return <TeddyBearShape scale={scale} />;
        case 'frame':
            return photoUrl
                ? <FrameItemWithPhoto cfg={cfg} scale={scale} photoUrl={photoUrl} />
                : <FrameItemEmpty cfg={cfg} scale={scale} />;
        case 'crystal':
            return <CrystalCubeShape scale={scale} />;
        default:
            // Assorted chocolates / perfume / generic
            if (cfg.label === 'Perfume') return <PerfumeShape scale={scale} />;
            if (cfg.label === 'Chocolates') return <ChocolatesBoxShape scale={scale} />;
            return (
                <group position={[0, scale * 0.5, 0]}>
                    <mesh castShadow>
                        <sphereGeometry args={[scale, 20, 20]} />
                        <meshStandardMaterial color={cfg.color} metalness={0.4} roughness={0.3} emissive={cfg.color} emissiveIntensity={0.1} />
                    </mesh>
                </group>
            );
    }
};

const Item3D = ({ type, position, scale = 0.35, photoUrl }) => {
    const cfg = ITEM_CONFIG[type] || { color: '#8B4513', label: type, shape: 'default' };
    return (
        <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.1}>
            <group position={position}>
                <ItemShape cfg={cfg} scale={scale} photoUrl={photoUrl} />
                <Text position={[0, -(scale + 0.12), 0]} fontSize={scale * 0.28} color="rgba(255,255,255,0.75)" anchorX="center" anchorY="top" maxWidth={2}>{cfg.label}</Text>
            </group>
        </Float>
    );
};

/* ─── Interior of box: foam + items ─── */
const BoxInterior = ({ dim, foamColor, insideBoxDesigns }) => {
    const { w, h, d } = dim;
    const itemSize = Math.min(w, d) * 0.28;
    const floorY = -h * 0.5 + 0.05;

    const cols = insideBoxDesigns.length <= 2 ? insideBoxDesigns.length : Math.ceil(Math.sqrt(insideBoxDesigns.length));
    const rows = Math.ceil(insideBoxDesigns.length / cols);

    return (
        <group>
            <mesh position={[0, floorY + 0.02, 0]} receiveShadow>
                <boxGeometry args={[w * 0.92, 0.07, d * 0.92]} />
                <meshStandardMaterial color={foamColor} roughness={0.9} />
            </mesh>
            {insideBoxDesigns.map((design, idx) => {
                const col = idx % cols;
                const row = Math.floor(idx / cols);
                const cellW = (w * 0.84) / Math.max(cols, 1);
                const cellD = (d * 0.84) / Math.max(rows, 1);
                const x = (col - (cols - 1) / 2) * cellW;
                const z = (row - (rows - 1) / 2) * cellD;
                return (
                    <Item3D key={design.id} type={design.type} position={[x, floorY + 0.05, z]} scale={itemSize * 0.6} photoUrl={design.photoUrl} />
                );
            })}
        </group>
    );
};

/* ─── Procedural Box ─── */
const ProceduralRectBox = ({ dim, boxColor, mat, isOpen, faceDesigns, foamColor, ribbonSettings }) => {
    const lidRef = useRef();
    const { w, h, d } = dim;
    const lidH = h * 0.28;
    const bodyH = h * 0.72;
    const wallT = Math.min(w, d) * 0.055;

    const mp = useMemo(() => buildMat(boxColor, mat), [boxColor, mat]);

    useFrame(() => {
        if (!lidRef.current) return;
        const ty = isOpen ? bodyH + lidH + 0.6 : bodyH;
        const trx = isOpen ? -Math.PI * 0.45 : 0;
        const tz = isOpen ? -d * 0.45 : 0;
        lidRef.current.position.y = THREE.MathUtils.lerp(lidRef.current.position.y, ty, 0.08);
        lidRef.current.rotation.x = THREE.MathUtils.lerp(lidRef.current.rotation.x, trx, 0.08);
        lidRef.current.position.z = THREE.MathUtils.lerp(lidRef.current.position.z, tz, 0.08);
    });

    return (
        <group position={[0, -(bodyH + lidH) / 2, 0]}>
            {/* === BODY === */}
            <group position={[0, bodyH / 2, 0]}>
                <RoundedBox args={[w, wallT, d]} radius={0.02} position={[0, -bodyH / 2 + wallT / 2, 0]} castShadow receiveShadow>
                    <meshStandardMaterial {...mp} />
                </RoundedBox>
                <RoundedBox args={[w, bodyH, wallT]} radius={0.02} position={[0, 0, d / 2 - wallT / 2]} castShadow receiveShadow>
                    <meshStandardMaterial {...mp} />
                </RoundedBox>
                <RoundedBox args={[w, bodyH, wallT]} radius={0.02} position={[0, 0, -d / 2 + wallT / 2]} castShadow receiveShadow>
                    <meshStandardMaterial {...mp} />
                </RoundedBox>
                <RoundedBox args={[wallT, bodyH, d - wallT * 2]} radius={0.02} position={[-w / 2 + wallT / 2, 0, 0]} castShadow receiveShadow>
                    <meshStandardMaterial {...mp} />
                </RoundedBox>
                <RoundedBox args={[wallT, bodyH, d - wallT * 2]} radius={0.02} position={[w / 2 - wallT / 2, 0, 0]} castShadow receiveShadow>
                    <meshStandardMaterial {...mp} />
                </RoundedBox>
                <BoxInterior dim={{ w: w - wallT * 2, h: bodyH - wallT, d: d - wallT * 2 }} foamColor={foamColor} insideBoxDesigns={faceDesigns?.insideBox || []} />
                
                {/* Side/Wrap ribbons attached to body */}
                {ribbonSettings?.enabled && (
                   <group position={[0, -bodyH / 2, 0]}>
                       <RibbonSystem 
                           dim={{ w, h: isOpen ? bodyH : bodyH + lidH, d }} 
                           settings={{...ribbonSettings, showBow: false}} 
                           isOpen={isOpen} 
                           isLidPart={false}
                       />
                   </group>
                )}
            </group>

            {/* === LID === */}
            <group ref={lidRef} position={[0, bodyH, 0]}>
                <group position={[0, lidH / 2, 0]}>
                    <RoundedBox args={[w + wallT, lidH, d + wallT]} radius={0.02} castShadow receiveShadow>
                        <meshStandardMaterial {...mp} />
                    </RoundedBox>
                    {/* Ribbon linked specifically to lid top */}
                    <group position={[0, lidH / 2 + 0.01, 0]}>
                        <RibbonSystem 
                            dim={{ w: w + wallT, h: bodyH, d: d + wallT }} 
                            settings={ribbonSettings} 
                            isOpen={isOpen} 
                            isLidPart={true}
                        />
                    </group>
                </group>
            </group>
        </group>
    );
};

const GiftBoxScene = ({ boxColor, mat, isOpen, dim, faceDesigns, foamColor, ribbonSettings }) => {
    const groupRef = useRef();

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (groupRef.current) {
            groupRef.current.position.y = Math.sin(t * 1.5) * 0.05;
            groupRef.current.rotation.y = Math.sin(t * 0.2) * 0.05;
        }
    });

    return (
        <group ref={groupRef}>
            <ambientLight intensity={0.5} />
            <spotLight position={[5, 10, 5]} angle={0.25} penumbra={1} intensity={1.5} castShadow />
            <pointLight position={[-5, 5, -5]} intensity={0.8} color="#6C63FF" />
            
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -(dim.h * 1.2), 0]} receiveShadow>
                <planeGeometry args={[20, 20]} />
                <meshStandardMaterial color="#020617" transparent opacity={0.6} roughness={1} />
            </mesh>

            <Suspense fallback={null}>
                <ProceduralRectBox
                    dim={dim}
                    boxColor={boxColor}
                    mat={mat}
                    isOpen={isOpen}
                    faceDesigns={faceDesigns}
                    foamColor={foamColor}
                    ribbonSettings={ribbonSettings}
                />
            </Suspense>

            <OrbitControls
                enablePan={false}
                minPolarAngle={0.1}
                maxPolarAngle={Math.PI / 2 + 0.1}
                minDistance={dim.w * 2}
                maxDistance={dim.w * 10}
                makeDefault
                dampingFactor={0.1}
                enableDamping
                autoRotate
                autoRotateSpeed={0.5}
            />
        </group>
    );
};

const GiftBox3DPreview = ({
    boxDimensions, boxColor = '#1a1a2e', material = 'matte',
    faceDesigns = {}, foamColor: externalFoamColor, ribbonSettings
}) => {
    const [canvasKey, setCanvasKey] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const foamColor = externalFoamColor || '#f0dde8';
    const dim = useMemo(() => scaleDim(boxDimensions), [boxDimensions]);

    const triggerContextRecovery = useCallback(() => {
        console.warn('GiftBox3D: WebGL Context Lost — recovering...');
        setCanvasKey(prev => prev + 1);
    }, []);

    const glConfig = useMemo(() => ({
        powerPreference: 'high-performance',
        antialias: true,
        stencil: false,
        depth: true,
        alpha: true,
        failIfMajorPerformanceCaveat: false
    }), []);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', background: 'transparent' }}>
            <Canvas 
                key={canvasKey}
                shadows={{ type: THREE.PCFShadowMap }} 
                camera={{ position: [0, dim.h * 3, dim.w * 5], fov: 35 }}
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
                <GiftBoxScene
                    boxColor={boxColor}
                    mat={material}
                    isOpen={isOpen}
                    dim={dim}
                    faceDesigns={faceDesigns}
                    foamColor={foamColor}
                    ribbonSettings={ribbonSettings}
                />
            </Canvas>

            <div style={{ position: 'absolute', bottom: 25, left: '50%', transform: 'translateX(-50%)', zIndex: 100 }}>
                <button
                    onClick={() => setIsOpen(o => !o)}
                    style={{
                        background: isOpen ? '#ff4757' : '#FFD93D',
                        color: isOpen ? '#fff' : '#1a1a2e',
                        padding: '12px 36px', borderRadius: '30px', border: 'none',
                        fontWeight: '800', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                        transition: '0.3s'
                    }}
                >
                    {isOpen ? 'CLOSE BOX' : 'OPEN BOX'}
                </button>
            </div>
        </div>
    );
};

GiftBox3DPreview.propTypes = {
    boxDimensions: PropTypes.object,
    boxColor: PropTypes.string,
    material: PropTypes.string,
    faceDesigns: PropTypes.object,
    foamColor: PropTypes.string,
    ribbonSettings: PropTypes.object
};

export default GiftBox3DPreview;

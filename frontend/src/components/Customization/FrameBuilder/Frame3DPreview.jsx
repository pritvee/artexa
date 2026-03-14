import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

/* ─── Error Boundary ─── */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    height: '100%', color: '#aaa', flexDirection: 'column', gap: 8
                }}>
                    <span style={{ fontSize: 48 }}>🖼️</span>
                    <span>3D Preview unavailable</span>
                </div>
            );
        }
        return this.props.children;
    }
}

/* ─── Procedural Photo Frame ─── */
const PhotoFrame = ({ frameColor, frameStyle, textureCanvas, frameSize, glassReflection, orientation, frameThicknessMultiplier = 1 }) => {
    const meshRef = useRef();

    // Map size labels to 3D dimensions (roughly in meters/units)
    const dims = useMemo(() => {
        const SCALE_TO_METERS = 0.5; // Increased scale for better visibility
        const base = {
            w: (frameSize?.width || 12) * SCALE_TO_METERS,
            h: (frameSize?.height || 8) * SCALE_TO_METERS
        };

        const isSquare = base.w === base.h;
        const naturallyPortrait = base.h > base.w;
        const wantPortrait = orientation === 'portrait';

        if (isSquare) return base;

        if (naturallyPortrait !== wantPortrait) {
            return { w: base.h, h: base.w }; // Swap for requested orientation
        }
        return base;
    }, [frameSize, orientation]);

    const { w, h } = dims;

    const styleStr = frameStyle?.toLowerCase() || 'wooden';

    // Get material color & properties based on style/color
    const materialProps = useMemo(() => {
        // Now frameColor directly receives a hex code like '#ff0000'
        const col = frameColor || '#111111';

        if (styleStr === 'metal frame' || styleStr === 'metal') {
            return { color: col, metalness: 0.8, roughness: 0.2 };
        } else if (styleStr === 'acrylic frame' || styleStr === 'acrylic') {
            return { color: col, metalness: 0.1, roughness: 0.05, opacity: 0.9, transparent: true };
        } else if (styleStr === 'canvas' || styleStr === 'canvas frame') {
            return { color: '#ffffff', metalness: 0, roughness: 0.9 }; // Canvas usually doesn't have a frame
        }
        return { color: col, metalness: 0.1, roughness: 0.7 }; // Default wooden/matte
    }, [frameColor, styleStr]);

    // Build dynamic texture from the design canvas
    const texture = useMemo(() => {
        if (!textureCanvas) return null;
        const tex = new THREE.CanvasTexture(textureCanvas);
        tex.needsUpdate = true;
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        return tex;
    }, [textureCanvas]);

    useFrame(() => {
        if (texture && textureCanvas) {
            texture.needsUpdate = true;
        }
    });

    const isFloating = frameStyle?.toLowerCase() === 'floating frame' || frameStyle?.toLowerCase() === 'floating';
    const isCanvas = frameStyle === 'Canvas frame';
    const computedFrameThickness = 0.15 * frameThicknessMultiplier;
    const frameDepth = 0.2;

    return (
        <group rotation={[0, -Math.PI / 10, 0]}>
            {/* 1. The Real Frame (with hole) */}
            {!isCanvas ? (
                <group>
                    {/* Top */}
                    <mesh position={[0, h / 2 + computedFrameThickness / 2, 0]} castShadow receiveShadow>
                        <boxGeometry args={[w + computedFrameThickness * 2, computedFrameThickness, frameDepth]} />
                        <meshStandardMaterial {...materialProps} />
                    </mesh>
                    {/* Bottom */}
                    <mesh position={[0, -(h / 2 + computedFrameThickness / 2), 0]} castShadow receiveShadow>
                        <boxGeometry args={[w + computedFrameThickness * 2, computedFrameThickness, frameDepth]} />
                        <meshStandardMaterial {...materialProps} />
                    </mesh>
                    {/* Left */}
                    <mesh position={[-(w / 2 + computedFrameThickness / 2), 0, 0]} castShadow receiveShadow>
                        <boxGeometry args={[computedFrameThickness, h, frameDepth]} />
                        <meshStandardMaterial {...materialProps} />
                    </mesh>
                    {/* Right */}
                    <mesh position={[(w / 2 + computedFrameThickness / 2), 0, 0]} castShadow receiveShadow>
                        <boxGeometry args={[computedFrameThickness, h, frameDepth]} />
                        <meshStandardMaterial {...materialProps} />
                    </mesh>
                </group>
            ) : (
                /* Canvas Wrap look - photo wraps around edges */
                <mesh castShadow receiveShadow>
                    <boxGeometry args={[w, h, 0.1]} />
                    {texture ? (
                        <meshStandardMaterial map={texture} roughness={0.9} />
                    ) : (
                        <meshStandardMaterial color="#fff" />
                    )}
                </mesh>
            )}

            {/* 2. The Photo Area (recessed slightly) */}
            {!isCanvas && (
                <group>
                    <mesh position={[0, 0, 0.01]} castShadow>
                        <planeGeometry args={[w, h]} />
                        {texture ? (
                            <meshStandardMaterial map={texture} roughness={0.3} metalness={0.0} />
                        ) : (
                            <meshStandardMaterial color="#eee" roughness={0.5} />
                        )}
                    </mesh>
                    {/* Backing plate inside the frame */}
                    <mesh position={[0, 0, -0.05]}>
                        <planeGeometry args={[w, h]} />
                        <meshStandardMaterial color="#111" />
                    </mesh>
                </group>
            )}

            {/* 4. Glass Overlay (only for some styles) */}
            {(styleStr === 'wooden frame' || styleStr === 'wooden' || styleStr === 'acrylic frame' || styleStr === 'acrylic') && (
                <mesh position={[0, 0, frameDepth / 2 + 0.02]}>
                    <planeGeometry args={[w, h]} />
                    <meshPhysicalMaterial
                        transparent
                        opacity={glassReflection ? 0.3 : 0.05}
                        roughness={glassReflection ? 0 : 0.8}
                        transmission={0.9}
                        thickness={0.05}
                        ior={1.4}
                    />
                </mesh>
            )}
        </group>
    );
};

const Frame3DPreview = ({
    frameColor = 'Black',
    frameStyle = 'Wooden frame',
    frameSize = '12x8 – A4',
    textureCanvas,
    wallPreview = 'none',
    glassReflection = true,
    tiltAngle = 0,
    orientation = 'landscape',
    frameThickness = 1,
    autoRotate = true
}) => {
    const wallColor = useMemo(() => {
        if (wallPreview === 'living room') return '#dcdcdc';
        if (wallPreview === 'bedroom') return '#ead8c0';
        if (wallPreview === 'office') return '#b0c4de';
        return '#050510';
    }, [wallPreview]);

    return (
        <ErrorBoundary>
            <Canvas
                id="three-canvas"
                shadows
                style={{ width: '100%', height: '100%' }}
                gl={{ preserveDrawingBuffer: true, antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
                onCreated={({ gl }) => {
                    gl.setClearColor(wallColor, 1);
                }}
            >
                <PerspectiveCamera makeDefault position={[0, tiltAngle * 0.1, 4.5]} fov={50} />

                {/* Lighting */}
                <ambientLight intensity={wallPreview !== 'none' ? 0.6 : 0.4} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />
                <Environment preset="city" />

                {/* Photo Frame */}
                <Suspense fallback={null}>
                    {(() => {
                        // Parse size string like "12x8 – A4" into {width: 12, height: 8}
                        let width = 12, height = 8;
                        if (frameSize && typeof frameSize === 'object') {
                            width = parseFloat(frameSize.width) || width;
                            height = parseFloat(frameSize.height) || height;

                            // Fallback to value parsing if width/height are 0
                            if ((!width || !height) && frameSize.value) {
                                const parts = String(frameSize.value).split('x');
                                width = parseFloat(parts[0]) || 12;
                                if (parts[1]) height = parseFloat(parts[1].split(/[–-]/)[0]) || 8;
                            }
                        } else if (typeof frameSize === 'string') {
                            const parts = frameSize.split('x');
                            width = parseFloat(parts[0]) || 12;
                            if (parts[1]) height = parseFloat(parts[1].split(/[–-]/)[0]) || 8;
                        }

                        return (
                            <PhotoFrame
                                frameColor={frameColor}
                                frameStyle={frameStyle}
                                frameSize={{ width, height }}
                                textureCanvas={textureCanvas}
                                glassReflection={glassReflection}
                                orientation={orientation}
                                frameThicknessMultiplier={frameThickness}
                            />
                        );
                    })()}

                    {/* Background Wall if enabled */}
                    {wallPreview !== 'none' && (
                        <mesh position={[0, 0, -1]} receiveShadow>
                            <planeGeometry args={[20, 15]} />
                            <meshStandardMaterial color={wallColor} roughness={0.9} />
                        </mesh>
                    )}

                    <ContactShadows
                        position={[0, -3.5, 0]}
                        opacity={0.4}
                        scale={10}
                        blur={2.5}
                        far={4}
                    />
                </Suspense>

                {/* Controls */}
                <OrbitControls
                    enablePan={false}
                    minDistance={3}
                    maxDistance={12}
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 1.5}
                    autoRotate={autoRotate}
                    autoRotateSpeed={0.5}
                />
            </Canvas>
        </ErrorBoundary>
    );
};

export default Frame3DPreview;

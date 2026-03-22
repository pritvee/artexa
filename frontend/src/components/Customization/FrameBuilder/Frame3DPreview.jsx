import React, { useRef, useMemo, Suspense, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import PropTypes from 'prop-types';

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

ErrorBoundary.propTypes = {
    children: PropTypes.node
};

/* ─── Procedural Photo Frame ─── */
const PhotoFrame = React.memo(({ frameColor, frameStyle, textureCanvas, frameSize, glassReflection, orientation, frameThicknessMultiplier = 1 }) => {
    const groupRef = useRef();

    // Map size labels to 3D dimensions (roughly in meters/units)
    const dims = useMemo(() => {
        const SCALE_TO_METERS = 0.5; // Increased scale for better visibility
        const base = {
            w: (Number.parseFloat(frameSize?.width) || 12) * SCALE_TO_METERS,
            h: (Number.parseFloat(frameSize?.height) || 8) * SCALE_TO_METERS
        };

        const isSquare = Math.abs(base.w - base.h) < 0.01;
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
        const col = frameColor || '#111111';

        if (styleStr.includes('metal')) {
            return { color: col, metalness: 0.8, roughness: 0.2 };
        } else if (styleStr.includes('acrylic')) {
            return { color: col, metalness: 0.1, roughness: 0.05, opacity: 0.9, transparent: true };
        } else if (styleStr.includes('canvas')) {
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
        tex.anisotropy = 4; // Optimize angle viewing quality
        return tex;
    }, [textureCanvas]);

    // Floating Animation
    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (groupRef.current) {
            groupRef.current.position.y = Math.sin(t * 1.2) * 0.08;
            groupRef.current.rotation.x = Math.sin(t * 0.4) * 0.03;
            groupRef.current.rotation.z = Math.cos(t * 0.5) * 0.02;
        }
    });

    React.useEffect(() => {
        return () => {
             if (texture) texture.dispose();
        };
    }, [texture]);

    const isCanvas = styleStr.includes('canvas');
    const computedFrameThickness = 0.15 * frameThicknessMultiplier;
    const frameDepth = 0.2;

    return (
        <group ref={groupRef} rotation={[0, -Math.PI / 10, 0]}>
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
            {(styleStr.includes('wooden') || styleStr.includes('acrylic')) && (
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
}); // Close React.memo
PhotoFrame.displayName = 'PhotoFrame';

PhotoFrame.propTypes = {
    frameColor: PropTypes.string,
    frameStyle: PropTypes.string,
    textureCanvas: PropTypes.object,
    frameSize: PropTypes.object,
    glassReflection: PropTypes.bool,
    orientation: PropTypes.string,
    frameThicknessMultiplier: PropTypes.number
};

const Frame3DPreview = React.memo(({
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
    // WebGL Context Recovery
    const [canvasKey, setCanvasKey] = useState(0);
    const triggerContextRecovery = useCallback(() => {
        console.warn('Frame3D: WebGL Context Lost — recovering...');
        setCanvasKey(k => k + 1);
    }, []);

    const wallColor = useMemo(() => {
        if (wallPreview === 'living room') return '#dcdcdc';
        if (wallPreview === 'bedroom') return '#ead8c0';
        if (wallPreview === 'office') return '#b0c4de';
        return '#020617';
    }, [wallPreview]);

    const glConfig = useMemo(() => ({
        preserveDrawingBuffer: true,
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        powerPreference: 'high-performance'
    }), []);

    // Memoize frame size parsing so it's not repeatedly calculated every render
    const parsedFrameSize = useMemo(() => {
        let width = 12, height = 8;
        if (frameSize && typeof frameSize === 'object') {
            width = Number.parseFloat(frameSize.width) || width;
            height = Number.parseFloat(frameSize.height) || height;

            if ((!width || !height) && frameSize.value) {
                const parts = String(frameSize.value).split('x');
                width = Number.parseFloat(parts[0]) || 12;
                if (parts[1]) height = Number.parseFloat(parts[1].split(/[–-]/)[0]) || 8;
            }
        } else if (typeof frameSize === 'string') {
            const parts = frameSize.split('x');
            width = Number.parseFloat(parts[0]) || 12;
            if (parts[1]) height = Number.parseFloat(parts[1].split(/[–-]/)[0]) || 8;
        }
        return { width, height };
    }, [frameSize]);

    // Handle gl initialization and cleanup outside of JSX to prevent inline anonymous fn allocations
    const handleCanvasCreated = useCallback(({ gl, scene }) => {
        gl.setClearColor(wallColor, 0); // Transparent background for cleaner blend

        const onContextLost = (e) => {
            e.preventDefault();
            triggerContextRecovery();
        };

        const onContextRestored = () => {
            console.log('Frame3D: WebGL Context Restored');
            setCanvasKey(k => k + 1);
        };

        const canvas = gl.domElement;
        canvas.addEventListener('webglcontextlost', onContextLost, false);
        canvas.addEventListener('webglcontextrestored', onContextRestored, false);

        return () => {
            canvas.removeEventListener('webglcontextlost', onContextLost);
            canvas.removeEventListener('webglcontextrestored', onContextRestored);
            if (gl.forceContextLoss) gl.forceContextLoss();
            if (gl.dispose) gl.dispose();
            scene.clear();
        };
    }, [triggerContextRecovery, wallColor]);

    const [isRotating, setIsRotating] = useState(autoRotate ?? true);

    console.log("CANVAS:", textureCanvas);

    return (
        <ErrorBoundary>
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <Canvas
                    key={canvasKey + (textureCanvas ? '-' + Date.now() : '')}
                    id="three-canvas"
                    shadows
                    dpr={[1, 2]}
                    style={{ width: '100%', height: '100%' }}
                    gl={glConfig}
                    onCreated={handleCanvasCreated}
                >
                    <PerspectiveCamera makeDefault position={[0, tiltAngle * 0.1, 4.5]} fov={50} />

                    {/* Lighting */}
                    <ambientLight intensity={0.5} />
                    <spotLight position={[5, 10, 5]} angle={0.2} penumbra={1} intensity={1.5} castShadow />
                    <pointLight position={[-10, 10, -5]} intensity={0.5} color="#6C63FF" />
                    <Environment preset="city" />

                    {/* Photo Frame */}
                    <Suspense fallback={null}>
                        <PhotoFrame
                            frameColor={frameColor}
                            frameStyle={frameStyle}
                            frameSize={parsedFrameSize}
                            textureCanvas={textureCanvas}
                            glassReflection={glassReflection}
                            orientation={orientation}
                            frameThicknessMultiplier={frameThickness}
                        />

                        {/* Floor Glow / Soft shadow Area */}
                        <mesh position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                            <planeGeometry args={[10, 10]} />
                            <meshStandardMaterial 
                                transparent 
                                opacity={0.15} 
                                color="#6C63FF" 
                                roughness={1} 
                            />
                        </mesh>

                        <ContactShadows
                            position={[0, -2.8, 0]}
                            opacity={0.6}
                            scale={8}
                            blur={2.4}
                            far={4}
                        />

                        {/* Background Wall if enabled */}
                        <mesh position={[0, 0, -2]}>
                            <planeGeometry args={[20, 20]} />
                            <meshStandardMaterial color={wallColor} roughness={1} metalness={0} />
                        </mesh>
                    </Suspense>

                    {/* Controls */}
                    <OrbitControls
                        enablePan={false}
                        minDistance={3}
                        maxDistance={10}
                        minPolarAngle={Math.PI / 4}
                        maxPolarAngle={Math.PI / 1.5}
                        autoRotate={isRotating}
                        autoRotateSpeed={1.0}
                    />
                </Canvas>
                <div style={{ position: 'absolute', bottom: 16, right: 16, zIndex: 10 }}>
                    <button
                        onClick={() => setIsRotating(!isRotating)}
                        style={{
                            background: isRotating ? 'rgba(33, 150, 243, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                            border: `1px solid ${isRotating ? 'rgba(33, 150, 243, 0.5)' : 'rgba(255, 255, 255, 0.2)'}`,
                            color: isRotating ? '#2196f3' : '#ffffff',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            backdropFilter: 'blur(10px)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '13px',
                            fontWeight: 600,
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                        }}
                    >
                        <span>{isRotating ? '⏸' : '▶'}</span>
                        {isRotating ? 'Stop' : 'Rotate'}
                    </button>
                </div>
            </div>
        </ErrorBoundary>
    );
});
Frame3DPreview.displayName = 'Frame3DPreview';

Frame3DPreview.propTypes = {
    frameColor: PropTypes.string,
    frameStyle: PropTypes.string,
    frameSize: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    textureCanvas: PropTypes.object,
    wallPreview: PropTypes.string,
    glassReflection: PropTypes.bool,
    tiltAngle: PropTypes.number,
    orientation: PropTypes.string,
    frameThickness: PropTypes.number,
    autoRotate: PropTypes.bool
};

export default Frame3DPreview;

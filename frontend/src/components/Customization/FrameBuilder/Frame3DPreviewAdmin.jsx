import React, { useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import PropTypes from 'prop-types';

/* ─── Error Boundary ─── */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() { return { hasError: true }; }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#aaa', flexDirection: 'column', gap: 8 }}>
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

/* ─── Frame Mesh — loads texture from URL ─── */
const FrameMeshFromUrl = ({ textureUrl, frameColor = '#111111', frameStyle = 'wooden', frameSize = { width: 12, height: 8 }, orientation = 'landscape', glassReflection = true }) => {
    // Standardize inputs to prevent NaN crashes
    const safeW = Number.parseFloat(frameSize?.width) || 12;
    const safeH = Number.parseFloat(frameSize?.height) || 8;

    const texture = useTexture(textureUrl || '/placeholder.png');

    // Configure texture
    if (texture) {
        texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.minFilter = THREE.LinearFilter;
    }

    const dims = useMemo(() => {
        const SCALE = 0.25;
        const base = { w: safeW * SCALE, h: safeH * SCALE };
        const naturallyPortrait = base.h > base.w;
        const wantPortrait = orientation === 'portrait';
        return naturallyPortrait !== wantPortrait ? { w: base.h, h: base.w } : base;
    }, [safeW, safeH, orientation]);

    const { w, h } = dims;
    const styleStr = frameStyle?.toLowerCase() || 'wooden';

    const materialProps = useMemo(() => {
        const col = frameColor || '#111111';
        if (styleStr.includes('metal')) return { color: col, metalness: 0.85, roughness: 0.15 };
        if (styleStr.includes('acrylic')) return { color: col, metalness: 0.1, roughness: 0.05, opacity: 0.9, transparent: true };
        if (styleStr.includes('canvas')) return { color: '#ffffff', metalness: 0, roughness: 0.9 };
        return { color: col, metalness: 0.08, roughness: 0.7 }; // wooden default
    }, [frameColor, styleStr]);

    const isCanvas = styleStr.includes('canvas');
    const fw = 0.15; // frame width
    const fd = 0.2;  // frame depth

    return (
        <group rotation={[0, -Math.PI / 10, 0]}>
            {!isCanvas ? (
                <group>
                    {/* Top */}
                    <mesh position={[0, h / 2 + fw / 2, 0]} castShadow receiveShadow>
                        <boxGeometry args={[w + fw * 2, fw, fd]} />
                        <meshStandardMaterial {...materialProps} />
                    </mesh>
                    {/* Bottom */}
                    <mesh position={[0, -(h / 2 + fw / 2), 0]} castShadow receiveShadow>
                        <boxGeometry args={[w + fw * 2, fw, fd]} />
                        <meshStandardMaterial {...materialProps} />
                    </mesh>
                    {/* Left */}
                    <mesh position={[-(w / 2 + fw / 2), 0, 0]} castShadow receiveShadow>
                        <boxGeometry args={[fw, h, fd]} />
                        <meshStandardMaterial {...materialProps} />
                    </mesh>
                    {/* Right */}
                    <mesh position={[(w / 2 + fw / 2), 0, 0]} castShadow receiveShadow>
                        <boxGeometry args={[fw, h, fd]} />
                        <meshStandardMaterial {...materialProps} />
                    </mesh>

                    {/* Recessed photo */}
                    <mesh position={[0, 0, 0.01]} castShadow>
                        <planeGeometry args={[w, h]} />
                        <meshStandardMaterial map={texture} roughness={0.3} metalness={0} />
                    </mesh>

                    {/* Glass Reflection */}
                    {glassReflection && (
                        <mesh position={[0, 0, 0.03]}>
                            <planeGeometry args={[w, h]} />
                            <meshPhysicalMaterial transparent opacity={0.15} roughness={0} transmission={0.9} thickness={0.05} ior={1.4} />
                        </mesh>
                    )}
                </group>
            ) : (
                <mesh castShadow receiveShadow>
                    <boxGeometry args={[w, h, 0.1]} />
                    <meshStandardMaterial map={texture} roughness={0.8} />
                </mesh>
            )}

            {/* Backing */}
            {!isCanvas && (
                <mesh position={[0, 0, -0.05]}>
                    <planeGeometry args={[w, h]} />
                    <meshStandardMaterial color="#111" />
                </mesh>
            )}
        </group>
    );
};

FrameMeshFromUrl.propTypes = {
    textureUrl: PropTypes.string,
    frameColor: PropTypes.string,
    frameStyle: PropTypes.string,
    frameSize: PropTypes.object,
    orientation: PropTypes.string,
    glassReflection: PropTypes.bool
};

/* ─── Fallback when no textureUrl ─── */
const FrameMeshPlaceholder = ({ frameColor = '#111111', frameStyle = 'wooden', frameSize = { width: 12, height: 8 }, orientation = 'landscape' }) => {
    const dims = useMemo(() => {
        const SCALE = 0.25;
        const base = { w: (Number.parseFloat(frameSize?.width) || 12) * SCALE, h: (Number.parseFloat(frameSize?.height) || 8) * SCALE };
        const isSquare = Math.abs(base.w - base.h) < 0.01;
        if (isSquare) return base;
        const naturallyPortrait = base.h > base.w;
        const wantPortrait = orientation === 'portrait';
        return naturallyPortrait !== wantPortrait ? { w: base.h, h: base.w } : base;
    }, [frameSize, orientation]);

    const { w, h } = dims;
    const s = frameStyle?.toLowerCase() || 'wooden';
    const col = frameColor || '#111111';
    const matProps = s.includes('metal') ? { color: col, metalness: 0.85, roughness: 0.15 } : { color: col, metalness: 0.08, roughness: 0.72 };
    const frameDepth = 0.2;
    const frameThickness = 0.15;

    return (
        <group rotation={[0, -Math.PI / 10, 0]}>
            <mesh castShadow receiveShadow>
                <boxGeometry args={[w + frameThickness * 2, h + frameThickness * 2, frameDepth]} />
                <meshStandardMaterial {...matProps} />
            </mesh>
            <mesh position={[0, 0, frameDepth / 2 + 0.01]} castShadow>
                <planeGeometry args={[w, h]} />
                <meshStandardMaterial color="#2a2a3a" roughness={0.9} />
            </mesh>
        </group>
    );
};

FrameMeshPlaceholder.propTypes = {
    frameColor: PropTypes.string,
    frameStyle: PropTypes.string,
    frameSize: PropTypes.object,
    orientation: PropTypes.string
};

/* ─── Main Export ─── */
const Frame3DPreviewAdmin = ({
    textureUrl,
    frameColor = '#111111',
    frameStyle = 'wooden',
    frameSize = { width: 12, height: 8 },
    orientation = 'landscape',
    glassReflection = true,
    wallPreview = 'none',
}) => {
    const [canvasKey, setCanvasKey] = React.useState(0);
    const wallColor = useMemo(() => {
        if (wallPreview === 'living room') return '#dcdcdc';
        if (wallPreview === 'bedroom') return '#ead8c0';
        if (wallPreview === 'office') return '#b0c4de';
        return '#080818';
    }, [wallPreview]);

    const glConfig = useMemo(() => ({
        preserveDrawingBuffer: true,
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true,
        failIfMajorPerformanceCaveat: false
    }), []);

    return (
        <ErrorBoundary>
            <Canvas
                key={canvasKey}
                shadows
                style={{ width: '100%', height: '100%' }}
                dpr={[1, 2]}
                gl={glConfig}
                onCreated={({ gl, scene }) => {
                    gl.setClearColor(wallColor, 1);
                    
                    const handleContextLost = (event) => {
                        event.preventDefault();
                        console.warn('Frame3DAdmin: WebGL Context Lost — recovering...');
                        setCanvasKey(prev => prev + 1);
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
                <PerspectiveCamera makeDefault position={[0, 0, 7]} fov={40} />

                {/* Enhanced Lighting */}
                <ambientLight intensity={0.7} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.2} castShadow />
                <pointLight position={[-10, 5, -10]} intensity={0.5} color="#ffffff" />
                <pointLight position={[5, -5, 5]} intensity={0.4} />
                <Environment preset="city" />


                <Suspense fallback={
                    <FrameMeshPlaceholder
                        frameColor={frameColor}
                        frameStyle={frameStyle}
                        frameSize={frameSize}
                        orientation={orientation}
                    />
                }>
                    {(() => {
                        // Parse size string or object safely
                        let width = 12, height = 8;
                        if (typeof frameSize === 'string') {
                            const parts = frameSize.split('x');
                            width = Number.parseFloat(parts[0]) || 12;
                            if (parts[1]) height = Number.parseFloat(parts[1].split(/[–-]/)[0]) || 8;
                        } else if (frameSize && typeof frameSize === 'object') {
                            width = Number.parseFloat(frameSize.width) || 12;
                            height = Number.parseFloat(frameSize.height) || 8;
                        }

                        if (!textureUrl) {
                            return (
                                <FrameMeshPlaceholder
                                    frameColor={frameColor}
                                    frameStyle={frameStyle}
                                    frameSize={{ width, height }}
                                    orientation={orientation}
                                />
                            );
                        }

                        return (
                            <FrameMeshFromUrl
                                textureUrl={textureUrl}
                                frameColor={frameColor}
                                frameStyle={frameStyle}
                                frameSize={{ width, height }}
                                orientation={orientation}
                                glassReflection={glassReflection}
                            />
                        );
                    })()}
                    {wallPreview !== 'none' && (
                        <mesh position={[0, 0, -1]} receiveShadow>
                            <planeGeometry args={[20, 15]} />
                            <meshStandardMaterial color={wallColor} roughness={0.9} />
                        </mesh>
                    )}
                    <ContactShadows position={[0, -3.5, 0]} opacity={0.35} scale={10} blur={2.5} far={4} />
                </Suspense>

                <OrbitControls
                    enablePan={false}
                    minDistance={3}
                    maxDistance={14}
                    minPolarAngle={Math.PI / 5}
                    maxPolarAngle={Math.PI / 1.6}
                    autoRotate
                    autoRotateSpeed={0.6}
                />
            </Canvas>
        </ErrorBoundary>
    );
};

Frame3DPreviewAdmin.propTypes = {
    textureUrl: PropTypes.string,
    frameColor: PropTypes.string,
    frameStyle: PropTypes.string,
    frameSize: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    orientation: PropTypes.string,
    glassReflection: PropTypes.bool,
    wallPreview: PropTypes.string
};

export default Frame3DPreviewAdmin;

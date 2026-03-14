import React, { useRef, useMemo, Suspense, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTexture, Environment, OrbitControls } from '@react-three/drei';


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
                    <span style={{ fontSize: 48 }}>☕</span>
                    <span>3D Preview unavailable</span>
                </div>
            );
        }
        return this.props.children;
    }
}

/* ─── Procedural Mug Geometry ─── */
const MugBody = ({ mugColor, insideColor, textureCanvas, textureUrl, mugType }) => {
    const meshRef = useRef();

    // Build a mug via LatheGeometry (revolves a profile curve)
    const { outerGeo, innerGeo, handleGeo, rimGeo, height } = useMemo(() => {
        // Height based on mug type
        const h = mugType === 'Large Mug (15oz)' ? 2.4 : mugType === 'Travel Mug' ? 3.0 : 2.0;
        const radius = mugType === 'Travel Mug' ? 0.7 : 0.85;
        const bottomR = mugType === 'Travel Mug' ? 0.6 : 0.82;

        // Outer profile
        const outerPoints = [
            new THREE.Vector2(0.0, 0),
            new THREE.Vector2(bottomR, 0),
            new THREE.Vector2(radius, 0.1),
            new THREE.Vector2(radius, h),
            new THREE.Vector2(radius + 0.05, h),
        ];
        const outer = new THREE.LatheGeometry(outerPoints, 64);

        // Fix UV mapping
        const outerUv = outer.attributes.uv;
        const outerPos = outer.attributes.position;
        const uScale = 2.67 / 2.22;
        for (let i = 0; i < outerUv.count; i++) {
            const y = outerPos.getY(i);
            const originalU = outerUv.getX(i);
            const newU = (originalU - 0.5) * uScale + 0.5;
            outerUv.setXY(i, newU, y / h);
        }

        // Inner profile
        const wall = 0.07;
        const innerPoints = [
            new THREE.Vector2(0.0, wall),
            new THREE.Vector2(radius - wall, wall),
            new THREE.Vector2(radius - wall, h + 0.01),
            new THREE.Vector2(radius + 0.05, h + 0.01),
        ];
        const inner = new THREE.LatheGeometry(innerPoints, 64);

        const handle = new THREE.TorusGeometry(0.45, 0.08, 16, 32, Math.PI);

        const rimPoints = [
            new THREE.Vector2(radius - wall, h),
            new THREE.Vector2(radius + 0.05, h),
            new THREE.Vector2(radius + 0.05, h + 0.04),
            new THREE.Vector2(radius - wall, h + 0.04),
        ];
        const rim = new THREE.LatheGeometry(rimPoints, 64);

        return { outerGeo: outer, innerGeo: inner, handleGeo: handle, rimGeo: rim, height: h };
    }, [mugType]);

    // Correctly call hook at top level, with fallback to transparent 1x1 base64 png
    const loadedTexture = useTexture(textureUrl || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');
    
    const texture = useMemo(() => {
        if (textureUrl) return loadedTexture;
        if (textureCanvas) {
            const tex = new THREE.CanvasTexture(textureCanvas);
            tex.needsUpdate = true;
            tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
            return tex;
        }
        return null;
    }, [textureUrl, loadedTexture, textureCanvas]);



    // Update texture each frame
    useFrame(() => {
        if (texture && textureCanvas) {
            texture.needsUpdate = true;
        }
    });

    const outerColor = mugColor.toLowerCase().includes('black') ? '#222222' : '#f5f5f0';

    const innerCol = insideColor
        || (mugColor.toLowerCase().includes('red') ? '#cc3333'
            : mugColor.toLowerCase().includes('blue') ? '#3366cc' : outerColor);

    return (
        <group position={[0, -height / 2, 0]}>
            {/* Outer body base */}
            <mesh ref={meshRef} geometry={outerGeo} castShadow receiveShadow>
                <meshStandardMaterial
                    color={outerColor}
                    roughness={0.3}
                    metalness={0.05}
                />
            </mesh>

            {/* Transparent Decal Overlay */}
            {texture && (
                <mesh geometry={outerGeo}>
                    <meshStandardMaterial
                        map={texture}
                        transparent={true}
                        polygonOffset={true}
                        polygonOffsetFactor={-1}
                        color="#ffffff"
                        roughness={0.3}
                        metalness={0.05}
                    />
                </mesh>
            )}

            {/* Inner surface */}
            <mesh geometry={innerGeo}>
                <meshStandardMaterial
                    color={innerCol}
                    roughness={0.4}
                    metalness={0.0}
                    side={THREE.BackSide}
                />
            </mesh>

            {/* Rim */}
            <mesh geometry={rimGeo}>
                <meshStandardMaterial color={outerColor} roughness={0.2} metalness={0.1} />
            </mesh>

            {/* Handle */}
            <mesh
                geometry={handleGeo}
                position={[0.85, height * 0.55, 0]}
                rotation={[0, 0, -Math.PI / 2]}
                castShadow
            >
                <meshStandardMaterial color={outerColor} roughness={0.3} metalness={0.05} />
            </mesh>

        </group>
    );
};

/* ─── Floor / Ground Plane ─── */
const Floor = () => (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <shadowMaterial opacity={0.15} />
    </mesh>
);

/* ─── Main Exported Component ─── */
const Mug3DPreview = ({ mugColor = 'White', insideColor, textureCanvas, textureUrl, mugType = 'Classic Mug (11oz)', autoRotate = true }) => {
    // canvasKey is bumped when WebGL context is lost, forcing a full remount which recovers the renderer
    const [canvasKey, setCanvasKey] = useState(0);
    const handleContextLost = useCallback(() => {
        console.warn('Mug3D: WebGL Context Lost — recovering...');
        setTimeout(() => setCanvasKey(k => k + 1), 300);
    }, []);

    return (
        <ErrorBoundary>
            <Canvas
                key={canvasKey}
                id="three-canvas"
                shadows
                camera={{ position: [2.5, 2, 2.5], fov: 40 }}
                style={{ width: '100%', height: '100%', minHeight: '500px', borderRadius: '12px' }}
                gl={{
                    preserveDrawingBuffer: true,
                    antialias: true,
                    toneMapping: THREE.ACESFilmicToneMapping,
                    powerPreference: 'default'
                }}
                onCreated={({ gl }) => {
                    gl.setClearColor('#0a0a1a', 1);
                    // Listen for context loss and auto-recover
                    gl.domElement.addEventListener('webglcontextlost', (e) => {
                        e.preventDefault();
                        handleContextLost();
                    });
                }}
            >
                {/* Enhanced Lighting for better visibility of dark mugs */}
                <ambientLight intensity={0.7} />
                <directionalLight
                    position={[10, 10, 10]}
                    intensity={1.2}
                    castShadow
                    shadow-mapSize-width={1024}
                    shadow-mapSize-height={1024}
                />
                <directionalLight position={[-10, 10, -10]} intensity={0.6} />
                <pointLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
                <pointLight position={[-5, 2, 5]} intensity={0.5} color="#e8e0ff" />
                <hemisphereLight skyColor="#ffffff" groundColor="#222222" intensity={0.6} />
                <Environment preset="city" />


                {/* Mug */}
                <MugBody
                    mugColor={mugColor}
                    insideColor={insideColor}
                    textureCanvas={textureCanvas}
                    textureUrl={textureUrl}
                    mugType={mugType}
                />

                {/* Floor shadow */}
                <Floor />

                {/* Controls */}
                <OrbitControls
                    enablePan={false}
                    minDistance={2.5}
                    maxDistance={6}
                    minPolarAngle={Math.PI / 6}
                    maxPolarAngle={Math.PI / 1.5}
                    autoRotate={autoRotate}
                    autoRotateSpeed={1.5}
                />
            </Canvas>
        </ErrorBoundary>
    );
};

export default Mug3DPreview;

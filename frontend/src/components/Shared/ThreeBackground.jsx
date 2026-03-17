import React, { useRef, Suspense, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment, PerspectiveCamera, ContactShadows, Preload } from '@react-three/drei';
import * as THREE from 'three';
import { useScroll, useTransform, useSpring } from 'framer-motion';
import { Box, useMediaQuery, useTheme, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';

// WebGL Compatibility Check
const isWebGLAvailable = () => {
    try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
        return false;
    }
};

const Model = ({ url, position, scale: initialScale, rotationSpeed = 1, delay = 0, routeAnim, globalY, globalRotate, isMobile }) => {
    const { scene } = useGLTF(url);
    const groupRef = useRef();

    const clonedScene = useMemo(() => {
        const clone = scene.clone();
        // Optimize materials for performance
        clone.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
                if (node.material) {
                    node.material.precision = 'mediump';
                }
            }
        });
        return clone;
    }, [scene]);

    const finalScale = isMobile ? initialScale * 0.55 : initialScale;
    const finalPosition = isMobile 
        ? [position[0] > 0 ? 3 : -3, position[1] * 1.5, position[2]] 
        : position;

    useFrame((state) => {
        if (!groupRef.current) return;
        
        const time = state.clock.elapsedTime + delay;
        const ra = routeAnim.get(); 
        
        groupRef.current.position.y = finalPosition[1] + Math.sin(time * 0.3) * 0.3 + globalY.get() + ra * 2;
        groupRef.current.position.x = finalPosition[0] + Math.cos(time * 0.2) * 0.15 + ra * -1;
        
        groupRef.current.rotation.y = time * 0.12 * rotationSpeed + globalRotate.get() + ra * Math.PI;
        groupRef.current.rotation.x = Math.sin(time * 0.15) * 0.08;
        
        const s = finalScale * (1 + ra * 0.15);
        groupRef.current.scale.set(s, s, s);
    });

    return (
        <group ref={groupRef}>
            <primitive object={clonedScene} />
        </group>
    );
};

const ModelFallback = () => (
    <mesh>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="#7B61FF" wireframe />
    </mesh>
);

const InnerScene = ({ routeAnim, isMobile }) => {
    const { scrollYProgress } = useScroll();
    
    const globalY = useTransform(scrollYProgress, [0, 1], [0, isMobile ? -5 : -10]);
    const globalRotate = useTransform(scrollYProgress, [0, 1], [0, Math.PI * (isMobile ? 0.8 : 1.2)]);

    return (
        <group>
            <Model 
                url="/models/true_heart_gift_box_openable.glb" 
                position={[5, 1, -2]} 
                scale={2.6} 
                rotationSpeed={0.8}
                routeAnim={routeAnim}
                globalY={globalY}
                globalRotate={globalRotate}
                isMobile={isMobile}
            />
            
            <Model 
                url="/models/small_box_openable1111.glb" 
                position={[-6, -3, -4]} 
                scale={1.8} 
                rotationSpeed={0.6}
                delay={2}
                routeAnim={routeAnim}
                globalY={globalY}
                globalRotate={globalRotate}
                isMobile={isMobile}
            />
            
            <Model 
                url="/models/medium_box_openabl111e.glb" 
                position={[-4, 4, -5]} 
                scale={1.4} 
                rotationSpeed={0.5}
                delay={5}
                routeAnim={routeAnim}
                globalY={globalY}
                globalRotate={globalRotate}
                isMobile={isMobile}
            />
        </group>
    );
};

const ThreeBackground = () => {
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [hasWebGL, setHasWebGL] = useState(true);

    useEffect(() => {
        setHasWebGL(isWebGLAvailable());
    }, []);
    
    const routeAnim = useSpring(0, { stiffness: 35, damping: 25 });

    useEffect(() => {
        routeAnim.set(1);
        const timer = setTimeout(() => routeAnim.set(0), 1200);
        return () => clearTimeout(timer);
    }, [location.pathname, routeAnim]);

    if (!hasWebGL) return null;

    return (
        <Box 
            sx={{ 
                position: 'fixed', 
                top: 0, 
                left: 0, 
                width: '100vw', 
                height: '100vh', 
                zIndex: 0, 
                pointerEvents: 'none',
                opacity: isMobile ? 0.5 : 0.7,
                filter: 'blur(1px)',
                background: 'transparent',
                transition: 'opacity 0.8s ease-in-out'
            }}
        >
            <Canvas 
                dpr={[1, 1.5]}
                gl={{ 
                    antialias: true, 
                    alpha: true, 
                    powerPreference: "high-performance",
                    precision: "mediump",
                    stencil: false,
                    depth: true
                }}
                onCreated={({ gl }) => {
                    gl.setClearColor(0x000000, 0);
                }}
                onError={(e) => {
                    console.error("3D Canvas Error:", e);
                    setHasWebGL(false);
                }}
            >
                <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={isMobile ? 55 : 35} />
                <ambientLight intensity={1.2} />
                <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={5} castShadow />
                <pointLight position={[-10, -10, -10]} intensity={3} color="#7B61FF" />
                <pointLight position={[10, -10, 5]} intensity={2.5} color="#B066FE" />
                
                <Suspense fallback={null}>
                    <InnerScene routeAnim={routeAnim} isMobile={isMobile} />
                    <Environment preset="city" />
                    <ContactShadows 
                        position={[0, -5, 0]} 
                        opacity={0.25} 
                        scale={20} 
                        blur={3} 
                        far={10} 
                    />
                    <Preload all />
                </Suspense>
            </Canvas>
        </Box>
    );
};

export default ThreeBackground;


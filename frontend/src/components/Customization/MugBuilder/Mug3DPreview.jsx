import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import PropTypes from 'prop-types';

/**
 * Mug3DPreview: High-stability WebGL component with manual lifecycle management.
 * Solves: Context loss, memory leaks, and MUI aria-hidden focus warnings.
 */
const Mug3DPreview = ({ 
    mugColor = '#f5f5f0', 
    insideColor, 
    textureUrl, 
    mugType = 'Classic Mug (11oz)', 
    autoRotate = true,
    isHidden = false 
}) => {
    const containerRef = useRef(null);
    const rendererRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const controlsRef = useRef(null);
    const requestRef = useRef(null);
    const mugGroupRef = useRef(new THREE.Group());

    // 1. Core Lifecycle: Initialize ONLY once
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Cleanup any existing content to prevent duplicates
        while (container.firstChild) container.removeChild(container.firstChild);

        const width = container.clientWidth || 500;
        const height = container.clientHeight || 500;

        // Scene, Camera, Renderer setup
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
        camera.position.set(2.5, 2, 2.5);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: true,
            powerPreference: 'high-performance'
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(width, height);
        renderer.shadowMap.enabled = true;
        rendererRef.current = renderer;

        const canvas = renderer.domElement;
        canvas.style.outline = 'none';
        canvas.setAttribute('tabindex', '-1'); // Accessibility: prevent focus trapping
        canvas.setAttribute('role', 'img');
        canvas.setAttribute('aria-label', '3D Mug Preview');
        container.appendChild(canvas);

        const controls = new OrbitControls(camera, canvas);
        controls.enableDamping = true;
        controls.minDistance = 2.5;
        controls.maxDistance = 6;
        controlsRef.current = controls;

        scene.add(mugGroupRef.current);

        // Lights
        scene.add(new THREE.AmbientLight(0xffffff, 0.5));
        const spotLight = new THREE.SpotLight(0xffffff, 1.5, 20, 0.3, 1);
        spotLight.position.set(5, 10, 5);
        spotLight.castShadow = true;
        scene.add(spotLight);

        const purpleLight = new THREE.PointLight('#6C63FF', 0.8, 10);
        purpleLight.position.set(-5, 5, -5);
        scene.add(purpleLight);

        // Floor Glow / Shadow (Mock)
        const floorGeo = new THREE.PlaneGeometry(10, 10);
        const floorMat = new THREE.MeshStandardMaterial({ 
            color: '#020617', 
            transparent: true, 
            opacity: 0.8,
            roughness: 1
        });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -1.2;
        floor.receiveShadow = true;
        scene.add(floor);

        // Soft Purple Glow under mug
        const glowGeo = new THREE.CircleGeometry(1.2, 32);
        const glowMat = new THREE.MeshBasicMaterial({ 
            color: '#6C63FF', 
            transparent: true, 
            opacity: 0.15 
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        glow.rotation.x = -Math.PI / 2;
        glow.position.y = -1.19;
        scene.add(glow);

        // Animation Loop
        const animate = (time) => {
            requestRef.current = requestAnimationFrame(animate);
            
            const t = time * 0.001; // Seconds
            
            // Suble floating animation
            if (mugGroupRef.current) {
                mugGroupRef.current.position.y = Math.sin(t * 1.5) * 0.05;
                mugGroupRef.current.rotation.z = Math.sin(t * 0.5) * 0.02;
            }

            if (controlsRef.current) controlsRef.current.update();
            if (rendererRef.current && sceneRef.current && cameraRef.current) {
                rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
        };
        animate(0);

        // Event Handlers
        const handleResize = () => {
            if (!containerRef.current) return;
            const w = containerRef.current.clientWidth;
            const h = containerRef.current.clientHeight || 500;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };

        const onContextLost = (e) => {
            e.preventDefault();
            console.warn('Mug3D: WebGL Context Lost');
            cancelAnimationFrame(requestRef.current);
        };

        const onContextRestored = () => {
            console.log('Mug3D: WebGL Context Restored');
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            animate();
        };

        window.addEventListener('resize', handleResize);
        canvas.addEventListener('webglcontextlost', onContextLost, false);
        canvas.addEventListener('webglcontextrestored', onContextRestored, false);

        // Cleanup Strategy
        return () => {
            cancelAnimationFrame(requestRef.current);
            window.removeEventListener('resize', handleResize);
            canvas.removeEventListener('webglcontextlost', onContextLost);
            canvas.removeEventListener('webglcontextrestored', onContextRestored);

            scene.traverse((obj) => {
                if (obj instanceof THREE.Mesh) {
                    obj.geometry.dispose();
                    if (obj.material.isMaterial) {
                        if (obj.material.map) obj.material.map.dispose();
                        obj.material.dispose();
                    }
                }
            });

            controls.dispose();
            renderer.forceContextLoss();
            renderer.dispose();
            if (container.contains(canvas)) container.removeChild(canvas);
        };
    }, []);

    // 2. Reactive Updates: AutoRotate & Hidden State
    useEffect(() => {
        if (controlsRef.current) {
            controlsRef.current.autoRotate = autoRotate && !isHidden;
        }
        
        const container = containerRef.current;
        if (!container) return;
        
        if (isHidden) {
            container.setAttribute('inert', ''); // Prevents focus on descendants
            container.setAttribute('aria-hidden', 'true');
            if (document.activeElement && container.contains(document.activeElement)) {
                document.activeElement.blur();
            }
        } else {
            container.removeAttribute('inert');
            container.removeAttribute('aria-hidden');
        }
    }, [autoRotate, isHidden]);

    // 3. Geometry/Color Updates (optimized)
    useEffect(() => {
        if (!sceneRef.current) return;
        const group = mugGroupRef.current;
        
        // Clear old meshes
        while (group.children.length > 0) {
            const obj = group.children[0];
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(m => m.dispose());
                } else {
                    obj.material.dispose();
                }
            }
            group.remove(obj);
        }

        // Lathe profile for a more realistic mug
        const h = mugType.includes('15oz') ? 2.4 : mugType.includes('Travel') ? 3.0 : 2.0;
        const radius = mugType.includes('Travel') ? 0.7 : 0.85;
        const bottomR = mugType.includes('Travel') ? 0.6 : 0.82;
        const wall = 0.07;

        // Outer profile
        const outerPoints = [
            new THREE.Vector2(0, 0),
            new THREE.Vector2(bottomR, 0),
            new THREE.Vector2(radius, 0.1),
            new THREE.Vector2(radius, h),
            new THREE.Vector2(radius + 0.05, h),
        ];
        const outerGeo = new THREE.LatheGeometry(outerPoints, 64);

        // Fix UV mapping for texture
        const uv = outerGeo.attributes.uv;
        const posAttr = outerGeo.attributes.position;
        for (let i = 0; i < uv.count; i++) {
            uv.setXY(i, (uv.getX(i) - 0.5) * (2.67 / 2.22) + 0.5, posAttr.getY(i) / h);
        }

        const outerCol = mugColor.toLowerCase().includes('black') ? '#222222' : '#f5f5f0';
        const bodyMat = new THREE.MeshStandardMaterial({ 
            color: outerCol, 
            roughness: 0.3,
            metalness: 0.05 
        });
        
        const body = new THREE.Mesh(outerGeo, bodyMat);
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);

        // Inner surface
        const innerPoints = [
            new THREE.Vector2(0, wall),
            new THREE.Vector2(radius - wall, wall),
            new THREE.Vector2(radius - wall, h + 0.01),
            new THREE.Vector2(radius + 0.05, h + 0.01),
        ];
        const innerCol = insideColor || (mugColor.toLowerCase().includes('red') ? '#cc3333' : mugColor.toLowerCase().includes('blue') ? '#3366cc' : outerCol);
        const innerMesh = new THREE.Mesh(
            new THREE.LatheGeometry(innerPoints, 64),
            new THREE.MeshStandardMaterial({ color: innerCol, roughness: 0.4, side: THREE.BackSide })
        );
        group.add(innerMesh);

        // Handle
        const handle = new THREE.Mesh(
            new THREE.TorusGeometry(0.45, 0.08, 16, 32, Math.PI),
            new THREE.MeshStandardMaterial({ color: outerCol, roughness: 0.3 })
        );
        handle.position.set(radius, h * 0.55, 0);
        handle.rotation.z = -Math.PI / 2;
        handle.castShadow = true;
        group.add(handle);

        // Texture overlay
        if (textureUrl) {
            const loader = new THREE.TextureLoader();
            loader.setCrossOrigin('anonymous');
            loader.load(textureUrl, (tex) => {
                tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
                const decalMat = new THREE.MeshStandardMaterial({ 
                    map: tex, 
                    transparent: true, 
                    polygonOffset: true, 
                    polygonOffsetFactor: -1,
                    roughness: 0.3 
                });
                const decalMesh = new THREE.Mesh(outerGeo, decalMat);
                group.add(decalMesh);
            }, undefined, (err) => {
                console.error("Mug3D: Failed to load texture", textureUrl, err);
            });
        }
    }, [mugColor, insideColor, textureUrl, mugType]);

    return (
        <div 
            ref={containerRef} 
            className="mug-3d-preview-container"
            style={{ 
                width: '100%', 
                height: '100%', 
                position: 'relative',
                borderRadius: '24px',
                overflow: 'hidden',
                background: 'transparent'
            }}
        />
    );
};

Mug3DPreview.propTypes = {
    mugColor: PropTypes.string,
    insideColor: PropTypes.string,
    textureUrl: PropTypes.string,
    mugType: PropTypes.string,
    autoRotate: PropTypes.bool,
    isHidden: PropTypes.bool
};

export default Mug3DPreview;

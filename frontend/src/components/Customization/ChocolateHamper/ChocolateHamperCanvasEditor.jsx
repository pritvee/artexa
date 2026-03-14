import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Text, Image as KonvaImage, Transformer, Group, Circle, Ellipse, Line } from 'react-konva';
import useImage from 'use-image';
import * as THREE from 'three';

/* ─── Chocolate brand → color / shape map ─── */
const CHOC_META = {
    dairymilk: { color: '#6A1B9A', label: '🍫', name: 'Dairy Milk', shape: 'bar' },
    kitkat:    { color: '#C62828', label: '🍬', name: 'KitKat',     shape: 'bar' },
    ferrero:   { color: '#F9A825', label: '🟡', name: 'Ferrero',    shape: 'round' },
    snickers:  { color: '#4E342E', label: '🍫', name: 'Snickers',   shape: 'bar' },
    lindt:     { color: '#AD1457', label: '🔴', name: 'Lindt',      shape: 'round' },
    toblerone: { color: '#E65100', label: '🔺', name: 'Toblerone',  shape: 'triangle' },
};

const DEC_EMOJIS = {
    flower: '🌸', wrapping: '🎁', confetti: '🎊',
    lights: '💫', heart: '❤️', star: '⭐', balloon: '🎈'
};

/* ─── Chocolate Shape renderers ─── */
const ChocolateShape = ({ item }) => {
    const meta = CHOC_META[item.type] || CHOC_META.dairymilk;
    const sz = item.size || 44;
    const scale = item.scaleX || 1;

    if (meta.shape === 'round') {
        return (
            <Group>
                <Circle radius={sz * 0.5 * scale + 3} fill="rgba(0,0,0,0.15)" y={5} />
                <Circle radius={sz * 0.5 * scale} fill={meta.color} />
                <Text text={meta.label} fontSize={sz * 0.5 * scale} x={-sz * 0.25 * scale} y={-sz * 0.25 * scale} />
            </Group>
        );
    }
    if (meta.shape === 'triangle') {
        return (
            <Group>
                <Text text="🔺" fontSize={sz * scale} x={-sz * 0.5 * scale} y={-sz * 0.5 * scale} />
                <Text text={item.qty > 1 ? `×${item.qty}` : ''} fontSize={9} fill="#fff" x={2} y={sz * 0.3 * scale} />
            </Group>
        );
    }
    // bar
    const w = sz * 1.5 * scale, h = sz * 0.75 * scale;
    return (
        <Group>
            <Rect width={w + 4} height={h + 4} x={-(w + 4) / 2} y={-(h + 4) / 2} fill="rgba(0,0,0,0.15)" cornerRadius={3} />
            <Rect width={w} height={h} x={-w / 2} y={-h / 2} fill={meta.color} cornerRadius={4} />
            {/* Bar segments */}
            {[1, 2].map(i => (
                <Rect key={i} x={-w / 2 + (w / 3) * i - 0.5} y={-h / 2} width={1} height={h} fill="rgba(255,255,255,0.15)" />
            ))}
            <Text text={meta.label} fontSize={Math.max(10, h * 0.55)} x={-h * 0.28} y={-h * 0.28} />
            {item.qty > 1 && (
                <Text text={`×${item.qty}`} fontSize={9} fill="#fff" fontStyle="bold" x={w / 2 - 16} y={h / 2 - 11} />
            )}
        </Group>
    );
};

/* ─── Draggable Chocolate ─── */
const DraggableChocolate = ({ item, isSelected, onSelect, onDragEnd, onTransformEnd }) => {
    return (
        <Group
            id={item.id}
            x={item.x} y={item.y}
            rotation={item.rotation || 0}
            draggable
            onMouseDown={(e) => { e.cancelBubble = true; onSelect(item.id); }}
            onTouchStart={(e) => { e.cancelBubble = true; onSelect(item.id); }}
            onDragEnd={(e) => onDragEnd(item.id, e.target.x(), e.target.y())}
            onTransformEnd={(e) => {
                onTransformEnd(item.id, {
                    x: e.target.x(), y: e.target.y(),
                    scaleX: Math.max(0.3, e.target.scaleX()),
                    scaleY: Math.max(0.3, e.target.scaleY()),
                    rotation: e.target.rotation()
                });
                e.target.scaleX(1); e.target.scaleY(1);
            }}
        >
            <ChocolateShape item={item} />
        </Group>
    );
};

/* ─── Draggable Decoration ─── */
const DraggableDecoration = ({ dec, isSelected, onSelect, onDragEnd, onTransformEnd }) => {
    return (
        <Group
            id={dec.id}
            x={dec.x} y={dec.y}
            rotation={dec.rotation || 0}
            draggable
            onMouseDown={(e) => { e.cancelBubble = true; onSelect(dec.id); }}
            onTouchStart={(e) => { e.cancelBubble = true; onSelect(dec.id); }}
            onDragEnd={(e) => onDragEnd(dec.id, e.target.x(), e.target.y())}
            onTransformEnd={(e) => {
                onTransformEnd(dec.id, {
                    x: e.target.x(), y: e.target.y(),
                    scaleX: e.target.scaleX(), scaleY: e.target.scaleY(),
                    rotation: e.target.rotation()
                });
                e.target.scaleX(1); e.target.scaleY(1);
            }}
        >
            <Text
                text={DEC_EMOJIS[dec.type] || '🌸'}
                fontSize={(dec.size || 36) * (dec.scaleX || 1)}
                x={-((dec.size || 36) * (dec.scaleX || 1)) / 2}
                y={-((dec.size || 36) * (dec.scaleX || 1)) / 2}
            />
        </Group>
    );
};

/* ─── Photo Card ─── */
const DraggablePhoto = ({ photo, isSelected, onSelect, onDragStart, onDrag, onDragEnd, onTransformEnd }) => {
    const [img] = useImage(photo.src, 'anonymous');
    return (
        <Group
            id={photo.id}
            x={photo.x} y={photo.y}
            rotation={photo.rotation || 0}
            draggable
            onMouseDown={(e) => { e.cancelBubble = true; onSelect(photo.id); }}
            onTouchStart={(e) => { e.cancelBubble = true; onSelect(photo.id); }}
            onDragStart={onDragStart}
            onDragMove={(e) => onDrag && onDrag(photo.id, e.target.x(), e.target.y())}
            onDragEnd={(e) => onDragEnd(photo.id, e.target.x(), e.target.y())}
            onTransformEnd={(e) => {
                onTransformEnd(photo.id, {
                    x: e.target.x(), y: e.target.y(),
                    scaleX: e.target.scaleX(), scaleY: e.target.scaleY(),
                    rotation: e.target.rotation()
                });
                e.target.scaleX(1); e.target.scaleY(1);
            }}
        >
            {img && (
                <KonvaImage
                    image={img}
                    width={(photo.width || 110) * (photo.scaleX || 1)}
                    height={(photo.height || 110) * (photo.scaleY || 1)}
                    x={-((photo.width || 110) * (photo.scaleX || 1)) / 2}
                    y={-((photo.height || 110) * (photo.scaleY || 1)) / 2}
                    cornerRadius={10}
                    shadowBlur={10}
                    shadowOpacity={0.3}
                />
            )}
        </Group>
    );
};



/* ─── Hamper background shapes ─── */
const HamperBackground = ({ containerStyle, hamperColor, size }) => {
    const CANVAS_W = 620, CANVAS_H = 520;
    const cx = CANVAS_W / 2, cy = CANVAS_H / 2;
    const color = hamperColor || '#8B6914';

    // Scale factor based on size
    const sValue = (size?.value || 'medium').toLowerCase();
    const scaleFactor = sValue === 'small' ? 0.75 : (sValue === 'premium' ? 1.25 : 1.0);
    
    const sw = CANVAS_W * scaleFactor;
    const sh = CANVAS_H * scaleFactor;
    const bx = (CANVAS_W - sw) / 2;
    const by = (CANVAS_H - sh) / 2;
    const bcx = CANVAS_W / 2;
    const bcy = CANVAS_H / 2;

    // Subtle wicker-like linen pattern
    const wicker = [];
    for (let i = 0; i < 14; i++) {
        wicker.push(<Line key={`wh${i}`} points={[0, i * 38, CANVAS_W, i * 38]} stroke="rgba(0,0,0,0.04)" strokeWidth={1} />);
        wicker.push(<Line key={`wv${i}`} points={[i * 46, 0, i * 46, CANVAS_H]} stroke="rgba(0,0,0,0.04)" strokeWidth={1} />);
    }

    const getHamperShape = () => {
        switch (containerStyle) {
            case 'wooden_box': {
                const woodTone = new THREE.Color(color).multiplyScalar(1.1).getStyle();
                const grainTone = new THREE.Color(color).multiplyScalar(0.7).getStyle();
                return (
                    <Group>
                        <Rect x={bx + 30*scaleFactor} y={by + 60*scaleFactor} width={sw - 60*scaleFactor} height={sh - 80*scaleFactor} fill={woodTone} cornerRadius={2} />
                        {/* Planked Base Pattern */}
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                            <Rect key={`plank-${i}`} x={bx + 35*scaleFactor} y={by + (75 + i*70)*scaleFactor} width={sw - 70*scaleFactor} height={60*scaleFactor} fill={woodTone} stroke={grainTone} strokeWidth={0.5} />
                        ))}
                        <Rect x={bx + 30*scaleFactor} y={by + 60*scaleFactor} width={sw - 60*scaleFactor} height={sh - 80*scaleFactor} stroke="rgba(0,0,0,0.1)" strokeWidth={24*scaleFactor} cornerRadius={2} />
                        <Rect x={bx + 30*scaleFactor} y={by + 60*scaleFactor} width={sw - 60*scaleFactor} height={sh - 80*scaleFactor} stroke={color} strokeWidth={20*scaleFactor} cornerRadius={2} />
                        <Rect x={bx + 30*scaleFactor} y={by + 60*scaleFactor} width={sw - 60*scaleFactor} height={sh - 80*scaleFactor} stroke={grainTone} strokeWidth={1} cornerRadius={2} />
                        <Rect x={bx + 10*scaleFactor} y={bcy - 15*scaleFactor} width={sw - 20*scaleFactor} height={30*scaleFactor} fill={color} stroke={grainTone} strokeWidth={1.5} cornerRadius={4} />
                    </Group>
                );
            }
            case 'rectangle_tray':
                return (
                    <Group>
                        <Rect x={bx + 20*scaleFactor} y={by + 40*scaleFactor} width={sw - 40*scaleFactor} height={sh - 80*scaleFactor} fill="#fcf8e3" cornerRadius={2} />
                        <Rect x={bx + 20*scaleFactor} y={by + 40*scaleFactor} width={sw - 40*scaleFactor} height={sh - 80*scaleFactor} stroke="#d4af37" strokeWidth={12*scaleFactor} cornerRadius={2} />
                    </Group>
                );
            case 'gift_basket':
                return (
                    <Group>
                        <Ellipse x={bcx} y={bcy + 20*scaleFactor} radiusX={(sw / 2 - 40)} radiusY={(sh / 2 - 50)}
                            fill="#F5E6C8" stroke="#8B6914" strokeWidth={12*scaleFactor} />
                        {Array.from({ length: 10 }).map((_, i) => (
                            <Ellipse key={`w1-${i}`} x={bcx} y={bcy + 20*scaleFactor} radiusX={(sw / 2 - 40) - i * 18 * scaleFactor} radiusY={(sh / 2 - 50) - i * 14 * scaleFactor}
                                stroke="rgba(139,105,20,0.18)" strokeWidth={2} />
                        ))}
                    </Group>
                );
            case 'luxury_box':
                return (
                    <Group>
                        <Rect x={bx + 20*scaleFactor} y={by + 20*scaleFactor} width={sw - 40*scaleFactor} height={sh - 40*scaleFactor} fill="#f5f0e8" cornerRadius={8} />
                        <Rect x={bx + 20*scaleFactor} y={by + 20*scaleFactor} width={sw - 40*scaleFactor} height={sh - 40*scaleFactor} stroke={color} strokeWidth={20*scaleFactor} cornerRadius={8} />
                    </Group>
                );
            case 'heart_box': {
                return (
                    <Group>
                        <Circle x={bcx - 110*scaleFactor} y={bcy - 50*scaleFactor} radius={150*scaleFactor} fill="#FFE0E6" stroke={color} strokeWidth={14*scaleFactor} />
                        <Circle x={bcx + 110*scaleFactor} y={bcy - 50*scaleFactor} radius={150*scaleFactor} fill="#FFE0E6" stroke={color} strokeWidth={14*scaleFactor} />
                    </Group>
                );
            }
            default: // gift_basket simple
                return (
                    <Group>
                        <Ellipse x={bcx} y={bcy + 20*scaleFactor} radiusX={sw / 2 - 30} radiusY={sh / 2 - 30}
                            fill="#F5E6C8" stroke={color} strokeWidth={18*scaleFactor} />
                    </Group>
                );
        }
    };

    return (
        <Group>
            {/* Base background */}
            <Rect x={0} y={0} width={620} height={520} fill="#1a1028" />
            {/* Subtle noise */}
            {wicker}
            {getHamperShape()}
            {/* Layout label */}
            <Text text={`🍫 ${size?.label || 'Medium'} Hamper Designer`} x={620 / 2 - 110} y={8}
                fontSize={12} fill="rgba(255,255,255,0.2)" fontStyle="italic" width={220} align="center" listening={false} />
        </Group>
    );
};

/* ─── Main Canvas Editor ─── */
const ChocolateHamperCanvasEditor = ({
    hamperColor, containerStyle, size,
    chocolates, decorations, photos,
    selectedId, setSelectedId,
    onChocDragEnd, onChocTransformEnd,
    onDecDragEnd, onDecTransformEnd,
    onPhotoDragStart, onPhotoDrag, onPhotoDragEnd, onPhotoTransformEnd,
    onStageReady
}) => {
    const stageRef = useRef();
    const trRef = useRef();
    const containerRef = useRef();
    const [containerDim, setContainerDim] = useState({ width: 620, height: 520 });
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const CANVAS_W = 620, CANVAS_H = 520;

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver(entries => {
            for (let e of entries) {
                const { width, height } = e.contentRect;
                if (width > 0 && height > 0) setContainerDim({ width, height });
            }
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    // Auto-fit on initial load or dimension change
    useEffect(() => {
        const fitScale = Math.min(
            (containerDim.width - 32) / CANVAS_W,
            (containerDim.height - 32) / CANVAS_H
        ) || 1;
        setScale(fitScale);
        setPosition({
            x: (containerDim.width - CANVAS_W * fitScale) / 2,
            y: (containerDim.height - CANVAS_H * fitScale) / 2
        });
    }, [containerDim]);

    // Zoom handler (mouse wheel)
    const handleWheel = (e) => {
        e.evt.preventDefault();
        const stage = stageRef.current;
        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();

        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };

        const zoomSpeed = 1.05;
        const newScale = e.evt.deltaY < 0 ? oldScale * zoomSpeed : oldScale / zoomSpeed;
        
        const constrainedScale = Math.max(0.1, Math.min(newScale, 5));
        
        setScale(constrainedScale);
        setPosition({
            x: pointer.x - mousePointTo.x * constrainedScale,
            y: pointer.y - mousePointTo.y * constrainedScale,
        });
    };

    const resetZoom = () => {
        const fitScale = Math.min((containerDim.width - 32) / CANVAS_W, (containerDim.height - 32) / CANVAS_H) || 1;
        setScale(fitScale);
        setPosition({
            x: (containerDim.width - CANVAS_W * fitScale) / 2,
            y: (containerDim.height - CANVAS_H * fitScale) / 2
        });
    };

    useEffect(() => {
        if (!trRef.current || !stageRef.current) return;
        if (selectedId) {
            const node = stageRef.current.findOne('#' + selectedId);
            if (node) { trRef.current.nodes([node]); trRef.current.getLayer()?.batchDraw(); }
            else trRef.current.nodes([]);
        } else trRef.current.nodes([]);
    }, [selectedId, chocolates, decorations, photos]);

    return (
        <div 
            ref={containerRef} 
            style={{ 
                width: '100%', 
                height: '100%', 
                position: 'relative',
                background: '#0D0D12',
                overflow: 'hidden',
                borderRadius: 16
            }}
        >
            {/* Toolbar */}
            <div style={{
                position: 'absolute', top: 12, right: 12, zIndex: 10,
                display: 'flex', flexDirection: 'column', gap: 8,
                background: 'rgba(0,0,0,0.6)', padding: 6, borderRadius: 10, backdropFilter: 'blur(10px)',
                border: '1px solid rgba(212,175,55,0.2)'
            }}>
                <button onClick={() => setScale(s => Math.min(s * 1.2, 5))} style={btnStyle}>➕</button>
                <button onClick={() => setScale(s => Math.max(s / 1.2, 0.1))} style={btnStyle}>➖</button>
                <button onClick={resetZoom} style={btnStyle}>🎯</button>
            </div>

            <div style={{
                position: 'absolute', top: 12, left: 12, zIndex: 10,
                background: 'rgba(212,175,55,0.15)', padding: '4px 12px', borderRadius: 8,
                border: '1px solid rgba(212,175,55,0.3)'
            }}>
                <span style={{ color: '#d4af37', fontSize: 11, fontWeight: 700, letterSpacing: '0.8px' }}>HAMPER DESIGNER • {Math.round(scale * 100)}%</span>
            </div>

            <Stage
                ref={(n) => { stageRef.current = n; if (n && onStageReady) onStageReady(n); }}
                width={containerDim.width} height={containerDim.height}
                scaleX={scale} scaleY={scale}
                x={position.x} y={position.y}
                draggable={!selectedId}
                onMouseDown={(e) => { if (e.target === e.target.getStage()) setSelectedId(null); }}
                onWheel={handleWheel}
                onDragEnd={e => {
                    if (e.target === stageRef.current) {
                        setPosition({ x: e.target.x(), y: e.target.y() });
                    }
                }}
                style={{ cursor: selectedId ? 'default' : 'grab' }}
            >
                <Layer>
                    {/* Shadow for the hamper */}
                    <Rect x={10} y={10} width={CANVAS_W} height={CANVAS_H} fill="rgba(0,0,0,0.4)" cornerRadius={20} shadowBlur={30} opacity={0.6} />
                    
                    {/* Hamper background */}
                    <HamperBackground 
                        key={containerStyle} 
                        containerStyle={containerStyle} 
                        hamperColor={hamperColor} 
                    />

                    {/* Chocolates */}
                    {chocolates.map(item => (
                        <DraggableChocolate key={item.id} item={item} isSelected={selectedId === item.id}
                            onSelect={setSelectedId} onDragEnd={onChocDragEnd} onTransformEnd={onChocTransformEnd} />
                    ))}

                    {/* Decorations */}
                    {decorations.map(dec => (
                        <DraggableDecoration key={dec.id} dec={dec} isSelected={selectedId === dec.id}
                            onSelect={setSelectedId} onDragEnd={onDecDragEnd} onTransformEnd={onDecTransformEnd} />
                    ))}

                    {/* Photos */}
                    {photos.map(photo => (
                        <DraggablePhoto key={photo.id} photo={photo} isSelected={selectedId === photo.id}
                            onSelect={setSelectedId} 
                            onDragStart={onPhotoDragStart}
                            onDrag={onPhotoDrag}
                            onDragEnd={onPhotoDragEnd} 
                            onTransformEnd={onPhotoTransformEnd} 
                        />
                    ))}

                    {/* Transformer */}
                    {selectedId && (
                        <Transformer
                            ref={trRef}
                            boundBoxFunc={(oldBox, newBox) => {
                                if (newBox.width < 20 || newBox.height < 20) return oldBox;
                                return newBox;
                            }}
                            anchorStroke="#d4af37"
                            anchorFill="#120a06"
                            anchorSize={8}
                            borderStroke="#d4af37"
                            borderDash={[4, 4]}
                        />
                    )}
                </Layer>
            </Stage>
            
            <div style={{ position: 'absolute', bottom: 12, right: 12, color: 'rgba(212,175,55,0.4)', fontSize: 10, fontWeight: 500 }}>
                Scroll to Zoom • Drag Canvas to Pan
            </div>
        </div>
    );
};

const btnStyle = {
    width: 32, height: 32, borderRadius: 8, border: 'none',
    background: 'rgba(255,255,255,0.08)', color: '#d4af37',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 14, transition: 'all 0.2s', outline: 'none'
};

export default ChocolateHamperCanvasEditor;

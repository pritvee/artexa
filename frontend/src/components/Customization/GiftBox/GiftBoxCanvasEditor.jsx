import { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Text, Group, Transformer, Circle, Line, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';

/* ─── Editable Item on Canvas ─── */
const EditableItem = ({ dec, isSelected, onSelect, onTransformEnd, itemCfg }) => {
    const shapeRef = useRef();
    const [img] = useImage(dec.photoUrl || '', 'anonymous');
    const emoji = itemCfg?.emoji || '🎁';
    const label = itemCfg?.name || itemCfg?.label || dec.type;
    const size = dec.size || 40;

    return (
        <Group
            id={dec.id}
            x={dec.x} y={dec.y}
            rotation={dec.rotation || 0}
            draggable
            onMouseDown={(e) => { e.cancelBubble = true; onSelect(dec.id); }}
            onTouchStart={(e) => { e.cancelBubble = true; onSelect(dec.id); }}
            onDragEnd={(e) => onTransformEnd(dec.id, { x: e.target.x(), y: e.target.y() })}
            onTransformEnd={(e) => {
                onTransformEnd(dec.id, {
                    x: e.target.x(), y: e.target.y(),
                    scaleX: e.target.scaleX(), scaleY: e.target.scaleY(),
                    rotation: e.target.rotation()
                });
                e.target.scaleX(1); e.target.scaleY(1);
            }}
        >
            {/* Shadow */}
            <Circle radius={(dec.size || 40) + 6} fill="rgba(0,0,0,0.2)" y={4} />
            {/* Background bubble / Photo */}
            {dec.photoUrl && img ? (
                (() => {
                    let imgW = size * 1.8;
                    let imgH = size * 1.8;
                    if (img.width && img.height) {
                        const aspect = img.width / img.height;
                        if (aspect > 1) {
                            imgH = imgW / aspect;
                        } else {
                            imgW = imgH * aspect;
                        }
                    }
                    return (
                        <Group>
                            <Rect
                                width={size * 2}
                                height={size * 2}
                                x={-size}
                                y={-size}
                                fill="#fff"
                                stroke={isSelected ? '#FFD93D' : 'rgba(255,255,255,0.2)'}
                                strokeWidth={isSelected ? 2 : 1}
                                cornerRadius={4}
                            />
                            <KonvaImage
                                image={img}
                                width={imgW}
                                height={imgH}
                                x={-imgW / 2}
                                y={-imgH / 2}
                            />
                        </Group>
                    );
                })()
            ) : (
                <Circle
                    radius={size}
                    fill={isSelected ? 'rgba(255,217,61,0.25)' : 'rgba(255,255,255,0.12)'}
                    stroke={isSelected ? '#FFD93D' : 'rgba(255,255,255,0.2)'}
                    strokeWidth={isSelected ? 2 : 1.2}
                />
            )}

            {/* Emoji (only if no photo) */}
            {!dec.photoUrl && (
                <Text
                    ref={shapeRef}
                    text={emoji}
                    fontSize={size * 0.9}
                    x={-size * 0.9 / 2}
                    y={-size * 0.9 / 2}
                    align="center"
                />
            )}
            {/* Label */}
            <Text
                text={label}
                y={(dec.size || 40) + 6}
                x={-(dec.size || 40)}
                width={(dec.size || 40) * 2}
                align="center"
                fontSize={11}
                fill="rgba(255,255,255,0.7)"
                fontStyle="600"
            />
        </Group>
    );
};

/* ─── Main Canvas Editor ─── */
const GiftBoxCanvasEditor = ({
    boxDimensions, boxColor, material, foamColor = '#f0dde8',
    decorations = [], selectedId, setSelectedId,
    onUpdateDecoration, onStageReady, itemsConfig = []
}) => {
    const stageRef = useRef();
    const trRef = useRef();
    const containerRef = useRef();
    const [containerDim, setContainerDim] = useState({ width: 500, height: 450 });

    // The 2D designer shows only the inside of the box floor
    const { w = 110, d = 100 } = boxDimensions || {};
    const VIRTUAL_W = Math.max(w, 80);
    const VIRTUAL_H = Math.max(d, 60);

    // Padding inset for the visible interior
    const PAD = 16;

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

    useEffect(() => {
        if (!trRef.current || !stageRef.current) return;
        if (selectedId) {
            const node = stageRef.current.findOne('#' + selectedId);
            node ? trRef.current.nodes([node]) : trRef.current.nodes([]);
            trRef.current.getLayer()?.batchDraw();
        } else {
            trRef.current.nodes([]);
        }
    }, [selectedId, decorations]);

    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    // Material tint overlay
    const getMaterialOverlay = () => {
        if (material === 'velvet') return 'rgba(0,0,0,0.12)';
        if (material === 'kraft') return 'rgba(160,120,90,0.15)';
        if (material === 'glossy') return 'rgba(255,255,255,0.08)';
        if (material === 'gold_foil') return 'rgba(212,175,55,0.15)';
        return 'transparent';
    };

    // Auto-fit on initial load or dimension change
    useEffect(() => {
        const fitScale = Math.min(
            (containerDim.width - 64) / VIRTUAL_W,
            (containerDim.height - 64) / VIRTUAL_H
        ) || 1;
        setScale(fitScale);
        setPosition({
            x: (containerDim.width - VIRTUAL_W * fitScale) / 2,
            y: (containerDim.height - VIRTUAL_H * fitScale) / 2
        });
    }, [containerDim, VIRTUAL_W, VIRTUAL_H]);

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
        
        // Constrain zoom
        const constrainedScale = Math.max(0.1, Math.min(newScale, 5));
        
        setScale(constrainedScale);
        setPosition({
            x: pointer.x - mousePointTo.x * constrainedScale,
            y: pointer.y - mousePointTo.y * constrainedScale,
        });
    };

    const resetZoom = () => {
        const fitScale = Math.min((containerDim.width - 64) / VIRTUAL_W, (containerDim.height - 64) / VIRTUAL_H) || 1;
        setScale(fitScale);
        setPosition({
            x: (containerDim.width - VIRTUAL_W * fitScale) / 2,
            y: (containerDim.height - VIRTUAL_H * fitScale) / 2
        });
    };

    return (
        <div
            ref={containerRef}
            style={{ 
                width: '100%', 
                height: '100%', 
                position: 'relative',
                background: '#151521',
                overflow: 'hidden',
                borderRadius: 16
            }}
            onDrop={(e) => {
                e.preventDefault();
                if (!stageRef.current) return;
                stageRef.current.setPointersPositions(e);
                const pos = stageRef.current.getPointerPosition();
                const itemType = e.dataTransfer.getData('itemType');
                if (itemType && pos && window.handleAddDecorationDropGlobal) {
                    window.handleAddDecorationDropGlobal(itemType, (pos.x - position.x) / scale, (pos.y - position.y) / scale);
                }
            }}
            onDragOver={e => e.preventDefault()}
        >
            {/* Toolbar */}
            <div style={{
                position: 'absolute', top: 12, right: 12, zIndex: 10,
                display: 'flex', flexDirection: 'column', gap: 8,
                background: 'rgba(0,0,0,0.4)', padding: 6, borderRadius: 10, backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <button onClick={() => setScale(s => Math.min(s * 1.2, 5))} style={btnStyle}>➕</button>
                <button onClick={() => setScale(s => Math.max(s / 1.2, 0.1))} style={btnStyle}>➖</button>
                <button onClick={resetZoom} style={btnStyle}>🎯</button>
            </div>

            <div style={{
                position: 'absolute', top: 12, left: 12, zIndex: 10,
                background: 'rgba(255,217,61,0.15)', padding: '4px 10px', borderRadius: 8,
                border: '1px solid rgba(255,217,61,0.3)'
            }}>
                <span style={{ color: '#FFD93D', fontSize: 11, fontWeight: 700, letterSpacing: '0.5px' }}>2D STUDIO • {Math.round(scale * 100)}%</span>
            </div>

            <Stage
                ref={node => { stageRef.current = node; if (node && onStageReady) onStageReady(node); }}
                width={containerDim.width}
                height={containerDim.height}
                scaleX={scale}
                scaleY={scale}
                x={position.x}
                y={position.y}
                draggable={!selectedId} // Can pan when no item is selected
                onMouseDown={e => {
                    const name = e.target.name ? e.target.name() : '';
                    if (e.target === e.target.getStage() || name.startsWith('bg')) {
                        setSelectedId(null);
                    }
                }}
                onWheel={handleWheel}
                onDragEnd={e => {
                    if (e.target === stageRef.current) {
                        setPosition({ x: e.target.x(), y: e.target.y() });
                    }
                }}
                style={{ cursor: selectedId ? 'default' : 'grab' }}
            >
                <Layer>
                    {/* Shadow for the box */}
                    <Rect 
                        x={4} y={4} 
                        width={VIRTUAL_W} height={VIRTUAL_H} 
                        fill="rgba(0,0,0,0.3)" 
                        cornerRadius={12}
                        shadowBlur={20}
                        shadowOpacity={0.5}
                    />

                    {/* Foam / interior background */}
                    <Rect 
                        name="bg" x={0} y={0} 
                        width={VIRTUAL_W} height={VIRTUAL_H} 
                        fill={foamColor} 
                        cornerRadius={12}
                    />

                    {/* Material overlay */}
                    <Rect 
                        name="bg_mat" x={0} y={0} 
                        width={VIRTUAL_W} height={VIRTUAL_H} 
                        fill={getMaterialOverlay()} 
                        cornerRadius={12}
                    />

                    {/* Subtle grid lines */}
                    <Group clipX={0} clipY={0} clipWidth={VIRTUAL_W} clipHeight={VIRTUAL_H}>
                        {Array.from({ length: Math.ceil(VIRTUAL_H / 50) + 1 }).map((_, i) => (
                            <Line key={`h-${i}`} points={[0, i * 50, VIRTUAL_W, i * 50]} stroke="rgba(0,0,0,0.05)" strokeWidth={1} listening={false} />
                        ))}
                        {Array.from({ length: Math.ceil(VIRTUAL_W / 50) + 1 }).map((_, i) => (
                            <Line key={`v-${i}`} points={[i * 50, 0, i * 50, VIRTUAL_H]} stroke="rgba(0,0,0,0.05)" strokeWidth={1} listening={false} />
                        ))}
                    </Group>

                    {/* Box border — represents the interior walls */}
                    <Rect
                        name="bg_border"
                        x={PAD / 2} y={PAD / 2}
                        width={VIRTUAL_W - PAD} height={VIRTUAL_H - PAD}
                        stroke={boxColor || '#333'}
                        strokeWidth={PAD}
                        cornerRadius={8}
                        listening={false}
                    />

                    {/* Empty state hint */}
                    {decorations.length === 0 && (
                        <Text
                            text="ADD ITEMS INSIDE 📦"
                            x={0} y={VIRTUAL_H / 2 - 10}
                            width={VIRTUAL_W}
                            align="center"
                            fontSize={16}
                            fontWeight="bold"
                            fill="rgba(0,0,0,0.2)"
                            listening={false}
                        />
                    )}

                    {/* Placed items */}
                    {decorations.map(dec => (
                        <EditableItem
                            key={dec.id}
                            dec={dec}
                            itemCfg={itemsConfig.find(c => (c.type || c.name || c.label) === dec.type)}
                            isSelected={selectedId === dec.id}
                            onSelect={setSelectedId}
                            onTransformEnd={onUpdateDecoration}
                        />
                    ))}

                    {selectedId && (
                        <Transformer 
                            ref={trRef} 
                            boundBoxFunc={(o, n) => n.width < 20 ? o : n}
                            anchorStroke="#FFD93D"
                            anchorFill="#1e1e2d"
                            anchorSize={8}
                            borderStroke="#FFD93D"
                        />
                    )}
                </Layer>
            </Stage>
            
            <div style={{ position: 'absolute', bottom: 12, right: 12, color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>
                Scroll to Zoom • Drag to Pan
            </div>
        </div>
    );
};

const btnStyle = {
    width: 30, height: 30, borderRadius: 6, border: 'none',
    background: 'rgba(255,255,255,0.1)', color: '#fff',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 14, transition: 'all 0.2s', outline: 'none'
};

export default GiftBoxCanvasEditor;

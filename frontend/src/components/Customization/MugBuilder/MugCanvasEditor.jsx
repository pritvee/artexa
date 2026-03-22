import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Text, Transformer, Rect, Group } from 'react-konva';
import useImage from 'use-image';

const MugCanvasEditor = ({
    userImageSrc, textProps, mugColor, onStageReady, onTextureUpdate,
    selectedId, setSelectedId,
    imageScale = 100, onImageScaleChange,
    imgProps, setImgProps,
    txtTransform, setTxtTransform,
    isImageLoaded, setIsImageLoaded,
    isUpscaled = false
}) => {
    const stageRef = useRef();
    const imageRef = useRef();
    const textRef = useRef();
    const trImageRef = useRef();
    const trTextRef = useRef();


    // Initial texture capture
    useEffect(() => {
        if (stageRef.current && onTextureUpdate) {
            const canvas = stageRef.current.toCanvas({ pixelRatio: 2 });
            onTextureUpdate(canvas);
        }
    }, [onTextureUpdate]);

    const isBlob = userImageSrc && (userImageSrc.startsWith('blob:') || userImageSrc.startsWith('data:'));
    const [userImage] = useImage(userImageSrc, isBlob ? undefined : 'anonymous');

    const CANVAS_W = 800; // Standard mug wrap width ratio
    const CANVAS_H = 360; // Standard mug wrap height ratio

    const containerRef = useRef();
    const [scale, setScale] = useState(1);

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver(entries => {
            const { width, height } = entries[0].contentRect;
            if (width > 0 && height > 0) {
                // Determine scale based on container width so it fits perfectly
                const fitScale = Math.min((width - 32) / CANVAS_W, (height - 32) / CANVAS_H);
                setScale(Math.max(0.1, fitScale));
            }
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [CANVAS_W, CANVAS_H]);

    // Fit image natural aspect ratio initially
    useEffect(() => {
        if (userImage && !isImageLoaded) {
            const aspect = userImage.width / userImage.height;
            let w = 250;
            let h = 250 / aspect;
            if (h > 250) {
                h = 250;
                w = h * aspect;
            }
            setImgProps(prev => ({ ...prev, width: w, height: h }));
            if (setIsImageLoaded) setIsImageLoaded(true);
            if (onImageScaleChange) onImageScaleChange(100);
        }
    }, [userImage, isImageLoaded]);

    // Get background color based on mugColor
    const getBgColor = useCallback(() => {
        if (!mugColor) return '#ffffff';
        const lower = mugColor.toLowerCase();
        if (lower.includes('black')) return '#111111';
        return '#ffffff';
    }, [mugColor]);

    // Attach transformers to selected nodes
    useEffect(() => {
        if (selectedId === 'image' && trImageRef.current && imageRef.current) {
            trImageRef.current.nodes([imageRef.current]);
            trImageRef.current.getLayer().batchDraw();
        }
    }, [selectedId, userImage]);

    useEffect(() => {
        if (selectedId === 'text' && trTextRef.current && textRef.current) {
            trTextRef.current.nodes([textRef.current]);
            trTextRef.current.getLayer().batchDraw();
        }
    }, [selectedId, textProps?.text]);

    // Export canvas for 3D texture whenever anything changes
    useEffect(() => {
        const timer = setTimeout(() => {
            if (stageRef.current && onTextureUpdate) {
                const transformers = stageRef.current.find('Transformer');
                transformers.forEach(tr => tr.hide());

                const canvas = stageRef.current.toCanvas({ pixelRatio: 2 });
                onTextureUpdate(canvas);

                if (selectedId) {
                    transformers.forEach(tr => tr.show());
                }
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [userImage, textProps, mugColor, imgProps, txtTransform, onTextureUpdate, selectedId, isUpscaled]);

    const handleDeselect = (e) => {
        if (e.target === e.target.getStage()) {
            setSelectedId(null);
        }
    };

    const { text, fontFamily, fontSize, color } = textProps || {};

    return (
        <div 
            ref={containerRef}
            style={{ 
                width: '100%', 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative'
            }}
        >
            <div style={{ width: CANVAS_W * scale, height: CANVAS_H * scale, position: 'relative' }}>
                <Stage
                    ref={(node) => {
                        stageRef.current = node;
                        if (node && onStageReady) onStageReady(node);
                    }}
                    width={CANVAS_W * scale}
                    height={CANVAS_H * scale}
                    scaleX={scale}
                    scaleY={scale}
                    onMouseDown={handleDeselect}
                    onTouchStart={handleDeselect}
                    style={{
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        cursor: 'crosshair',
                        backgroundColor: getBgColor(),
                        boxShadow: '0 12px 48px rgba(0,0,0,0.6)',
                        overflow: 'hidden'
                    }}
                >
                {/* Content Layer (Canvas is transparent so 3D decal overlay works correctly) */}
                <Layer>
                    {/* Explicit background for high-quality export */}
                    <Rect x={0} y={0} width={CANVAS_W} height={CANVAS_H} fill={getBgColor()} />
                    
                    {/* User Image */}
                    {userImage && (
                        <Group>
                            <KonvaImage
                                ref={imageRef}
                                image={userImage}
                                x={imgProps.x}
                                y={imgProps.y}
                                width={imgProps.width}
                                height={imgProps.height}
                                rotation={imgProps.rotation}
                                scaleX={imageScale / 100}
                                scaleY={imageScale / 100}
                                draggable
                                onClick={(e) => { e.cancelBubble = true; setSelectedId('image'); }}
                                onTap={(e) => { e.cancelBubble = true; setSelectedId('image'); }}
                                onMouseDown={(e) => { e.cancelBubble = true; setSelectedId('image'); }}
                                onTouchStart={(e) => { e.cancelBubble = true; setSelectedId('image'); }}
                                onDragStart={(e) => { e.cancelBubble = true; setSelectedId('image'); }}
                                onDragEnd={(e) => {
                                    setImgProps(prev => ({
                                        ...prev,
                                        x: e.target.x(),
                                        y: e.target.y()
                                    }));
                                }}
                                onTransformEnd={() => {
                                    const node = imageRef.current;
                                    setImgProps(prev => ({
                                        ...prev,
                                        x: node.x(),
                                        y: node.y(),
                                        rotation: node.rotation()
                                    }));
                                    if (onImageScaleChange) {
                                        onImageScaleChange(Math.round(node.scaleX() * 100));
                                    }
                                }}
                            />
                            {selectedId === 'image' && (
                                <Transformer
                                    ref={trImageRef}
                                    boundBoxFunc={(oldBox, newBox) => {
                                        if (newBox.width < 30 || newBox.height < 30) return oldBox;
                                        return newBox;
                                    }}
                                    rotateEnabled={true}
                                    keepRatio={true}
                                    borderStroke="#2196f3"
                                    anchorFill="#2196f3"
                                    anchorSize={10}
                                />
                            )}
                        </Group>
                    )}

                    {/* Custom Text */}
                    {text && (
                        <Group>
                            <Text
                                ref={textRef}
                                text={text}
                                x={txtTransform.x}
                                y={txtTransform.y}
                                fontSize={fontSize || 24}
                                fontFamily={fontFamily || 'Arial'}
                                fill={color || '#000000'}
                                rotation={txtTransform.rotation}
                                scaleX={txtTransform.scaleX}
                                scaleY={txtTransform.scaleY}
                                draggable
                                onClick={(e) => { e.cancelBubble = true; setSelectedId('text'); }}
                                onTap={(e) => { e.cancelBubble = true; setSelectedId('text'); }}
                                onMouseDown={(e) => { e.cancelBubble = true; setSelectedId('text'); }}
                                onTouchStart={(e) => { e.cancelBubble = true; setSelectedId('text'); }}
                                onDragStart={(e) => { e.cancelBubble = true; setSelectedId('text'); }}
                                onDragEnd={(e) => {
                                    setTxtTransform(prev => ({
                                        ...prev,
                                        x: e.target.x(),
                                        y: e.target.y()
                                    }));
                                }}
                                onTransformEnd={() => {
                                    const node = textRef.current;
                                    setTxtTransform({
                                        x: node.x(),
                                        y: node.y(),
                                        rotation: node.rotation(),
                                        scaleX: node.scaleX(),
                                        scaleY: node.scaleY()
                                    });
                                }}
                            />
                            {selectedId === 'text' && (
                                <Transformer
                                    ref={trTextRef}
                                    boundBoxFunc={(oldBox, newBox) => {
                                        if (newBox.width < 20) return oldBox;
                                        return newBox;
                                    }}
                                    rotateEnabled={true}
                                    enabledAnchors={['middle-left', 'middle-right']}
                                    borderStroke="#ff5722"
                                    anchorFill="#ff5722"
                                    anchorSize={8}
                                />
                            )}
                        </Group>
                    )}

                    {/* Edge bleed preventer */}
                    <Rect
                        x={0} y={0} width={CANVAS_W} height={CANVAS_H}
                        stroke="black"
                        strokeWidth={4}
                        listening={false}
                        globalCompositeOperation="destination-out"
                    />
                </Layer>
            </Stage>
            {/* Premium Safe Zone HUD Overlay */}
            <div style={{
                position: 'absolute',
                top: 20, left: 20,
                width: CANVAS_W - 40, height: CANVAS_H - 40,
                border: '1px solid rgba(0, 255, 255, 0.25)',
                boxShadow: 'inset 0 0 30px rgba(0,255,255,0.05)',
                pointerEvents: 'none',
                zIndex: 10
            }}>
                {/* HUD Accent Corners */}
                <div style={{ position: 'absolute', top: -1, left: -1, width: 12, height: 12, borderTop: '2px solid cyan', borderLeft: '2px solid cyan' }} />
                <div style={{ position: 'absolute', top: -1, right: -1, width: 12, height: 12, borderTop: '2px solid cyan', borderRight: '2px solid cyan' }} />
                <div style={{ position: 'absolute', bottom: -1, left: -1, width: 12, height: 12, borderBottom: '2px solid cyan', borderLeft: '2px solid cyan' }} />
                <div style={{ position: 'absolute', bottom: -1, right: -1, width: 12, height: 12, borderBottom: '2px solid cyan', borderRight: '2px solid cyan' }} />

                <div style={{
                    position: 'absolute',
                    bottom: 12, left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0, 0, 0, 0.6)',
                    color: '#00ffff',
                    padding: '4px 14px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    letterSpacing: '1px',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(0, 255, 255, 0.2)'
                }}>
                    TARGET MUG PRINT AREA
                </div>
            </div>
            </div>
        </div>
    );
};

export default MugCanvasEditor;

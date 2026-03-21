import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Stage, Layer, Image as KonvaImage, Text, Transformer, Rect, Group } from 'react-konva';
import useImage from 'use-image';
import Konva from 'konva';
import { STICKER_ICONS } from '../Shared/CustomizerConstants';

/* ─── DraggableSticker sub-component ─── */
const DraggableSticker = ({ 
    item, onSelect, onDragEnd, onTransformEnd 
}) => {
    // If it's a URL-based sticker (uploaded or pack)
    const [img] = useImage(item.url || '', 'anonymous');
    const shapeRef = useRef();

    // Re-cache for performance if opacity or shadow changes
    useEffect(() => {
        if (shapeRef.current && (item.opacity < 1 || item.shadowEnabled)) {
            // shapeRef.current.cache();
        } else if (shapeRef.current) {
            // shapeRef.current.clearCache();
        }
    }, [item.opacity, item.shadowEnabled]);

    const commonProps = {
        id: item.id,
        x: item.x,
        y: item.y,
        rotation: item.rot || 0,
        opacity: item.opacity ?? 1,
        draggable: true,
        shadowEnabled: item.shadowEnabled || false,
        shadowBlur: item.shadowBlur || 8,
        shadowOffsetX: item.shadowOffsetX || 4,
        shadowOffsetY: item.shadowOffsetY || 4,
        shadowOpacity: item.shadowOpacity || 0.3,
        shadowColor: item.shadowColor || '#000000',
        onMouseDown: onSelect,
        onTouchStart: onSelect,
        onDragEnd: onDragEnd,
        onTransformEnd: onTransformEnd,
    };

    if (item.url) {
        return (
            <KonvaImage
                ref={shapeRef}
                {...commonProps}
                image={img}
                width={item.size || 100}
                height={item.size * (img ? img.height / img.width : 1) || 100}
            />
        );
    }

    return (
        <Text
            ref={shapeRef}
            {...commonProps}
            text={STICKER_ICONS[item.type] || item.type || '❓'}
            fontSize={item.size || 50}
        />
    );
};

/* ─── DraggableImage sub-component ─── */
const DraggableImage = ({
    src, id, x, y, width, height, rotation, clipRect,
    onSelect, onDragEnd, onTransformEnd,
    filter = 'none', matThickness = 0, matColor = '#fff',
    innerBorderColor = '#ffffff',
    onAutoAdjust, onImageLoaded, fitRevision = 0, idx
}) => {
    const [img] = useImage(src, 'anonymous');
    const imgRef = useRef();

    useEffect(() => {
        if (imgRef.current && img) {
            if (filter && filter !== 'none') {
                imgRef.current.cache({ pixelRatio: 3 });
            } else {
                imgRef.current.clearCache();
            }
        }
    }, [img, filter, width, height]);

    useEffect(() => {
        if (img && onImageLoaded) {
            onImageLoaded();
        }
    }, [img, onImageLoaded]); // Only call on load

    useEffect(() => {
        if (img && onAutoAdjust) {
            onAutoAdjust(idx, img);
        }
    }, [img, clipRect.width, clipRect.height, fitRevision, onAutoAdjust, idx]); // Call on load, resize, or manual trigger

    const getFilters = () => {
        if (filter === 'bw') return [Konva.Filters.Grayscale];
        if (filter === 'vintage') return [Konva.Filters.Sepia, Konva.Filters.Brighten];
        if (filter === 'warm') return [Konva.Filters.RGBA];
        if (filter === 'cool') return [Konva.Filters.Invert];
        return [];
    };

    const clipX = clipRect.x + matThickness;
    const clipY = clipRect.y + matThickness;
    const clipW = Math.max(0, clipRect.width - matThickness * 2);
    const clipH = Math.max(0, clipRect.height - matThickness * 2);

    return (
        <Group>
            {matThickness > 0 && (
                <Rect
                    x={clipRect.x} y={clipRect.y}
                    width={clipRect.width} height={clipRect.height}
                    fill={innerBorderColor || matColor}
                    listening={false}
                />
            )}

            {matThickness > 0 && (
                <Rect
                    x={clipX} y={clipY}
                    width={clipW} height={clipH}
                    fill={matColor}
                    listening={false}
                />
            )}

            <Group clipX={clipX} clipY={clipY} clipWidth={clipW} clipHeight={clipH}>
                {img && src && (
                    <KonvaImage
                        ref={imgRef}
                        id={id}
                        image={img}
                        x={x} y={y}
                        width={width} height={height}
                        rotation={rotation}
                        filters={getFilters()}
                        brightness={filter === 'vintage' ? 0.1 : 0}
                        onMouseDown={onSelect}
                        onTouchStart={onSelect}
                        onDragEnd={onDragEnd}
                        onTransformEnd={onTransformEnd}
                    />
                )}
                {(!img || !src) && (
                    <Group>
                        <Rect
                            x={clipX} y={clipY}
                            width={clipW} height={clipH}
                            fill="rgba(102,126,234,0.04)"
                            stroke="rgba(102,126,234,0.15)"
                            strokeWidth={1.5}
                            dash={[8, 6]}
                            listening={false}
                        />
                        <Text
                            x={clipX} y={clipY + clipH / 2 - 12}
                            width={clipW}
                            text="📷 Drop Photo"
                            align="center"
                            fontSize={Math.min(clipW, clipH) * 0.08}
                            fill="rgba(102,126,234,0.4)"
                            listening={false}
                        />
                    </Group>
                )}
            </Group>
        </Group>
    );
};

/* ─── Main FrameCanvasEditor ─── */
const FrameCanvasEditor = ({
    userImages = [],
    textLayers = [],
    setTextLayers,
    layerOrder = [],
    hiddenLayers = new Set(),
    layout = 'single',
    frameSize = { width: 12, height: 8 },
    onStageReady,
    onTextureUpdate,
    selectedId,
    setSelectedId,
    stickers = [],
    setStickers,
    imgProps = [],
    setImgProps,
    borderDesign = 'minimal',
    matThickness = 0,
    matColor = '#fff',
    photoFilter = 'none',
    orientation = 'landscape',
    frameStyle = 'wooden',
    frameColor = '#111111',
    isUpscaled = false,
    innerSpacing = 20,
    outerPadding = 40,
    innerBorderColor = '#ffffff',
    fitRevision = 0,
}) => {
    const stageRef = useRef();
    const trRef = useRef();
    const containerRef = useRef();

    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const [imageLoadTick, setImageLoadTick] = useState(0);

    const { CANVAS_W, CANVAS_H } = useMemo(() => {
        const SCALE_FACTOR = 100;
        const base = {
            w: (frameSize?.width  || 12) * SCALE_FACTOR,
            h: (frameSize?.height ||  8) * SCALE_FACTOR
        };
        if (base.w === base.h) return { CANVAS_W: base.w, CANVAS_H: base.h };
        const naturallyPortrait = base.h > base.w;
        const wantPortrait = orientation === 'portrait';
        if (naturallyPortrait === wantPortrait) return { CANVAS_W: base.w, CANVAS_H: base.h };
        return { CANVAS_W: base.h, CANVAS_H: base.w };
    }, [frameSize, orientation]);

    /* BORDER_THICKNESS calculation removed as it was unused */

    // Base padding and thickness
    const sw = 30; // Border thickness
    const usableX = sw;
    const usableY = sw;
    const usableW = CANVAS_W - sw * 2;
    const usableH = CANVAS_H - sw * 2;

    const innerX = usableX + outerPadding;
    const innerY = usableY + outerPadding;
    const innerW = usableW - outerPadding * 2;
    const innerH = usableH - outerPadding * 2;

    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                setDimensions({
                    width:  containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight
                });
            }
        };
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    const handleRef = (node) => {
        stageRef.current = node;
        if (node && onStageReady) onStageReady(node);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (stageRef.current && onTextureUpdate) {
                const transformers = stageRef.current.find('Transformer');
                transformers.forEach(tr => tr.hide());
                const canvas = stageRef.current.toCanvas({ pixelRatio: 2 });
                onTextureUpdate(canvas);
                if (selectedId) transformers.forEach(tr => tr.show());
            }
        }, 500);
        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userImages, textLayers, layout, frameSize, orientation, imgProps, stickers,
        borderDesign, matThickness, matColor, photoFilter, selectedId, frameColor,
        frameStyle, isUpscaled, imageLoadTick, innerSpacing, outerPadding,
        innerBorderColor, CANVAS_W, CANVAS_H]);

    useEffect(() => {
        if (selectedId && trRef.current && stageRef.current) {
            const node = stageRef.current.findOne('#' + selectedId);
            if (node) {
                trRef.current.nodes([node]);
                trRef.current.getLayer().batchDraw();
            } else {
                trRef.current.nodes([]);
            }
        }
    }, [selectedId, orientation]);

    const handleDeselect = (e) => {
        if (e.target === e.target.getStage()) setSelectedId(null);
    };

    const imageRects = useMemo(() => {
        const sp = innerSpacing;
        const iX = innerX;
        const iY = innerY;
        const iW = Math.max(1, innerW);
        const iH = Math.max(1, innerH);

        const createGrid = (rows, cols) => {
            const cellW = (iW - sp * (cols - 1)) / cols;
            const cellH = (iH - sp * (rows - 1)) / rows;
            const rects = [];
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    rects.push({
                        x: iX + c * (cellW + sp),
                        y: iY + r * (cellH + sp),
                        width:  Math.max(1, cellW),
                        height: Math.max(1, cellH)
                    });
                }
            }
            return rects;
        };

        switch (layout) {
            case 'two-photo':   return createGrid(1, 2);
            case 'collage-3':  {
                const hsp = (iH - sp) / 2;
                return [
                    { x: iX, y: iY, width: (iW - sp) * 0.6, height: iH },
                    { x: iX + (iW - sp) * 0.6 + sp, y: iY, width: (iW - sp) * 0.4, height: hsp },
                    { x: iX + (iW - sp) * 0.6 + sp, y: iY + hsp + sp, width: (iW - sp) * 0.4, height: hsp }
                ];
            }
            case 'grid-4':  return createGrid(2, 2);
            case 'grid-6':  return createGrid(2, 3);
            case 'grid-9':  return createGrid(3, 3);
            case 'single':
            default:
                return [{ x: iX, y: iY, width: iW, height: iH }];
        }
    }, [layout, innerX, innerY, innerW, innerH, innerSpacing]);

    const performAutoAdjust = useCallback((idx, img) => {
        if (!img) return;
        const rect = imageRects[idx];
        if (!rect) return;
        const nw = img.width, nh = img.height;
        const targetRatio = rect.width / rect.height;
        const imageRatio  = nw / nh;
        let fitW = 0, fitH = 0, fitX = 0, fitY = 0;
        if (imageRatio > targetRatio) {
            fitH = rect.height; fitW = fitH * imageRatio;
            fitY = rect.y;      fitX = rect.x - (fitW - rect.width) / 2;
        } else {
            fitW = rect.width;  fitH = fitW / imageRatio;
            fitX = rect.x;     fitY = rect.y - (fitH - rect.height) / 2;
        }
        setImgProps(prev => {
            const current = prev[idx];
            // Check if we actually need to update. Use a small epsilon for float comparison.
            if (current && 
                Math.abs(current.x - fitX) < 0.1 && 
                Math.abs(current.y - fitY) < 0.1 && 
                Math.abs(current.w - fitW) < 0.1 && 
                Math.abs(current.h - fitH) < 0.1) {
                return prev;
            }
            const newArr = [...prev];
            newArr[idx] = { ...current, x: fitX, y: fitY, w: fitW, h: fitH, rot: 0 };
            return newArr;
        });
    }, [imageRects, setImgProps]);

    const renderBorder = () => {
        const style = frameStyle?.toLowerCase() || 'wooden';
        const isCanvas = style === 'canvas' || style === 'canvas frame';

        if (isCanvas || borderDesign === 'minimal') {
            const sw = isCanvas ? 10 : 30;
            const strokeColor = isCanvas ? '#ffffff' : frameColor || '#4a2c1a';
            return (
                <Rect
                    x={sw / 2} y={sw / 2}
                    width={CANVAS_W - sw} height={CANVAS_H - sw}
                    stroke={strokeColor} strokeWidth={sw}
                    listening={false}
                />
            );
        }

        if (borderDesign === 'vintage') {
            const sw1 = 40, sw2 = 6;
            return (
                <Group listening={false}>
                    <Rect x={sw1/2} y={sw1/2} width={CANVAS_W - sw1} height={CANVAS_H - sw1}
                        stroke="#4a2c1a" strokeWidth={sw1} />
                    <Rect x={sw1 + sw2/2} y={sw1 + sw2/2}
                        width={CANVAS_W - (sw1*2 + sw2)} height={CANVAS_H - (sw1*2 + sw2)}
                        stroke="#d4af37" strokeWidth={sw2} />
                    {[[0,0,0],[CANVAS_W,0,90],[CANVAS_W,CANVAS_H,180],[0,CANVAS_H,270]].map(([cx,cy,rot],i)=>(
                        <Group key={i} x={cx} y={cy} rotation={rot}>
                            <Rect x={0} y={0} width={sw1*0.8} height={sw1*0.8} fill="#d4af37" opacity={0.2} />
                        </Group>
                    ))}
                </Group>
            );
        }

        if (borderDesign === 'modern geometric') {
            const sw = 30;
            return (
                <Group listening={false}>
                    <Rect x={sw/2} y={sw/2} width={CANVAS_W - sw} height={CANVAS_H - sw}
                        stroke={frameColor || '#111'} strokeWidth={sw} />
                    <Rect x={sw+4} y={sw+4} width={CANVAS_W-(sw*2+8)} height={CANVAS_H-(sw*2+8)}
                        stroke="#ffffff" strokeWidth={1.5} opacity={0.25} />
                    {[[sw,sw],[CANVAS_W-sw,sw],[CANVAS_W-sw,CANVAS_H-sw],[sw,CANVAS_H-sw]].map(([cx,cy],i)=>(
                        <Rect key={i} x={cx-8} y={cy-8} width={16} height={16}
                            fill="#ffffff" opacity={0.3} rotation={45} />
                    ))}
                </Group>
            );
        }

        if (borderDesign === 'floral') {
            const sw = 45;
            const accent = '#c19a6b';
            return (
                <Group listening={false}>
                    <Rect x={sw/2} y={sw/2} width={CANVAS_W - sw} height={CANVAS_H - sw}
                        stroke={accent} strokeWidth={sw} dash={[14, 9]} />
                    {[[0,0,0],[CANVAS_W,0,90],[CANVAS_W,CANVAS_H,180],[0,CANVAS_H,270]].map(([cx,cy,rot],i)=>(
                        <Group key={i} x={cx} y={cy} rotation={rot}>
                            <Rect x={-28} y={-28} width={56} height={56} fill={accent} rotation={45} />
                            <Rect x={-18} y={-18} width={36} height={36} fill="#fffbf0" rotation={45} />
                            <Rect x={-8}  y={-8}  width={16} height={16} fill={accent} rotation={45} opacity={0.6} />
                        </Group>
                    ))}
                </Group>
            );
        }

        const sw = 30;
        return (
            <Rect x={sw/2} y={sw/2} width={CANVAS_W - sw} height={CANVAS_H - sw}
                stroke={frameColor || '#4a2c1a'} strokeWidth={sw}
                listening={false}
            />
        );
    };

    const handleImageLoaded = useCallback(() => {
        setImageLoadTick(t => t + 1);
    }, []);

    const scale = Math.min((dimensions.width - 40) / CANVAS_W, (dimensions.height - 40) / CANVAS_H);

    return (
        <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <Stage
                ref={handleRef}
                width={CANVAS_W * scale}
                height={CANVAS_H * scale}
                scaleX={scale} scaleY={scale}
                onMouseDown={handleDeselect}
                onTouchStart={handleDeselect}
                style={{ backgroundColor: '#fff', boxShadow: '0 20px 60px rgba(0,0,0,0.55)' }}
            >
                <Layer>
                    <Rect x={0} y={0} width={CANVAS_W} height={CANVAS_H} fill={frameColor || '#ffffff'} listening={false} />

                    <Rect 
                        x={usableX} y={usableY} 
                        width={usableW} height={usableH}
                        fill={innerBorderColor || '#ffffff'} 
                        listening={false} 
                    />

                    {layerOrder.map((id) => {
                        if (hiddenLayers.has(id)) return null;

                        if (id.startsWith('img-')) {
                            const idx = parseInt(id.split('-')[1]);
                            const rect = imageRects[idx];
                            if (!rect) return null;
                            const imageIdx = imgProps[idx]?.imageIdx ?? idx;
                            return (
                                <DraggableImage
                                    key={id}
                                    src={userImages[imageIdx]}
                                    id={id}
                                    clipRect={rect}
                                    x={imgProps[idx]?.x ?? rect.x}
                                    y={imgProps[idx]?.y ?? rect.y}
                                    width={imgProps[idx]?.w  || rect.width}
                                    height={imgProps[idx]?.h || rect.height}
                                    rotation={imgProps[idx]?.rot || 0}
                                    matThickness={matThickness}
                                    matColor={matColor}
                                    innerBorderColor={innerBorderColor}
                                    filter={photoFilter}
                                    onSelect={() => setSelectedId(id)}
                                    onAutoAdjust={performAutoAdjust}
                                    onImageLoaded={handleImageLoaded}
                                    idx={idx}
                                    fitRevision={fitRevision + imageLoadTick}
                                    onDragEnd={(e) => {
                                        const newProps = [...imgProps];
                                        if (!newProps[idx]) newProps[idx] = {};
                                        newProps[idx] = { ...newProps[idx], x: e.target.x(), y: e.target.y() };
                                        setImgProps(newProps);
                                    }}
                                    onTransformEnd={(e) => {
                                        const node = e.target;
                                        const newProps = [...imgProps];
                                        if (!newProps[idx]) newProps[idx] = {};
                                        newProps[idx] = {
                                            ...newProps[idx],
                                            x: node.x(), y: node.y(),
                                            w: node.width()  * node.scaleX(),
                                            h: node.height() * node.scaleY(),
                                            rot: node.rotation()
                                        };
                                        node.scaleX(1); node.scaleY(1);
                                        setImgProps(newProps);
                                    }}
                                />
                            );
                        }

                        if (id.startsWith('text-')) {
                            const t = textLayers.find(x => x.id === id);
                            if (!t) return null;
                            return (
                                <Text
                                    key={t.id} id={t.id}
                                    text={t.text} x={t.x} y={t.y}
                                    fontSize={t.fontSize || 32}
                                    fontFamily={t.fontFamily || 'Arial'}
                                    fill={t.color || '#000000'}
                                    align={t.align || 'center'}
                                    rotation={t.rot || 0}
                                    draggable
                                    onMouseDown={(e) => { e.cancelBubble = true; setSelectedId(t.id); }}
                                    onTouchStart={(e) => { e.cancelBubble = true; setSelectedId(t.id); }}
                                    onDragStart={(e) => { e.cancelBubble = true; setSelectedId(t.id); }}
                                    onTap={(e) => { e.cancelBubble = true; setSelectedId(t.id); }}
                                    onClick={(e) => { e.cancelBubble = true; setSelectedId(t.id); }}
                                    onDragEnd={(e) => {
                                        setTextLayers(prev => prev.map(item =>
                                            item.id === t.id ? { ...item, x: e.target.x(), y: e.target.y() } : item
                                        ));
                                    }}
                                    onTransformEnd={(e) => {
                                        const node = e.target;
                                        const newSize = node.fontSize() * node.scaleX();
                                        node.scaleX(1); node.scaleY(1);
                                        setTextLayers(prev => prev.map(item =>
                                            item.id === t.id ? { ...item, x: node.x(), y: node.y(), fontSize: newSize, rot: node.rotation() } : item
                                        ));
                                    }}
                                />
                            );
                        }

                        if (id.startsWith('sticker-')) {
                            const s = stickers.find(x => x.id === id);
                            if (!s) return null;
                            return (
                                <DraggableSticker
                                    key={s.id}
                                    item={s}
                                    onSelect={() => setSelectedId(s.id)}
                                    onDragEnd={(e) => {
                                        setStickers(prev => prev.map(item =>
                                            item.id === s.id ? { ...item, x: e.target.x(), y: e.target.y() } : item
                                        ));
                                    }}
                                    onTransformEnd={(e) => {
                                        const node = e.target;
                                        const newSize = node.fontSize ? (node.fontSize() * node.scaleX()) : (node.width() * node.scaleX());
                                        node.scaleX(1); node.scaleY(1);
                                        setStickers(prev => prev.map(item =>
                                            item.id === s.id ? { ...item, x: node.x(), y: node.y(), size: newSize, rot: node.rotation() } : item
                                        ));
                                    }}
                                />
                            );
                        }
                        return null;
                    })}

                    {renderBorder()}

                    {selectedId && (
                        <Transformer
                            ref={trRef}
                            boundBoxFunc={(oldBox, newBox) => {
                                if (newBox.width < 10 || newBox.height < 10) return oldBox;
                                return newBox;
                            }}
                        />
                    )}
                </Layer>
            </Stage>
        </div>
    );
};

export default FrameCanvasEditor;

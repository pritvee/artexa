import React, { useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Text, Transformer, Rect, Group } from 'react-konva';
import useImage from 'use-image';

const CanvasPreview = ({ bgImageSrc, userImageSrc, textProps, customizationData = {}, schemaType, onReady }) => {
    const [bgImage] = useImage(bgImageSrc);
    const [userImage] = useImage(userImageSrc);
    const stageRef = useRef();
    const shapeRef = useRef();
    const trRef = useRef();

    useEffect(() => {
        if (stageRef.current && onReady) {
            onReady(stageRef.current);
        }
    }, [onReady]);

    // Text state for Konva
    const { text, fontFamily, fontSize, color } = textProps;

    const getColorHex = (c) => {
        if (!c) return 'transparent';
        const lower = c.toLowerCase();
        if (lower.includes('black')) return 'rgba(0,0,0,0.4)';
        if (lower.includes('red')) return 'rgba(255,0,0,0.3)';
        if (lower.includes('brown')) return '#8B4513';
        if (lower.includes('white')) return 'rgba(255,255,255,0.4)';
        return c;
    };

    return (
        <Stage width={500} height={500} ref={stageRef}>
            <Layer>
                {/* Background Product Layer (e.g., Blank Mug) */}
                {bgImage && (
                    <KonvaImage
                        image={bgImage}
                        width={500}
                        height={500}
                        alt="product-bg"
                    />
                )}
            </Layer>

            <Layer>
                {/* Background Tint filter for Mugs overlaying the background */}
                {bgImage && schemaType === 'Mug' && customizationData.color && (
                    <Rect
                        width={500}
                        height={500}
                        fill={getColorHex(customizationData.color)}
                        globalCompositeOperation="multiply"
                    />
                )}
            </Layer>

            <Layer>
                {/* User Uploaded Photo Layer */}
                {userImage && (
                    <Group>
                        {schemaType === 'Frame' && customizationData.color && (
                            <Rect
                                x={145}
                                y={145}
                                width={210}
                                height={210}
                                fill="white"
                                stroke={customizationData.color.toLowerCase().includes('black') ? 'black' :
                                    customizationData.color.toLowerCase().includes('brown') ? '#8B4513' : 'white'}
                                strokeWidth={10}
                                shadowColor="black"
                                shadowBlur={10}
                                shadowOpacity={0.3}
                            />
                        )}
                        <KonvaImage
                            id="user-photo"
                            image={userImage}
                            x={150}
                            y={150}
                            width={200}
                            height={200}
                            draggable
                            onDragStart={(e) => {
                                e.target.setAttrs({
                                    shadowOffset: { x: 5, y: 5 },
                                    scaleX: 1.05,
                                    scaleY: 1.05,
                                });
                            }}
                            onDragEnd={(e) => {
                                e.target.setAttrs({
                                    shadowOffset: { x: 0, y: 0 },
                                    scaleX: 1,
                                    scaleY: 1,
                                });
                            }}
                        />
                        {schemaType === 'Frame' && customizationData.layout === 'Collage' && (
                            <KonvaImage
                                key="collage-2"
                                image={userImage}
                                x={250}
                                y={250}
                                width={100}
                                height={100}
                                draggable
                            />
                        )}
                    </Group>
                )}

                {/* Custom Text Layer */}
                {text && (
                    <Text
                        text={text}
                        x={150}
                        y={100}
                        fontSize={fontSize}
                        fontFamily={fontFamily}
                        fill={color}
                        draggable
                        align="center"
                    />
                )}
            </Layer>
        </Stage>
    );
};

export default CanvasPreview;

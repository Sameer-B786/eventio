"use client";
import React, { useRef, useEffect } from 'react';
import { Stage, Layer, Text, Rect, Transformer } from 'react-konva';
import DynamicImageNode from './DynamicImageNode';
import DynamicBarcodeNode from './DynamicBarcodeNode';
import { useGeneratorStore } from '@/store/useGeneratorStore';

export default function InteractiveTemplateEditor({ record }) {
  const templateJson = useGeneratorStore((state) => state.templateJson);
  const selectedElementId = useGeneratorStore((state) => state.selectedElementId);
  const setSelectedElementId = useGeneratorStore((state) => state.setSelectedElementId);
  const updateElement = useGeneratorStore((state) => state.updateElement);

  const stageRef = useRef(null);
  const trRef = useRef(null);
  const shapeRefs = useRef({});

  useEffect(() => {
    if (selectedElementId && trRef.current) {
      // we need to attach transformer manually
      const node = shapeRefs.current[selectedElementId];
      if (node) {
        trRef.current.nodes([node]);
        trRef.current.getLayer().batchDraw();
      }
    }
  }, [selectedElementId]);

  if (!templateJson) return null;

  const { canvas, elements } = templateJson;

  const checkDeselect = (e) => {
    // deselect when clicked on empty area or background image
    const clickedOnEmpty = e.target === e.target.getStage();
    const clickedOnBackground = e.target.hasName('background');
    if (clickedOnEmpty || clickedOnBackground) {
      setSelectedElementId(null);
    }
  };

  return (
    <div className="w-full h-full flex justify-center items-center overflow-auto bg-gray-50 border border-gray-200 rounded-xl relative">
      <Stage
        width={canvas.width}
        height={canvas.height}
        ref={stageRef}
        onMouseDown={checkDeselect}
        onTouchStart={checkDeselect}
        style={{ 
          backgroundColor: canvas.backgroundColor || '#FFFFFF',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
        }}
      >
        <Layer>
          {/* Background color layer */}
          <Rect width={canvas.width} height={canvas.height} fill={canvas.backgroundColor || '#FFFFFF'} name="background" />
          
          {elements.map((element, index) => {
            const isSelected = element.id === selectedElementId;
            const isLocked = element.locked;

            const handleDragEnd = (e) => {
              updateElement(element.id, {
                x: e.target.x(),
                y: e.target.y(),
              });
            };

            const handleTransformEnd = (e) => {
              const node = shapeRefs.current[element.id];
              const scaleX = node.scaleX();
              const scaleY = node.scaleY();

              // we will reset it back
              node.scaleX(1);
              node.scaleY(1);

              updateElement(element.id, {
                x: node.x(),
                y: node.y(),
                // For text, we might want to scale width/height or font size. 
                // For images/barcodes, we scale width/height.
                width: Math.max(5, node.width() * scaleX),
                height: Math.max(5, node.height() * scaleY),
                // optionally update font size if it's text
                ...(element.type === 'DYNAMIC_TEXT' || element.type === 'TEXT' 
                  ? { fontSize: Math.max(10, element.fontSize * scaleX) } 
                  : {})
              });
            };

            const commonProps = {
              ref: (node) => { shapeRefs.current[element.id] = node; },
              onClick: () => { if (!isLocked) setSelectedElementId(element.id); },
              onTap: () => { if (!isLocked) setSelectedElementId(element.id); },
              draggable: !isLocked,
              onDragEnd: handleDragEnd,
              onTransformEnd: handleTransformEnd,
            };

            if (element.type === 'IMAGE' || element.type === 'DYNAMIC_IMAGE') {
              // If it's a background image, we can name it so checkDeselect ignores it
              if (isLocked) {
                return <DynamicImageNode key={element.id} element={element} record={record} name="background" />;
              }
              return <DynamicImageNode key={element.id} element={element} record={record} {...commonProps} />;
            }

            if (element.type === 'DYNAMIC_TEXT' || element.type === 'TEXT') {
              const textValue = record?.[element.fieldMapping] || element.text || `[${element.fieldMapping}]`;
              return (
                <Text
                  key={element.id}
                  x={element.x}
                  y={element.y}
                  text={textValue}
                  fontSize={element.fontSize}
                  fontFamily={element.fontFamily || 'Arial'}
                  fill={element.fill || '#000000'}
                  fontStyle={element.fontStyle || 'normal'}
                  align={element.align || 'left'}
                  width={element.width}
                  {...commonProps}
                />
              );
            }

            if (element.type === 'DYNAMIC_BARCODE') {
              return <DynamicBarcodeNode key={element.id} element={element} record={record} {...commonProps} />;
            }

            return null;
          })}
          
          {selectedElementId && (
            <Transformer
              ref={trRef}
              boundBoxFunc={(oldBox, newBox) => {
                // limit resize
                if (newBox.width < 5 || newBox.height < 5) {
                  return oldBox;
                }
                return newBox;
              }}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}

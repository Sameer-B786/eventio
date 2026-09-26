"use client";
import React from 'react';
import { Stage, Layer, Text, Rect } from 'react-konva';
import DynamicImageNode from './DynamicImageNode';
import DynamicBarcodeNode from './DynamicBarcodeNode';

export default function KonvaPreviewStage({ templateJson, record, stageRef }) {
  if (!templateJson) return null;

  const { canvas, elements } = templateJson;

  return (
    <Stage
      width={canvas.width}
      height={canvas.height}
      ref={stageRef}
      style={{ border: '1px solid #ccc', backgroundColor: canvas.backgroundColor || '#FFFFFF' }}
    >
      <Layer>
        {/* Background color layer */}
        <Rect width={canvas.width} height={canvas.height} fill={canvas.backgroundColor || '#FFFFFF'} />
        
        {elements.map((element, index) => {
          if (element.type === 'IMAGE' || element.type === 'DYNAMIC_IMAGE') {
            return <DynamicImageNode key={index} element={element} record={record} />;
          }

          if (element.type === 'DYNAMIC_TEXT' || element.type === 'TEXT') {
            const textValue = record?.[element.fieldMapping] || element.text || '';
            return (
              <Text
                key={index}
                x={element.x}
                y={element.y}
                text={textValue}
                fontSize={element.fontSize}
                fontFamily={element.fontFamily || 'Arial'}
                fill={element.fill || '#000000'}
                align={element.align || 'left'}
                width={element.width}
              />
            );
          }

          if (element.type === 'DYNAMIC_BARCODE') {
            return <DynamicBarcodeNode key={index} element={element} record={record} />;
          }

          return null;
        })}
      </Layer>
    </Stage>
  );
}


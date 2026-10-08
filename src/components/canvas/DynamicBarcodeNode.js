"use client";
import React, { useMemo, useState, useEffect, forwardRef } from 'react';
import { Image as KonvaImage } from 'react-konva';
import { generateBarcodeDataUrl } from '@/lib/barcodeGenerator';

const DynamicBarcodeNode = forwardRef(({ element, record, ...props }, ref) => {
  const [image, setImage] = useState(null);
  const value = record?.[element.fieldMapping];
  
  useEffect(() => {
    if (!value) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setImage(null);
      return;
    }
    const dataUrl = generateBarcodeDataUrl(value, element.barcodeFormat || "CODE128");
    const img = new window.Image();
    img.src = dataUrl;
    img.onload = () => setImage(img);
  }, [value, element.barcodeFormat]);

  if (!image) return null;

  return (
    <KonvaImage
      ref={ref}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      image={image}
      draggable={element.draggable || false}
      {...props}
    />
  );
});

export default DynamicBarcodeNode;

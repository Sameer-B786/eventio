"use client";
import React, { useState, useEffect } from 'react';
import { Image as KonvaImage } from 'react-konva';

export default function DynamicImageNode({ element, record }) {
  const [image, setImage] = useState(null);
  const src = record?.[element.fieldMapping] || element.src;

  useEffect(() => {
    if (!src) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setImage(null);
        return;
    }
    const img = new window.Image();
    img.crossOrigin = "Anonymous";
    img.src = src;
    img.onload = () => {
      setImage(img);
    };
  }, [src]);

  if (!image) return null;

  return (
    <KonvaImage
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      image={image}
      cornerRadius={element.borderRadius || 0}
      draggable={element.draggable || false}
    />
  );
}

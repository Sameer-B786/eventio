"use client";
import React, { useState } from 'react';
import { useGeneratorStore } from '@/store/useGeneratorStore';
import Konva from 'konva';
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { generateBarcodeDataUrl } from '@/lib/barcodeGenerator';
import { Button } from '@/components/ui/button';

export default function BulkRenderEngine({ format = 'CR80' }) {
  const records = useGeneratorStore((state) => state.records);
  const templateJson = useGeneratorStore((state) => state.templateJson);
  const isGenerating = useGeneratorStore((state) => state.isGenerating);
  const setIsGenerating = useGeneratorStore((state) => state.setIsGenerating);
  
  const [status, setStatus] = useState(null); // e.g., 'Processing 1/50', 'Completed'
  const [downloadUrl, setDownloadUrl] = useState(null);

  // Helper to load an image asynchronously
  const loadImage = (src) => new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null); // Ignore errors so it doesn't break bulk generation
    img.src = src;
  });

  const executeBatchGeneration = async () => {
    if (!records || records.length === 0 || !templateJson) return;

    setIsGenerating(true);
    setStatus('Verifying credits...');
    setDownloadUrl(null);

    try {
      // 1. Deduct Credits
      const deductRes = await fetch('/api/credits/deduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: records.length })
      });

      if (!deductRes.ok) {
        if (deductRes.status === 402) {
          if (confirm(`Insufficient credits! You need ${records.length} credits. Redirect to billing?`)) {
            window.location.href = '/idgen/billing';
          }
        } else {
          alert("Failed to verify credits. Please try again.");
        }
        setStatus(null);
        setIsGenerating(false);
        return;
      }

      setStatus('Initializing generation...');

      const zip = new JSZip();
      const { canvas, elements } = templateJson;
      const width = canvas.width;
      const height = canvas.height;

      // Create a hidden container for Konva
      const container = document.createElement('div');
      container.style.display = 'none';
      document.body.appendChild(container);

      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        setStatus(`Processing ID card ${i + 1} of ${records.length}...`);

        const stage = new Konva.Stage({
          container: container,
          width: width,
          height: height,
        });

        const layer = new Konva.Layer();
        stage.add(layer);

        // 1. Draw Background
        layer.add(new Konva.Rect({
          width, height,
          fill: canvas.backgroundColor || '#FFFFFF'
        }));

        // 2. Draw Elements
        const promises = elements.map(async (element) => {
          if (element.type === 'DYNAMIC_TEXT' || element.type === 'TEXT') {
            const textValue = record[element.fieldMapping] || element.text || '';
            layer.add(new Konva.Text({
              x: element.x,
              y: element.y,
              text: String(textValue),
              fontSize: element.fontSize,
              fontFamily: element.fontFamily || 'Arial',
              fill: element.fill || '#000000',
              align: element.align || 'left',
              width: element.width,
            }));
          }

          if (element.type === 'IMAGE' || element.type === 'DYNAMIC_IMAGE') {
            const src = record[element.fieldMapping] || element.src;
            if (src) {
              const imgObj = await loadImage(src);
              if (imgObj) {
                layer.add(new Konva.Image({
                  x: element.x,
                  y: element.y,
                  width: element.width,
                  height: element.height,
                  image: imgObj,
                  cornerRadius: element.borderRadius || 0
                }));
              }
            }
          }

          if (element.type === 'DYNAMIC_BARCODE') {
            const val = record[element.fieldMapping];
            if (val) {
              const dataUrl = generateBarcodeDataUrl(val, element.barcodeFormat || "CODE128");
              const imgObj = await loadImage(dataUrl);
              if (imgObj) {
                layer.add(new Konva.Image({
                  x: element.x,
                  y: element.y,
                  width: element.width,
                  height: element.height,
                  image: imgObj,
                }));
              }
            }
          }
        });

        await Promise.all(promises);

        // Force a synchronous draw
        layer.draw();

        // Capture canvas
        const dataUrl = stage.toDataURL({ pixelRatio: 2 }); // High quality

        // Determine physical dimensions based on format prop
        const isLandscape = width > height;
        let cardWidthMm = isLandscape ? 85.6 : 53.98;
        let cardHeightMm = isLandscape ? 53.98 : 85.6;

        if (format === 'A4') {
          // Standard A4 dimensions
          cardWidthMm = isLandscape ? 297 : 210;
          cardHeightMm = isLandscape ? 210 : 297;
        }

        const pdf = new jsPDF({
          orientation: isLandscape ? 'l' : 'p',
          unit: 'mm',
          format: [cardWidthMm, cardHeightMm]
        });
        
        // Stretch/Scale the high-resolution canvas image exactly into the physical paper bounds
        pdf.addImage(dataUrl, 'PNG', 0, 0, cardWidthMm, cardHeightMm);
        
        const pdfBlob = pdf.output('blob');
        
        // Add to ZIP (name by participant name to easily identify the PDF)
        const participantName = record.participant_name || record.attendee_name || record.name || record.Name || record.ID || record.id || `Document_${i+1}`;
        const fileName = participantName.toString().replace(/[^a-zA-Z0-9_-]/g, '_');
        zip.file(`${fileName}.pdf`, pdfBlob);

        stage.destroy();
      }

      document.body.removeChild(container);

      setStatus('Compressing ZIP file...');
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      const zipUrl = URL.createObjectURL(zipBlob);
      setDownloadUrl(zipUrl);
      setStatus('COMPLETED');

    } catch (err) {
      console.error("Error during client generation", err);
      alert("Failed to generate ID cards.");
      setStatus(null);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!records || records.length === 0 || !templateJson) {
    return (
      <div className="flex flex-col gap-4 p-4 bg-gray-50 border border-gray-200 border-dashed rounded-xl items-center text-center">
        <p className="text-gray-500 text-sm">
          Please upload both an Excel file and a JSON Template to enable generation.
        </p>
        <Button disabled className="bg-gray-300 text-gray-500 min-w-[120px]">
          Start Generation
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-50 border rounded-xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-800">Ready to Generate</h3>
          <p className="text-sm text-gray-500">
            {records.length} records • {templateJson.elements.length} layout elements
          </p>
        </div>
        
        {downloadUrl ? (
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <a href={downloadUrl} download="eventio_id_cards.zip">
              Download ZIP
            </a>
          </Button>
        ) : (
          <Button 
            onClick={executeBatchGeneration} 
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
          >
            {isGenerating ? 'Generating...' : 'Start Generation'}
          </Button>
        )}
      </div>

      {status && (
        <div className="text-sm px-3 py-2 rounded-md font-medium text-gray-700 bg-blue-50 border border-blue-100 flex items-center justify-between">
           <span>Status: </span>
           <span className={status === 'COMPLETED' ? 'text-green-600 font-bold' : 'text-blue-600 animate-pulse'}>
             {status}
           </span>
        </div>
      )}
    </div>
  );
}

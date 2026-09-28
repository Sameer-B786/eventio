"use client";
import React, { useState, useEffect } from 'react';
import { useGeneratorStore } from '@/store/useGeneratorStore';
import Konva from 'konva';
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { generateBarcodeDataUrl } from '@/lib/barcodeGenerator';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BulkRenderEngine({ format = 'CR80' }) {
  const records = useGeneratorStore((state) => state.records);
  const templateJson = useGeneratorStore((state) => state.templateJson);
  const isGenerating = useGeneratorStore((state) => state.isGenerating);
  const setIsGenerating = useGeneratorStore((state) => state.setIsGenerating);
  
  const [status, setStatus] = useState(null); // e.g., 'Processing 1/50', 'Completed'
  const [downloadUrl, setDownloadUrl] = useState(null);
  
  // Wallet state
  const [walletBalance, setWalletBalance] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const router = useRouter();

  // Fetch balance on mount
  useEffect(() => {
    fetch('/api/credits/balance')
      .then(r => r.json())
      .then(data => setWalletBalance(data.credits))
      .catch(console.error);
  }, []);

  // Helper to load an image asynchronously
  const loadImage = (src) => new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null); // Ignore errors so it doesn't break bulk generation
    img.src = src;
  });

  const handleStartGenerationClick = () => {
    if (walletBalance === null) return; // Still loading balance
    setShowConfirmModal(true);
  };

  const executeBatchGeneration = async () => {
    setShowConfirmModal(false);
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
        alert("Failed to deduct credits. Please try again.");
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
      
      // Update UI balance
      setWalletBalance(prev => prev - records.length);

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

  const cost = records.length;
  const hasEnoughCredits = walletBalance !== null && walletBalance >= cost;

  return (
    <>
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
              onClick={handleStartGenerationClick} 
              disabled={isGenerating || walletBalance === null}
              className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
            >
              {isGenerating ? 'Generating...' : walletBalance === null ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Start Generation'}
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

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {hasEnoughCredits ? (
              <div className="p-6">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                  <Wallet className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirm Generation</h2>
                <p className="text-gray-600 mb-6">
                  You are about to generate <strong>{cost}</strong> documents. This will deduct <strong>{cost} credits</strong> from your wallet.
                </p>
                <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Current Balance</span>
                    <span className="font-semibold">{walletBalance}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2 text-red-500">
                    <span>Cost</span>
                    <span>-{cost}</span>
                  </div>
                  <div className="h-px bg-gray-200 w-full my-2"></div>
                  <div className="flex justify-between font-bold text-gray-900">
                    <span>New Balance</span>
                    <span>{walletBalance - cost}</span>
                  </div>
                </div>
                <div className="flex gap-3 w-full">
                  <Button variant="outline" className="flex-1" onClick={() => setShowConfirmModal(false)}>Cancel</Button>
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={executeBatchGeneration}>Confirm & Deduct</Button>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Insufficient Credits</h2>
                <p className="text-gray-600 mb-6">
                  You need <strong>{cost} credits</strong> to generate these documents, but you only have <strong>{walletBalance} credits</strong> in your wallet.
                </p>
                <div className="flex gap-3 w-full">
                  <Button variant="outline" className="flex-1" onClick={() => setShowConfirmModal(false)}>Cancel</Button>
                  <Button className="flex-1 bg-gray-900 hover:bg-gray-800 text-white" onClick={() => router.push('/idgen/billing')}>Top Up Wallet</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

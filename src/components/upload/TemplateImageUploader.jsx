"use client";
import React, { useState } from 'react';
import { useGeneratorStore } from '@/store/useGeneratorStore';
import { ImagePlus, Trash2 } from 'lucide-react';

export default function TemplateImageUploader() {
  const setTemplateJson = useGeneratorStore((state) => state.setTemplateJson);
  const templateJson = useGeneratorStore((state) => state.templateJson);
  const [error, setError] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError("Please upload a valid image file (PNG, JPG).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      const img = new Image();
      img.onload = () => {
        setTemplateJson({
          canvas: { width: img.width, height: img.height, backgroundColor: '#FFFFFF' },
          elements: [
            {
              id: crypto.randomUUID(),
              type: 'IMAGE',
              src: dataUrl,
              x: 0,
              y: 0,
              width: img.width,
              height: img.height,
              locked: true // Background shouldn't be moved in the editor
            }
          ]
        });
        setError(null);
      };
      img.onerror = () => {
        setError("Failed to load image. Please try another file.");
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleClearTemplate = () => {
    if (confirm("Are you sure you want to clear the template? This will remove all added fields.")) {
      setTemplateJson(null);
    }
  };

  return (
    <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-center space-y-4 flex flex-col items-center relative transition-colors hover:bg-gray-100">
      {templateJson ? (
        <div className="w-full flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
            <ImagePlus className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Template Image Uploaded</p>
            <p className="text-xs text-gray-500">{templateJson.canvas.width} x {templateJson.canvas.height} px</p>
          </div>
          <button 
            onClick={handleClearTemplate}
            className="mt-2 text-xs flex items-center gap-1 px-3 py-1.5 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 rounded-full transition-colors"
          >
            <Trash2 className="w-3 h-3" /> Remove Template
          </button>
        </div>
      ) : (
        <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer py-4">
          <div className="w-12 h-12 bg-white text-indigo-600 rounded-full shadow-sm flex items-center justify-center mb-3">
            <ImagePlus className="w-6 h-6" />
          </div>
          <span className="text-sm font-semibold text-gray-800">Upload Background Template</span>
          <span className="text-xs text-gray-500 mt-1">Accepts PNG, JPG</span>
          <input 
            type="file" 
            accept="image/png, image/jpeg" 
            onChange={handleFileUpload} 
            className="hidden" 
          />
        </label>
      )}

      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );
}

"use client";
import React from 'react';
import { useGeneratorStore } from '@/store/useGeneratorStore';
import { Plus, Trash2, Type, Barcode, Paintbucket } from 'lucide-react';

export default function FieldToolbar() {
  const records = useGeneratorStore((state) => state.records);
  const addElement = useGeneratorStore((state) => state.addElement);
  const updateElement = useGeneratorStore((state) => state.updateElement);
  const removeElement = useGeneratorStore((state) => state.removeElement);
  const selectedElementId = useGeneratorStore((state) => state.selectedElementId);
  const templateJson = useGeneratorStore((state) => state.templateJson);

  if (!templateJson) return null;

  const headers = records?.length > 0 ? Object.keys(records[0]) : [];
  const selectedElement = templateJson.elements.find(el => el.id === selectedElementId);

  const handleAddField = (fieldMapping) => {
    addElement({
      type: 'DYNAMIC_TEXT',
      fieldMapping,
      x: 50,
      y: 50,
      fontSize: 24,
      fontFamily: 'Arial',
      fill: '#000000',
      fontStyle: 'normal',
      align: 'left',
      width: 200
    });
  };

  const handleAddBarcode = (fieldMapping) => {
    addElement({
      type: 'DYNAMIC_BARCODE',
      fieldMapping,
      barcodeFormat: 'CODE128',
      x: 50,
      y: 150,
      width: 150,
      height: 50
    });
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mt-4 flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Add Fields to Template</h3>
        {headers.length === 0 ? (
          <p className="text-xs text-gray-500 italic">Upload Excel data first to see available fields.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {headers.map(header => (
              <div key={header} className="flex flex-col gap-1">
                <button
                  onClick={() => handleAddField(header)}
                  className="px-3 py-1.5 text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-md flex items-center gap-1 transition-colors"
                >
                  <Type className="w-3 h-3" /> {header} Text
                </button>
                <button
                  onClick={() => handleAddBarcode(header)}
                  className="px-3 py-1.5 text-xs bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-md flex items-center gap-1 transition-colors"
                >
                  <Barcode className="w-3 h-3" /> {header} Barcode
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedElement && !selectedElement.locked && (
        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Element Settings</h3>
            <button
              onClick={() => removeElement(selectedElementId)}
              className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Remove
            </button>
          </div>

          {selectedElement.type === 'DYNAMIC_TEXT' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Font Size</label>
                <input
                  type="number"
                  value={Math.round(selectedElement.fontSize || 24)}
                  onChange={(e) => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) || 24 })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Font Family</label>
                <select
                  value={selectedElement.fontFamily || 'Arial'}
                  onChange={(e) => updateElement(selectedElement.id, { fontFamily: e.target.value })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                >
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Verdana">Verdana</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Boldness</label>
                <select
                  value={selectedElement.fontStyle || 'normal'}
                  onChange={(e) => updateElement(selectedElement.id, { fontStyle: e.target.value })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                >
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                  <option value="italic">Italic</option>
                  <option value="italic bold">Bold Italic</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={selectedElement.fill || '#000000'}
                    onChange={(e) => updateElement(selectedElement.id, { fill: e.target.value })}
                    className="w-8 h-8 rounded cursor-pointer"
                  />
                  <span className="text-xs text-gray-600">{selectedElement.fill || '#000000'}</span>
                </div>
              </div>
            </div>
          )}
          
          {selectedElement.type === 'DYNAMIC_BARCODE' && (
            <div className="text-xs text-gray-500 mt-2">
              Barcode formatting is generated automatically. Resize using handles on the canvas.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

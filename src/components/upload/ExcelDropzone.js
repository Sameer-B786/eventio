"use client";
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { useGeneratorStore } from '@/store/useGeneratorStore';
import { validateRecordsBulk, schemas } from '@/lib/excelValidator';

export default function ExcelDropzone({ schemaType }) {
  const setRecords = useGeneratorStore((state) => state.setRecords);
  const [errors, setErrors] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);

      const validationErrors = validateRecordsBulk(json, schemaType);
      
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setRecords([]);
      } else {
        setErrors([]);
        setRecords(json);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="p-4 border-2 border-dashed border-gray-300 rounded text-center">
      <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} className="mb-4" />
      <p className="text-gray-800 font-medium mb-2">Upload Excel/CSV Data</p>
      
      {/* Guidelines Block */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-left text-sm text-blue-800 mb-4 inline-block max-w-full">
        <p className="font-semibold mb-1">Required Columns for {schemaType.toUpperCase()} Schema:</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(schemas[schemaType] || {}).map(([key, rules]) => {
            if (rules.forbidden) return null;
            return (
              <span key={key} className="bg-white px-2 py-1 rounded text-xs border border-blue-200 font-mono">
                {key} {rules.required && <span className="text-red-500">*</span>}
              </span>
            );
          })}
        </div>
      </div>
      
      {errors.length > 0 && (
        <div className="mt-4 text-left text-red-500 bg-red-50 p-2 rounded max-h-40 overflow-y-auto">
          <strong>Validation Errors:</strong>
          <ul className="list-disc pl-5 mt-2">
            {errors.map((err, idx) => (
              <li key={idx} className="text-sm">{err}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}


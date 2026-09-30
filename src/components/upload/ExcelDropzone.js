"use client";
import React, { useState } from 'react';
import ExcelJS from 'exceljs';
import { useGeneratorStore } from '@/store/useGeneratorStore';
import { validateRecordsBulk, schemas } from '@/lib/excelValidator';

export default function ExcelDropzone({ schemaType }) {
  const setRecords = useGeneratorStore((state) => state.setRecords);
  const [errors, setErrors] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.name.toLowerCase().endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const lines = text.split('\n').map(l => l.trim()).filter(l => l);
        if (lines.length === 0) return;
        const headers = lines[0].split(',').map(h => h.trim());
        const json = [];
        for (let i = 1; i < lines.length; i++) {
           const values = lines[i].split(',').map(v => v.trim());
           const rowData = {};
           headers.forEach((h, idx) => { rowData[h] = values[idx] || ''; });
           json.push(rowData);
        }
        const validationErrors = validateRecordsBulk(json, schemaType);
        if (validationErrors.length > 0) {
          setErrors(validationErrors);
          setRecords([]);
        } else {
          setErrors([]);
          setRecords(json);
        }
      };
      reader.readAsText(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const buffer = event.target.result;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.worksheets[0];
        
        if (!worksheet) {
          setErrors(["No sheets found in the workbook."]);
          setRecords([]);
          return;
        }

        const json = [];
        let headers = [];
        
        worksheet.eachRow((row, rowNumber) => {
          const rowValues = Array.isArray(row.values) ? row.values.slice(1) : [];
          if (rowNumber === 1) {
            headers = rowValues.map(h => h ? h.toString().trim() : '');
          } else {
            const rowData = {};
            rowValues.forEach((val, idx) => {
               const headerName = headers[idx];
               if (headerName) {
                  let cellValue = val;
                  if (val && typeof val === 'object') {
                      if (val.result !== undefined) cellValue = val.result;
                      else if (val.text !== undefined) cellValue = val.text;
                  }
                  rowData[headerName] = cellValue;
               }
            });
            json.push(rowData);
          }
        });

        const validationErrors = validateRecordsBulk(json, schemaType);
        
        if (validationErrors.length > 0) {
          setErrors(validationErrors);
          setRecords([]);
        } else {
          setErrors([]);
          setRecords(json);
        }
      } catch (err) {
        console.error(err);
        setErrors(["Failed to parse Excel file. Please ensure it is a valid .xlsx file."]);
        setRecords([]);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="p-4 border-2 border-dashed border-gray-300 rounded text-center">
      <input type="file" accept=".xlsx, .csv" onChange={handleFileUpload} className="mb-4" />
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


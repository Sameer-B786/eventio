"use client";
import React, { useState, useEffect } from 'react';
import { useGeneratorStore } from '@/store/useGeneratorStore';

export default function TemplateJsonUploader() {
  const setTemplateJson = useGeneratorStore((state) => state.setTemplateJson);
  const [error, setError] = useState(null);
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_AWS_API_URL; // To be configured by user

  useEffect(() => {
    // Fetch saved templates if API is configured
    if (API_URL) {
      fetch(`${API_URL}/templates`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setSavedTemplates(data);
        })
        .catch(err => console.error("Failed to fetch templates:", err));
    }
  }, [API_URL]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (!json.canvas || !json.elements) {
          throw new Error("Invalid template format. Must contain 'canvas' and 'elements'.");
        }
        setTemplateJson(json);
        setError(null);
      } catch (err) {
        setError(err.message);
        setTemplateJson(null);
      }
    };
    reader.readAsText(file);
  };

  const handleSelectTemplate = async (e) => {
    const s3Key = e.target.value;
    if (!s3Key) return;
    
    // In a real scenario, you'd fetch the JSON content from S3 using the key or a presigned GET URL.
    // Assuming the template JSON is stored in the DB item or S3. 
    // We will leave a placeholder for loading it from S3.
    alert(`Selected template: ${s3Key}. In production, this will download the JSON from S3 and load it.`);
  };

  return (
    <div className="p-4 border-2 border-dashed border-gray-300 rounded text-center space-y-4 flex flex-col items-center">
      
      {savedTemplates.length > 0 && (
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">Choose an existing template:</label>
          <select onChange={handleSelectTemplate} className="w-full p-2 border border-gray-300 rounded text-sm">
            <option value="">-- Select Template --</option>
            {savedTemplates.map(tpl => (
              <option key={tpl.templateId} value={tpl.s3Key}>{tpl.name}</option>
            ))}
          </select>
          <div className="my-3 text-gray-400 text-sm">- OR -</div>
        </div>
      )}

      <div>
        <input type="file" accept=".json" onChange={handleFileUpload} className="mb-2 text-sm" />
        <p className="text-gray-500 text-xs">Upload a new JSON Canvas Template</p>
      </div>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}


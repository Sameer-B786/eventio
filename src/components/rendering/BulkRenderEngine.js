"use client";
import React, { useState, useEffect } from 'react';
import { useGeneratorStore } from '@/store/useGeneratorStore';

export default function BulkRenderEngine() {
  const records = useGeneratorStore((state) => state.records);
  const templateJson = useGeneratorStore((state) => state.templateJson);
  const isGenerating = useGeneratorStore((state) => state.isGenerating);
  const setIsGenerating = useGeneratorStore((state) => state.setIsGenerating);
  
  const [status, setStatus] = useState(null); // PENDING, PROCESSING, COMPLETED, FAILED
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [jobId, setJobId] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_AWS_API_URL;

  // Polling effect
  useEffect(() => {
    let interval;
    if (jobId && (status === 'PENDING' || status === 'PROCESSING')) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`${API_URL}/status/${jobId}`);
          if (res.ok) {
            const data = await res.json();
            setStatus(data.status);
            if (data.status === 'COMPLETED') {
              setDownloadUrl(data.outputUrl);
              setIsGenerating(false);
            } else if (data.status === 'FAILED') {
              setIsGenerating(false);
              alert("Backend generation failed.");
            }
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 3000); // Poll every 3 seconds
    }
    return () => clearInterval(interval);
  }, [jobId, status, API_URL, setIsGenerating]);

  const executeBatchGeneration = async () => {
    if (!API_URL) {
      alert("AWS API URL is not configured. Please set NEXT_PUBLIC_AWS_API_URL.");
      return;
    }
    if (!records || records.length === 0 || !templateJson) return;

    setIsGenerating(true);
    setStatus('STARTING UPLOAD...');
    setDownloadUrl(null);

    try {
      // 1. Convert data to Blobs
      // (Using papa parse internally or just JSON stringify for now. The backend expects CSV or JSON, we will upload JSON for simplicity if it handles it, but backend uses Papa.parse, so let's convert to CSV string)
      const csvContent = [Object.keys(records[0]).join(",")].concat(records.map(r => Object.values(r).join(","))).join("\n");
      const csvBlob = new Blob([csvContent], { type: 'text/csv' });
      const jsonBlob = new Blob([JSON.stringify(templateJson)], { type: 'application/json' });

      // 2. Get Presigned URLs
      const resCsv = await fetch(`${API_URL}/upload-url`, {
        method: 'POST', body: JSON.stringify({ fileName: 'data.csv', contentType: 'text/csv' })
      }).then(r => r.json());
      
      const resJson = await fetch(`${API_URL}/upload-url`, {
        method: 'POST', body: JSON.stringify({ fileName: 'template.json', contentType: 'application/json' })
      }).then(r => r.json());

      // 3. Upload to S3
      setStatus('UPLOADING TO S3...');
      await fetch(resCsv.uploadUrl, { method: 'PUT', body: csvBlob, headers: { 'Content-Type': 'text/csv' }});
      await fetch(resJson.uploadUrl, { method: 'PUT', body: jsonBlob, headers: { 'Content-Type': 'application/json' }});

      // 4. Trigger Generation Job
      setStatus('QUEUING JOB...');
      const genRes = await fetch(`${API_URL}/generate`, {
        method: 'POST',
        body: JSON.stringify({
          csvKey: resCsv.key,
          templateKey: resJson.key,
          schemaType: window.location.pathname.includes('event-pass') ? 'eventpass' : 'idcard'
        })
      }).then(r => r.json());

      setJobId(genRes.jobId);
      setStatus(genRes.status); // Should be PENDING

    } catch (err) {
      console.error("Error during cloud generation", err);
      alert("Failed to start cloud generation.");
      setIsGenerating(false);
      setStatus(null);
    }
  };

  if (!records || records.length === 0 || !templateJson) {
      return null;
  }

  return (
    <div className="p-6 border border-gray-100 rounded-xl bg-gray-50 flex flex-col items-center">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Cloud Generation</h3>
      <p className="mb-6 text-gray-600">{records.length} records ready to be processed via AWS.</p>
      
      {isGenerating ? (
        <div className="w-full max-w-md text-center">
           <div className="animate-pulse bg-indigo-100 text-indigo-800 px-4 py-2 rounded-lg font-bold">
             Status: {status}
           </div>
           <p className="text-xs text-gray-500 mt-2">Please wait, your job is running in the cloud...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          {downloadUrl && (
             <a href={downloadUrl} download className="px-6 py-2 bg-green-500 text-white font-bold rounded-lg shadow hover:bg-green-600 transition-all text-center w-full">
               ⬇️ Download ZIP Archive
             </a>
          )}
          <button 
            onClick={executeBatchGeneration}
            className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-full shadow hover:bg-indigo-700 hover:shadow-lg transition-all"
          >
            {downloadUrl ? 'Generate Again' : 'Generate via AWS'}
          </button>
        </div>
      )}
    </div>
  );
}




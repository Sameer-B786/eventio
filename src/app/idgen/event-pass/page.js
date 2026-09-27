"use client";
import React from 'react';
import dynamic from 'next/dynamic';
import ExcelDropzone from '@/components/upload/ExcelDropzone';
import TemplateJsonUploader from '@/components/upload/TemplateJsonUploader';
import BulkRenderEngine from '@/components/rendering/BulkRenderEngine';
import { useGeneratorStore } from '@/store/useGeneratorStore';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

// SSR Guard for Konva
const KonvaPreviewStage = dynamic(
  () => import('@/components/canvas/KonvaPreviewStage'),
  { ssr: false }
);

export default function EventPassGeneratorPage() {
  const router = useRouter();
  const schemaType = 'eventpass';
  const templateJson = useGeneratorStore((state) => state.templateJson);
  const records = useGeneratorStore((state) => state.records);

  const [myEvents, setMyEvents] = React.useState([]);
  const [selectedEventId, setSelectedEventId] = React.useState("standalone");

  React.useEffect(() => {
    fetch('/api/events')
      .then(res => res.ok ? res.json() : [])
      .then(events => setMyEvents(events))
      .catch(console.error);
  }, []);

  const previewRecord = records?.[0] || null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <button 
          onClick={() => router.back()} 
          className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors shadow-sm text-gray-600"
          title="Go Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Event Pass Generation</h1>
          <p className="text-gray-500">Upload attendee data and design template to generate passes.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Left Column: Setup */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800">1. Link Target Event (Optional)</h2>
              <p className="text-sm text-gray-500 mb-2">Choose an event to link these passes to, or generate standalone.</p>
              <select 
                className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
              >
                <option value="standalone">-- Standalone Generation (No Event) --</option>
                {myEvents.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.name} (Host: {ev.hostedBy})</option>
                ))}
              </select>
              {myEvents.length === 0 && <p className="text-xs text-gray-500 mt-2">You can generate passes independently, or create an event to link them.</p>}
            </div>

            <div className="border-t pt-6">
              <h2 className="text-lg font-bold text-gray-800">2. Data & Template Setup</h2>
              <p className="text-sm text-gray-500 mb-4">Upload your attendees and design</p>
              <div className="flex flex-col gap-6">
                <ExcelDropzone schemaType={schemaType} />
                <TemplateJsonUploader />
              </div>
            </div>
            
            <div className="border-t pt-6 mt-2">
              <h2 className="text-lg font-bold text-gray-800 mb-4">3. Generate</h2>
              <BulkRenderEngine />
            </div>
          </div>
        </div>

        {/* Right Column: Preview */}
        <div className="w-full lg:w-2/3 flex flex-col">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col">
            <h2 className="text-lg font-bold mb-4 text-gray-800">Live Preview</h2>
            <div className="flex-1 flex items-center justify-center bg-gray-50 p-4 border border-gray-200 rounded-xl overflow-auto min-h-[500px]">
              {templateJson ? (
                <KonvaPreviewStage templateJson={templateJson} record={previewRecord} />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 h-full w-full min-h-[300px]">
                   <p>Upload a JSON template to see preview</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

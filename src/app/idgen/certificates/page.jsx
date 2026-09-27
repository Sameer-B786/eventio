"use client";

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import JSZip from "jszip";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileSpreadsheet, FileJson, Download, Eye, Loader2, Calendar } from "lucide-react";

export default function BulkCertificatesPage() {
  const [data, setData] = useState([]);
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  
  const [myEvents, setMyEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");

  useEffect(() => {
    fetch('/api/events') // This correctly returns only events where user is host or volunteer
      .then(res => res.ok ? res.json() : [])
      .then(events => setMyEvents(events))
      .catch(console.error);
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const parsedData = XLSX.utils.sheet_to_json(ws);
      setData(parsedData);
      if (parsedData.length > 0) setPreviewData(parsedData[0]);
    };
    reader.readAsBinaryString(file);
  };

  const handleTemplateUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = JSON.parse(evt.target.result);
        setTemplate(json);
      } catch (err) {
        alert("Invalid JSON format");
      }
    };
    reader.readAsText(file);
  };

  const generateCertificates = async () => {
    if (!template || data.length === 0) return;
    setLoading(true);
    
    try {
      const zip = new JSZip();
      
      // In a real application, you would render each certificate to a canvas 
      // using Konva in the background, convert to blob, and add to zip.
      // For this implementation we will generate basic text files or mock images 
      // if Konva headless rendering isn't set up yet.
      
      for (let i = 0; i < data.length; i++) {
        const participant = data[i];
        const name = participant.Name || participant.name || "Participant";
        const team = participant.Team || participant.team || "";
        
        // Mock generation - we would use a hidden canvas here
        const certContent = JSON.stringify({
          ...template,
          participantName: name,
          teamName: team,
        }, null, 2);
        
        zip.file(`${name.replace(/\s+/g, '_')}_certificate.json`, certContent);
      }

      const content = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = "certificates.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error(err);
      alert("Failed to generate certificates");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-1/3 flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Bulk Certificates</CardTitle>
            <CardDescription>Upload participant data and a JSON template to generate certificates for your event.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="space-y-2">
              <Label htmlFor="event-select" className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-600" /> Select Target Event
              </Label>
              <select 
                id="event-select"
                className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
              >
                <option value="" disabled>-- Select an event --</option>
                {myEvents.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.name} (Host: {ev.hostedBy})</option>
                ))}
              </select>
              {myEvents.length === 0 && <p className="text-xs text-red-500">You are not a host or volunteer for any active events.</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="data-upload" className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-green-600" /> Excel / CSV Data
              </Label>
              <Input id="data-upload" type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={handleFileUpload} />
              {data.length > 0 && <p className="text-xs text-gray-500 mt-1">{data.length} records loaded.</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-upload" className="flex items-center gap-2">
                <FileJson className="h-4 w-4 text-blue-600" /> JSON Template
              </Label>
              <Input id="template-upload" type="file" accept=".json" onChange={handleTemplateUpload} />
              {template && <p className="text-xs text-gray-500 mt-1">Template loaded successfully.</p>}
            </div>

            <Button 
              className="w-full bg-indigo-600 hover:bg-indigo-700" 
              disabled={!selectedEventId || data.length === 0 || !template || loading}
              onClick={generateCertificates}
            >
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : <><Download className="w-4 h-4 mr-2" /> Generate ZIP</>}
            </Button>

          </CardContent>
        </Card>
      </div>

      <div className="w-full md:w-2/3">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2"><Eye className="h-5 w-5" /> Live Preview</CardTitle>
            <CardDescription>Previewing first record from the uploaded data</CardDescription>
          </CardHeader>
          <CardContent className="bg-gray-50 m-4 rounded-xl border flex items-center justify-center min-h-[400px]">
             {!template || !previewData ? (
               <div className="text-gray-400 text-sm text-center">
                 Upload both data and template to see preview
               </div>
             ) : (
               <div className="relative bg-white shadow-lg border p-8 w-[600px] h-[400px] flex flex-col items-center justify-center text-center space-y-6">
                 {/* This would ideally be rendered by React-Konva using the template schema */}
                 <h2 className="text-3xl font-serif text-gray-800">Certificate of Participation</h2>
                 <p className="text-gray-500">This is proudly presented to</p>
                 <h1 className="text-5xl font-bold text-indigo-700 font-serif">
                   {previewData.Name || previewData.name || "Participant Name"}
                 </h1>
                 {(previewData.Team || previewData.team) && (
                   <h3 className="text-xl text-gray-600">Team: {previewData.Team || previewData.team}</h3>
                 )}
                 <div className="mt-8 text-xs text-gray-400 border-t pt-4 w-full">
                   (Preview rendered from generic template styles)
                 </div>
               </div>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Calendar, Image as ImageIcon, Users, Type, AlignLeft } from "lucide-react";

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    hostedBy: "",
    startTime: "",
    endTime: "",
  });
  const [bannerFile, setBannerFile] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setBannerFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Upload Banner (In a real app, this goes to S3 and returns a URL. We will mock the URL for now)
      // const formDataToUpload = new FormData();
      // formDataToUpload.append("file", bannerFile);
      // const uploadRes = await fetch('/api/upload', { method: 'POST', body: formDataToUpload });
      // const { bannerUrl } = await uploadRes.json();
      
      const bannerUrl = bannerFile ? URL.createObjectURL(bannerFile) : "https://via.placeholder.com/800x400";

      // 2. Save Event to DB
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          bannerUrl,
        }),
      });

      if (!res.ok) throw new Error("Failed to create event");
      const { eventId } = await res.json();

      // 3. Redirect to workspace
      router.push(`/idgen/workspace/${eventId}`);
    } catch (error) {
      console.error(error);
      alert("Failed to create event.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create New Event Workspace</CardTitle>
          <CardDescription>Fill out the details below to initialize a dedicated workspace for your event.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <Type className="h-4 w-4 text-gray-500" /> Event Name
              </Label>
              <Input id="name" name="name" required placeholder="e.g., Annual Tech Conference 2026" value={formData.name} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="banner" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-gray-500" /> Event Banner
              </Label>
              <Input id="banner" name="banner" type="file" accept="image/*" onChange={handleFileChange} className="cursor-pointer" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-2">
                <AlignLeft className="h-4 w-4 text-gray-500" /> Description
              </Label>
              <textarea 
                id="description" 
                name="description" 
                required 
                placeholder="What is this event about?" 
                value={formData.description} 
                onChange={handleChange}
                className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hostedBy" className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" /> Hosted By
              </Label>
              <Input id="hostedBy" name="hostedBy" required placeholder="Organization or Individual Name" value={formData.hostedBy} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" /> Start Date & Time
                </Label>
                <Input id="startTime" name="startTime" type="datetime-local" required value={formData.startTime} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" /> End Date & Time
                </Label>
                <Input id="endTime" name="endTime" type="datetime-local" required value={formData.endTime} onChange={handleChange} />
              </div>
            </div>

          </CardContent>
          <CardFooter className="flex justify-end bg-gray-50/50 py-4 mt-6 border-t rounded-b-xl">
            <Button type="submit" disabled={loading} className="w-full md:w-auto">
              {loading ? "Creating..." : "Create Workspace"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

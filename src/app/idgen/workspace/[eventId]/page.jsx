"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Users, Info, Clock, AlertTriangle } from "lucide-react";
import ChatRoom from "./ChatRoom";
import PollsPanel from "./PollsPanel";
import { useWorkspaceWebSocket } from "@/hooks/useWorkspaceWebSocket";

export default function EventWorkspacePage({ params }) {
  const resolvedParams = use(params);
  const { eventId } = resolvedParams;
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEventActive, setIsEventActive] = useState(false);
  
  // Custom hook that manages real-time state via AWS API Gateway WebSockets
  const { messages, polls } = useWorkspaceWebSocket(eventId);

  const checkActive = (data) => {
    const now = new Date();
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    setIsEventActive(now >= start && now <= end);
  };

  useEffect(() => {
    // In a real app, we fetch from /api/events/[eventId]
    // For demo/prototype purposes we mock the response if the fetch fails
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${eventId}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setEventData(data);
        checkActive(data);
      } catch (err) {
        console.warn("Using mock event data for demo purposes");
        const mockData = {
          id: eventId,
          name: "Sample Tech Event Workspace",
          description: "A space to interact dynamically.",
          hostedBy: "Eventio Admin",
          bannerUrl: "https://via.placeholder.com/800x200",
          startTime: new Date(Date.now() - 3600000).toISOString(),
          endTime: new Date(Date.now() + 7200000).toISOString(),
        };
        setEventData(mockData);
        checkActive(mockData);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);
  if (loading) return <div className="p-8 text-center text-gray-500">Loading Workspace...</div>;

  return (
    <div className="flex h-[calc(100vh-2rem)] flex-col md:flex-row gap-4 bg-gray-50">
      
      {/* Main Area - Event Info & Chat */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        
        {/* Event Info Header */}
        <Card className="p-0 overflow-hidden shadow-sm flex flex-col shrink-0">
          <div className="h-28 md:h-36 bg-cover bg-center relative" style={{ backgroundImage: `url(${eventData.bannerUrl})` }}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 p-4 text-white">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">{eventData.name}</h2>
                {isEventActive && (
                  <span className="bg-green-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                    Live Now
                  </span>
                )}
              </div>
              <p className="text-sm opacity-90 flex items-center gap-1 mt-1">
                <Users className="h-4 w-4" /> Hosted by {eventData.hostedBy}
              </p>
            </div>
          </div>
          
          <div className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white">
            <div className="flex-1">
              <h3 className="font-medium text-sm flex items-center gap-1 mb-1 text-gray-800"><Info className="h-4 w-4" /> Description</h3>
              <p className="text-sm text-gray-600">{eventData.description}</p>
            </div>
            
            <div className={`p-3 rounded-lg border flex items-center gap-3 shrink-0 ${isEventActive ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
              {isEventActive ? <Clock className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
              <div className="text-sm">
                <p className="font-semibold leading-tight">{isEventActive ? "Workspace Active" : "Workspace Inactive"}</p>
                <p className="opacity-90 text-xs mt-0.5">
                  {isEventActive ? `Closes at ${new Date(eventData.endTime).toLocaleString()}` : 'The event is closed.'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Real-time Chat */}
        <Card className="flex-1 flex flex-col overflow-hidden shadow-sm min-h-0">
           <ChatRoom eventId={eventId} isActive={isEventActive} messages={messages} />
        </Card>
      </div>

      {/* Right Sidebar - Polls */}
      <div className="w-full md:w-80 lg:w-96 flex flex-col shrink-0">
        <Card className="flex-1 flex flex-col overflow-hidden shadow-sm p-4">
          <PollsPanel eventId={eventId} isActive={isEventActive} polls={polls} />
        </Card>
      </div>

    </div>
  );
}

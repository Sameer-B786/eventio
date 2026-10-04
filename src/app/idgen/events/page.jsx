"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, ArrowRight } from "lucide-react";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch('/api/events/all', { cache: 'no-store', next: { revalidate: 0 } });
        if (res.ok) {
          const data = await res.json();
          // Sort events by start time
          data.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
          setEvents(data);
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-500 mt-1">Discover live and upcoming events</p>
        </div>
        <Link href="/idgen/events/new">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">Create Event</Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No events found</h2>
          <p className="text-gray-500 mb-6">There are currently no live or upcoming events.</p>
          <Link href="/idgen/events/new">
            <Button variant="outline">Create your first event</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const isLive = new Date() >= new Date(event.startTime) && (!event.endTime || new Date() <= new Date(event.endTime));
            
            return (
              <Card key={event.id} className="flex flex-col overflow-hidden hover:shadow-md transition-shadow">
                {event.bannerUrl && (
                  <div className="h-48 w-full relative bg-gray-100">
                    <img 
                      src={event.bannerUrl} 
                      alt={event.name} 
                      className="w-full h-full object-cover"
                    />
                    {isLive && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse flex items-center gap-1 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-white"></span> Live
                      </div>
                    )}
                  </div>
                )}
                <CardHeader className={!event.bannerUrl ? "pt-6" : "pt-4"}>
                  {!event.bannerUrl && isLive && (
                     <div className="mb-2 self-start bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 border border-red-100 shadow-sm">
                       <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span> Live
                     </div>
                  )}
                  <CardTitle className="line-clamp-1">{event.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 text-xs mt-1">
                    <Users className="h-3 w-3" /> {event.hostedBy || "Unknown Organizer"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                    {event.description || "No description provided."}
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    {event.startTime && (
                      <div className="flex items-start gap-2 text-gray-600">
                        <Calendar className="h-4 w-4 mt-0.5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">Starts</p>
                          <p className="text-xs">
                            {new Date(event.startTime).toLocaleString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: 'numeric',
                                hour12: true
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50/50 pt-4 border-t">
                  <Link href={`/idgen/workspace/${event.id}`} className="w-full">
                    <Button variant="outline" className="w-full justify-between hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200">
                      View Workspace <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

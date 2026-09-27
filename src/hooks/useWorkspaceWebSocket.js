"use client";
import { useEffect, useRef, useState } from "react";

export function useWorkspaceWebSocket(eventId) {
  const [messages, setMessages] = useState([]);
  const [polls, setPolls] = useState([]);
  const wsRef = useRef(null);

  useEffect(() => {
    // 1. Fetch initial states
    fetch(`/api/events/${eventId}/messages`).then(r => r.json()).then(setMessages).catch(() => {});
    fetch(`/api/events/${eventId}/polls`).then(r => r.json()).then(setPolls).catch(() => {});

    const WSS_URL = process.env.NEXT_PUBLIC_AWS_WSS_URL;
    if (!WSS_URL) {
      console.warn("NEXT_PUBLIC_AWS_WSS_URL is missing. Falling back to 3-second polling for real-time updates.");
      
      const pollInterval = setInterval(() => {
        fetch(`/api/events/${eventId}/messages`).then(r => r.json()).then(setMessages).catch(() => {});
        fetch(`/api/events/${eventId}/polls`).then(r => r.json()).then(setPolls).catch(() => {});
      }, 3000);

      return () => clearInterval(pollInterval);
    }

    // Connect to AWS API Gateway WebSocket, passing eventId so Lambda can map it
    const ws = new WebSocket(`${WSS_URL}?eventId=${eventId}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const { event: eventType, data } = JSON.parse(event.data);
        
        if (eventType === "new-message") {
          setMessages(prev => [...prev, data]);
        } else if (eventType === "new-poll") {
          setPolls(prev => [data, ...prev]);
        } else if (eventType === "poll-vote") {
          setPolls(prev => prev.map(p => p.id === data.id ? data : p));
        }
      } catch (err) {
        console.error("WS Message Error", err);
      }
    };

    return () => {
      ws.close();
    };
  }, [eventId]);

  return { messages, polls };
}

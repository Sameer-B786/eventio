"use client";
import { useEffect, useRef, useState } from "react";

export function useWorkspaceWebSocket(eventId) {
  const [messages, setMessages] = useState([]);
  const [polls, setPolls] = useState([]);
  const wsRef = useRef(null);

  useEffect(() => {
    // Helper to fetch latest data to guarantee sync
    const fetchUpdates = () => {
      fetch(`/api/events/${eventId}/messages?t=${Date.now()}`, { cache: 'no-store' })
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) setMessages(data);
        }).catch(() => {});
        
      fetch(`/api/events/${eventId}/polls?t=${Date.now()}`, { cache: 'no-store' })
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) setPolls(data);
        }).catch(() => {});
    };

    // 1. Fetch initial states
    fetchUpdates();

    // 2. Setup robust fallback polling every 3 seconds (guarantees updates even if WS drops)
    const pollInterval = setInterval(fetchUpdates, 3000);

    const WSS_URL = process.env.NEXT_PUBLIC_AWS_WSS_URL;
    let ws;
    let isMounted = true;

    if (WSS_URL) {
      // 3. Connect to AWS API Gateway WebSocket with reconnect logic
      const connectWs = () => {
        if (!isMounted) return;
        ws = new WebSocket(`${WSS_URL}?eventId=${eventId}`);
        wsRef.current = ws;

        ws.onmessage = (event) => {
          try {
            const { event: eventType, data } = JSON.parse(event.data);
            
            if (eventType === "new-message") {
              setMessages(prev => {
                // Deduplicate to avoid flashes if polling caught it first
                if (prev.some(m => m.id === data.id)) return prev;
                return [...prev, data];
              });
            } else if (eventType === "new-poll") {
              setPolls(prev => {
                if (prev.some(p => p.id === data.id)) return prev;
                return [data, ...prev];
              });
            } else if (eventType === "poll-vote") {
              setPolls(prev => prev.map(p => p.id === data.id ? data : p));
            }
          } catch (err) {
            console.error("WS Message Error", err);
          }
        };

        ws.onclose = () => {
          // Reconnect automatically if connection drops
          if (isMounted) setTimeout(connectWs, 3000);
        };
      };
      
      connectWs();
    }

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      if (ws) {
        ws.onclose = null; // Prevent reconnect loop on unmount
        ws.close();
      }
    };
  }, [eventId]);

  return { messages, polls };
}

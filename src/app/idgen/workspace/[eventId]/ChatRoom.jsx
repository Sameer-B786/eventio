"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

// Helper to convert URLs in text to clickable links
const linkify = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.split(urlRegex).map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">
          {part}
        </a>
      );
    }
    return part;
  });
};

export default function ChatRoom({ eventId, isActive, messages }) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!input.trim() || !isActive) return;

    const messageContent = input;
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Optimistic UI update could go here, but for simplicity we rely on Pusher event
    await fetch(`/api/events/${eventId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "user-123", // In real app, get from auth session
        userName: "Attendee", 
        content: messageContent,
      }),
    });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="border-b p-4">
        <h3 className="font-semibold text-gray-800">Event Chat</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-10 text-sm">No messages yet. Say hello!</div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className="flex flex-col">
              <span className="text-xs text-gray-500 font-medium mb-1">{msg.userName}</span>
              <div className="bg-purple-100 text-purple-900 rounded-2xl rounded-tl-sm px-4 py-2 text-sm w-fit max-w-[85%] shadow-sm">
                {linkify(msg.content)}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-3 border-t bg-white flex items-end gap-2 shrink-0">
        <textarea
          ref={textareaRef}
          disabled={!isActive}
          placeholder={isActive ? "Type a message or drop a link... (Shift+Enter for new line)" : "Workspace closed"}
          className="flex-1 px-4 py-3 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 resize-none max-h-32 min-h-[44px] overflow-y-auto leading-relaxed [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          value={input}
          rows={1}
          onChange={(e) => {
            setInput(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`; // Max height of 128px
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage(e);
            }
          }}
        />
        <Button disabled={!isActive || !input.trim()} type="submit" size="icon" className="rounded-full bg-purple-600 hover:bg-purple-700 h-11 w-11 shrink-0 mb-0.5">
          <Send className="h-5 w-5 ml-0.5" />
        </Button>
      </form>
    </div>
  );
}

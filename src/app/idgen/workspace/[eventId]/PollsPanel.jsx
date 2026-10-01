"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BarChart2, Plus } from "lucide-react";

export default function PollsPanel({ eventId, isActive, polls, isHost }) {
  const [isCreating, setIsCreating] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    const validOptions = options.filter(o => o.trim());
    if (!newQuestion.trim() || validOptions.length < 2) return;

    await fetch(`/api/events/${eventId}/polls`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: newQuestion, options: validOptions }),
    });

    setIsCreating(false);
    setNewQuestion("");
    setOptions(["", ""]);
  };

  const handleVote = async (pollId, optionIndex) => {
    if (!isActive) return;
    await fetch(`/api/events/${eventId}/polls/${pollId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ optionIndex }),
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b pb-4 mb-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-purple-600" /> Live Polls
        </h3>
        {isActive && isHost && (
          <Button variant="ghost" size="icon" onClick={() => setIsCreating(!isCreating)} className="h-8 w-8 text-purple-600 hover:bg-purple-50 rounded-full">
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        {isCreating && (
          <form onSubmit={handleCreatePoll} className="bg-purple-50 p-3 rounded-lg border border-purple-100 space-y-3">
            <input 
              placeholder="Ask a question..." 
              className="w-full text-sm p-2 border rounded-md"
              value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} required
            />
            {options.map((opt, i) => (
              <input 
                key={i} placeholder={`Option ${i+1}`} className="w-full text-sm p-2 border rounded-md"
                value={opt} onChange={(e) => {
                  const newOpts = [...options];
                  newOpts[i] = e.target.value;
                  setOptions(newOpts);
                }} required={i < 2}
              />
            ))}
            <Button type="button" variant="link" size="sm" onClick={() => setOptions([...options, ""])} className="text-xs px-0 h-auto">
              + Add Option
            </Button>
            <div className="flex gap-2">
              <Button type="submit" size="sm" className="w-full bg-purple-600 hover:bg-purple-700">Create</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsCreating(false)}>Cancel</Button>
            </div>
          </form>
        )}

        {polls.length === 0 && !isCreating && (
          <div className="text-center text-sm text-gray-500 mt-10">No active polls.</div>
        )}

        {polls.map((poll) => {
          const totalVotes = poll.options.reduce((sum, opt) => sum + (opt.votes || 0), 0);
          return (
            <div key={poll.id} className="border rounded-xl p-4 bg-white shadow-sm space-y-3">
              <h4 className="font-medium text-gray-900 text-sm leading-tight">{poll.question}</h4>
              <div className="space-y-2">
                {poll.options.map((opt, idx) => {
                  const percent = totalVotes > 0 ? Math.round(((opt.votes || 0) / totalVotes) * 100) : 0;
                  return (
                    <button
                      key={idx}
                      disabled={!isActive}
                      onClick={() => handleVote(poll.id, idx)}
                      className="w-full relative text-left overflow-hidden border rounded-lg p-2 text-sm hover:border-purple-300 transition-colors group disabled:cursor-default disabled:hover:border-gray-200"
                    >
                      <div className="absolute left-0 top-0 bottom-0 bg-purple-100 -z-10 transition-all duration-500" style={{ width: `${percent}%` }} />
                      <div className="flex justify-between items-center z-10">
                        <span className="font-medium text-gray-700">{opt.text}</span>
                        <span className="text-xs font-semibold text-purple-700">{percent}%</span>
                      </div>
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-gray-400 text-right">{totalVotes} votes</p>
            </div>
          )
        })}
      </div>
    </div>
  );
}

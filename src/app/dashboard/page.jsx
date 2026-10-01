import React from 'react';
import Link from 'next/link';
import { Calendar, Plus, Home } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your events, ID cards, and workspaces.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <Link href="/idgen/events/new" className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-indigo-300 hover:shadow-md transition-all flex items-center gap-4 group">
             <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
               <Plus className="w-6 h-6" />
             </div>
             <div>
               <h3 className="font-semibold text-gray-900">Create New Event</h3>
               <p className="text-sm text-gray-500">Initialize a new workspace</p>
             </div>
           </Link>

           <Link href="/idgen" className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all flex items-center gap-4 group">
             <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
               <Home className="w-6 h-6" />
             </div>
             <div>
               <h3 className="font-semibold text-gray-900">Eventio Hub</h3>
               <p className="text-sm text-gray-500">Explore generators and public events</p>
             </div>
           </Link>
        </div>
      </div>
    </div>
  );
}

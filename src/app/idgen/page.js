"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BadgeCheck, Ticket, ArrowLeft, Users, GraduationCap, Building2, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function EventioWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [purpose, setPurpose] = useState(null);

  const handlePurposeSelect = (selectedPurpose) => {
    setPurpose(selectedPurpose);
    if (selectedPurpose === 'event-pass') {
      router.push('/idgen/event-pass');
    } else {
      setStep(2);
    }
  };

  const handleAudienceSelect = (selectedAudience) => {
    router.push(`/idgen/id-card?schema=${selectedAudience}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="max-w-5xl w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 text-center relative overflow-hidden">
          
          <button
            onClick={() => router.push('/idgen/events/new')}
            className="absolute top-6 right-6 md:top-8 md:right-8 flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-full transition-colors z-10"
          >
            Move to Dashboard
          </button>

          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

              
              <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 text-indigo-600 mt-8 md:mt-0">
                <BadgeCheck className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">What are you looking for?</h1>
              <p className="text-gray-500 mb-10 text-lg">Select the type of credentials or spaces you need to create.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button 
                  onClick={() => handlePurposeSelect('id-card')}
                  className="flex flex-col items-center justify-center text-center p-8 bg-white border-2 border-gray-100 hover:border-indigo-500 hover:bg-indigo-50 hover:shadow-md rounded-2xl transition-all group h-full"
                >
                  <div className="group-hover:scale-110 transition-transform w-full flex justify-center">
                    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 mb-6 drop-shadow-sm mx-auto">
                      <rect x="25" y="15" width="50" height="70" rx="6" fill="#FFF7ED" stroke="#EA580C" strokeWidth="4" />
                      <rect x="40" y="5" width="20" height="10" rx="3" fill="#EA580C" />
                      <circle cx="50" cy="40" r="12" fill="#FFEDD5" stroke="#EA580C" strokeWidth="4" />
                      <path d="M34 65C34 56 42 53 50 53C58 53 66 56 66 65" stroke="#EA580C" strokeWidth="4" strokeLinecap="round" />
                      <rect x="35" y="72" width="30" height="4" rx="2" fill="#FDBA74" />
                      <rect x="35" y="80" width="20" height="4" rx="2" fill="#FDBA74" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Educational ID Cards</h2>
                  <p className="text-sm text-gray-500 leading-relaxed">For students, faculty, and staff members.</p>
                </button>
                
                <button 
                  onClick={() => handlePurposeSelect('event-pass')}
                  className="flex flex-col items-center justify-center text-center p-8 bg-white border-2 border-gray-100 hover:border-purple-500 hover:bg-purple-50 hover:shadow-md rounded-2xl transition-all group h-full"
                >
                  <div className="group-hover:scale-110 transition-transform w-full flex justify-center">
                    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 mb-6 drop-shadow-sm mx-auto">
                      <rect x="15" y="25" width="70" height="50" rx="6" fill="#F3E8FF" stroke="#9333EA" strokeWidth="4" />
                      <circle cx="15" cy="50" r="8" fill="white" stroke="#9333EA" strokeWidth="4" />
                      <circle cx="85" cy="50" r="8" fill="white" stroke="#9333EA" strokeWidth="4" />
                      <path d="M35 25v50M65 25v50" stroke="#9333EA" strokeWidth="4" strokeDasharray="6 6" />
                      <rect x="42" y="45" width="16" height="10" rx="2" fill="#D8B4FE" />
                      <path d="M42 35h16" stroke="#D8B4FE" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Event Passes</h2>
                  <p className="text-sm text-gray-500 leading-relaxed">For event attendees, hosts, and volunteers.</p>
                </button>

                <button 
                  onClick={() => router.push('/idgen/events/new')}
                  className="flex flex-col items-center justify-center text-center p-8 bg-white border-2 border-gray-100 hover:border-pink-500 hover:bg-pink-50 hover:shadow-md rounded-2xl transition-all group h-full"
                >
                  <div className="group-hover:scale-110 transition-transform w-full flex justify-center">
                    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 mb-6 drop-shadow-sm mx-auto">
                      <rect x="15" y="20" width="70" height="60" rx="8" fill="#FCE7F3" stroke="#EC4899" strokeWidth="4" />
                      <rect x="25" y="35" width="50" height="30" rx="4" fill="#FBCFE8" />
                      <circle cx="35" cy="50" r="4" fill="#EC4899" />
                      <circle cx="50" cy="50" r="4" fill="#EC4899" />
                      <circle cx="65" cy="50" r="4" fill="#EC4899" />
                      <path d="M40 80L50 90L60 80" stroke="#EC4899" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Event Workspaces</h2>
                  <p className="text-sm text-gray-500 leading-relaxed">Create and manage real-time event spaces.</p>
                </button>

                <button 
                  onClick={() => router.push('/idgen/certificates')}
                  className="flex flex-col items-center justify-center text-center p-8 bg-white border-2 border-gray-100 hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-md rounded-2xl transition-all group h-full"
                >
                  <div className="group-hover:scale-110 transition-transform">
                    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 mb-6 drop-shadow-sm mx-auto">
                      <rect x="20" y="20" width="60" height="60" rx="4" fill="#D1FAE5" stroke="#10B981" strokeWidth="4" />
                      <path d="M40 50L50 60L70 40" stroke="#10B981" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M30 40H30.01" stroke="#10B981" strokeWidth="6" strokeLinecap="round" />
                      <circle cx="50" cy="50" r="28" stroke="#10B981" strokeWidth="2" strokeDasharray="4 4" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Bulk Certificates</h2>
                  <p className="text-sm text-gray-500 leading-relaxed">Auto-generate certificates from CSV/Excel data.</p>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <button 
                onClick={() => setStep(1)} 
                className="absolute top-8 left-8 flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </button>
              
              <div className="mx-auto w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600 mt-8 md:mt-0">
                <Users className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">Who are these ID cards for?</h1>
              <p className="text-gray-500 mb-10 text-lg">This helps us apply the correct strict validation rules for your data.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button 
                  onClick={() => handleAudienceSelect('k12')}
                  className="flex flex-col items-center p-6 bg-white border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 hover:shadow-sm rounded-xl transition-all group"
                >
                  <GraduationCap className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
                  <h2 className="text-md font-semibold text-gray-900">K-12 Students</h2>
                </button>
                <button 
                  onClick={() => handleAudienceSelect('ugpg')}
                  className="flex flex-col items-center p-6 bg-white border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 hover:shadow-sm rounded-xl transition-all group"
                >
                  <Building2 className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
                  <h2 className="text-md font-semibold text-gray-900">UG / PG Students</h2>
                </button>
                <button 
                  onClick={() => handleAudienceSelect('faculty')}
                  className="flex flex-col items-center p-6 bg-white border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 hover:shadow-sm rounded-xl transition-all group"
                >
                  <Users className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
                  <h2 className="text-md font-semibold text-gray-900">Faculty & Staff</h2>
                </button>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}

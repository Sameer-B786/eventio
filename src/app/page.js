"use client";

import Link from "next/link";
import { ArrowRight, Fingerprint, CalendarPlus, BadgeCheck, FileSpreadsheet, Users, ShieldCheck, Zap, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-2xl text-indigo-900 tracking-tight">
            <Fingerprint className="h-8 w-8 text-indigo-600" />
            Eventio
          </div>
          <nav className="hidden md:flex gap-8 items-center text-sm font-medium text-gray-600">
            <Link href="#features" className="hover:text-indigo-600 transition-colors">Features</Link>
            <Link href="/docs" className="hover:text-indigo-600 transition-colors">Documentation</Link>
            <a href="#footer" className="hover:text-indigo-600 transition-colors">Contact</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-2"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-white/10 pointer-events-none" />
        
        {/* Background Decorative Blobs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 leading-tight">
            Manage Events & IDs <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              With Absolute Confidence.
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-500 mb-10 leading-relaxed">
            Eventio is the all-in-one platform for generating secure educational IDs, handling event passes, managing live workspaces, and issuing bulk certificates effortlessly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/login" 
              className="w-full sm:w-auto px-8 py-4 text-base font-bold text-white bg-gray-900 hover:bg-indigo-600 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              Start for Free
            </Link>
            <Link 
              href="/docs" 
              className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-gray-700 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-full shadow-sm transition-all"
            >
              Read the Documentation
            </Link>
          </div>
        </div>
      </section>

      {/* The Problems We Solve Section */}
      <section className="py-24 bg-indigo-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Eventio?</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">We built Eventio to solve the most painful and expensive problems faced by institutions and event organizers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6">
                <FileSpreadsheet className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Certificate Nightmares</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Struggling to create and distribute certificates for hackathons, competitions, and events? Eventio automates bulk generation, turning hours of manual work into seconds.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
                <BadgeCheck className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Expensive ID Cards</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Colleges and schools spend thousands of rupees just getting basic ID cards printed. With Eventio, design and generate professional institutional IDs at a fraction of the cost.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fake Attendees</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Large offline events often struggle to filter out unregistered or fake attendees. Our secure event passes with dynamic barcodes ensure only valid participants get through the door.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need to run your event</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">From pre-event ticketing to post-event certification, Eventio provides a seamless ecosystem.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:border-indigo-100 hover:shadow-lg transition-all group">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                <BadgeCheck className="h-7 w-7 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Educational ID Cards</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Generate rigorous, standardized ID cards for K-12, UG/PG, and Faculty with automated JSON templates.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:border-purple-100 hover:shadow-lg transition-all group">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                <Ticket className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Event Passes</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Design and issue beautiful event passes for attendees, VIPs, and volunteers dynamically from your spreadsheets.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:border-pink-100 hover:shadow-lg transition-all group">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                <Users className="h-7 w-7 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Event Workspaces</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Provide attendees with a live, real-time chat space and interactive polling system active only during your event.</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:border-emerald-100 hover:shadow-lg transition-all group">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="h-7 w-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Bulk Certificates</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Upload a list of participants and let our bulk engine automatically generate and ZIP all their certificates in seconds.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Handle Events Easily Section */}
      <section className="py-24 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Handle any event with absolute ease</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">We&apos;ve simplified the entire event lifecycle into three frictionless steps so you can focus on delivering a great experience.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-xl mb-6">1</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Setup in Seconds</h3>
              <p className="text-gray-500 leading-relaxed">No complicated configurations. Just upload your attendee list as a standard Excel or CSV file and map it to your custom JSON design template.</p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-xl mb-6">2</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Live Engagement</h3>
              <p className="text-gray-500 leading-relaxed">Activate dedicated workspaces for your events. Attendees can join live chats, vote on real-time polls, and network seamlessly while the event is running.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-xl mb-6">3</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Automated Wrap-up</h3>
              <p className="text-gray-500 leading-relaxed">Instantly generate and download hundreds of certificates of participation in a single click as soon as the event concludes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-indigo-900 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <ShieldCheck className="h-16 w-16 text-indigo-300 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-6">Ready to streamline your workflow?</h2>
          <p className="text-indigo-200 mb-10 text-lg">Join thousands of organizers saving hundreds of hours on event administration.</p>
          <Link 
            href="/login" 
            className="inline-flex px-8 py-4 text-base font-bold text-indigo-900 bg-white hover:bg-gray-100 rounded-full shadow-lg transition-all"
          >
            Create Your Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="bg-gray-950 text-gray-400 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-gray-800">
            <div>
              <div className="flex items-center gap-2 font-bold text-xl text-white mb-4">
                <Fingerprint className="h-6 w-6 text-indigo-500" />
                Eventio
              </div>
              <p className="text-sm">Simplifying event operations and ID generation for teams worldwide.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="mailto:sameerbavaji63@gmail.com" className="flex items-center hover:text-white transition-colors group">
                    <span className="border-b border-transparent group-hover:border-white">Contact Customer Care</span>
                  </a>
                </li>
                <li>
                  <a href="mailto:sameerbavaji63@gmail.com" className="text-indigo-400 hover:text-indigo-300">
                    sameerbavaji63@gmail.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>&copy; {new Date().getFullYear()} Eventio Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

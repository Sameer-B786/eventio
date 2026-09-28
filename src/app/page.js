"use client";

import Link from "next/link";
import { ArrowRight, Fingerprint, CalendarPlus, BadgeCheck, FileSpreadsheet, Users, ShieldCheck, Zap, Ticket, CreditCard, LayoutDashboard } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-2xl text-gray-900 tracking-tight">
            <Fingerprint className="h-8 w-8 text-indigo-600" />
            Eventio
          </div>
          <nav className="hidden md:flex gap-8 items-center text-sm font-semibold text-gray-600">
            <Link href="#features" className="hover:text-indigo-600 transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-indigo-600 transition-colors">How it Works</Link>
            <Link href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-2"
            >
              Start Creating <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-semibold mb-8">
            <Zap className="h-4 w-4" /> The all-in-one platform for modern event organizers
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 leading-tight max-w-4xl mx-auto">
            Stop doing manual data entry. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Automate your events.
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-500 mb-10 leading-relaxed font-medium">
            Eventio instantly generates thousands of beautiful ID cards and certificates from your spreadsheets in seconds. Keep your attendees engaged with live workspaces—all in one place.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/login" 
              className="w-full sm:w-auto px-8 py-4 text-base font-bold text-white bg-gray-900 hover:bg-indigo-600 rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              Create Your First Event <ArrowRight className="h-5 w-5" />
            </Link>
            <Link 
              href="#how-it-works" 
              className="w-full sm:w-auto px-8 py-4 text-base font-bold text-gray-700 bg-white border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50 rounded-full transition-all text-center"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-12 bg-indigo-600 text-white border-y border-indigo-700">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-indigo-200 font-bold tracking-widest uppercase text-sm mb-8">Trusted By</p>
          <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-80 font-bold text-xl md:text-2xl">
            <span>🎓 Schools & Universities</span>
            <span>🏢 Corporate HR</span>
            <span>🎤 Conference Organizers</span>
            <span>🤝 Community Leaders</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-[#fafafa]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Everything you need to run your event</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">We&apos;ve built the ultimate toolkit to save you hundreds of hours before, during, and after your event.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-100 transition-all">
                <BadgeCheck className="h-7 w-7 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Bulk ID Cards & Passes</h3>
              <p className="text-gray-500 leading-relaxed">Instantly generate standard K-12, UG/PG, and Faculty ID cards or stunning event VIP passes from a single Excel file upload.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-purple-100 transition-all">
                <FileSpreadsheet className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">1-Click Certificates</h3>
              <p className="text-gray-500 leading-relaxed">Reward your attendees immediately. Upload your custom design template and let Eventio generate hundreds of PDF certificates in a `.zip` file.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-pink-100 transition-all">
                <Users className="h-7 w-7 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Live Event Workspaces</h3>
              <p className="text-gray-500 leading-relaxed">Keep your audience engaged! Every event gets a dedicated live workspace where attendees can chat, network, and vote on live polls in real-time.</p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-100 transition-all">
                <ShieldCheck className="h-7 w-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">100% Data Privacy</h3>
              <p className="text-gray-500 leading-relaxed">Your spreadsheet data never touches our servers. All document generation happens securely right inside your browser.</p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-orange-100 transition-all">
                <CreditCard className="h-7 w-7 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Pay As You Go</h3>
              <p className="text-gray-500 leading-relaxed">No expensive monthly subscriptions. Simply top up your wallet with generation credits and only pay for exactly what you use.</p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-100 transition-all">
                <LayoutDashboard className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Beautiful Dashboard</h3>
              <p className="text-gray-500 leading-relaxed">Manage multiple events simultaneously. Upload custom banners, track attendee engagement, and monitor your wallet balance with ease.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">How Eventio Works</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">We&apos;ve simplified the entire event lifecycle into three frictionless steps so you can focus on delivering a great experience.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 relative">
            <div className="hidden md:block absolute top-12 left-10 right-10 h-0.5 bg-gray-100" />
            
            <div className="flex-1 relative">
              <div className="w-24 h-24 bg-white border-4 border-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-black text-3xl mx-auto mb-6 shadow-sm relative z-10">1</div>
              <h3 className="text-2xl font-bold text-center text-gray-900 mb-3">Create & Setup</h3>
              <p className="text-gray-500 text-center leading-relaxed px-4">Create your event workspace, upload a custom banner, and share the unique workspace link with your attendees.</p>
            </div>
            
            <div className="flex-1 relative">
              <div className="w-24 h-24 bg-white border-4 border-purple-50 text-purple-600 rounded-full flex items-center justify-center font-black text-3xl mx-auto mb-6 shadow-sm relative z-10">2</div>
              <h3 className="text-2xl font-bold text-center text-gray-900 mb-3">Engage Attendees</h3>
              <p className="text-gray-500 text-center leading-relaxed px-4">During the event, attendees can join the live workspace to ask questions, chat, and vote on your live polls.</p>
            </div>

            <div className="flex-1 relative">
              <div className="w-24 h-24 bg-white border-4 border-emerald-50 text-emerald-600 rounded-full flex items-center justify-center font-black text-3xl mx-auto mb-6 shadow-sm relative z-10">3</div>
              <h3 className="text-2xl font-bold text-center text-gray-900 mb-3">Generate & Distribute</h3>
              <p className="text-gray-500 text-center leading-relaxed px-4">Upload your attendee list (Excel/CSV) and instantly download hundreds of perfectly designed PDF certificates in a single ZIP file.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section (Simple Pay as you go mention) */}
      <section id="pricing" className="py-24 bg-[#fafafa]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Honest, flexible pricing</h2>
          <p className="text-gray-500 text-lg mb-12">No monthly subscriptions. No hidden fees. Just pay for what you generate.</p>
          
          <div className="bg-white rounded-[3rem] p-12 shadow-xl border border-gray-100 max-w-2xl mx-auto">
            <CreditCard className="w-16 h-16 text-indigo-600 mx-auto mb-6" />
            <div className="text-5xl font-black text-gray-900 mb-4">₹5 <span className="text-xl text-gray-400 font-medium">/ document</span></div>
            <p className="text-gray-500 mb-8 text-lg">Top up your Wallet Credits anytime. 1 Credit = 1 Generated PDF Document (ID Card, Pass, or Certificate). Live Workspaces are absolutely free.</p>
            <Link 
              href="/login" 
              className="inline-block w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-16 mt-auto border-t-8 border-indigo-600">
        <div className="max-w-7xl mx-auto px-6 text-center md:text-left">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-12 border-b border-gray-800">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 font-bold text-2xl text-white mb-4">
                <Fingerprint className="h-7 w-7 text-indigo-500" />
                Eventio
              </div>
              <p className="text-gray-500 leading-relaxed">The ultimate automation platform for event organizers, HR teams, and educational institutions worldwide.</p>
            </div>
            <div className="md:col-start-3">
              <h4 className="text-white font-bold mb-4 text-lg">Get in Touch</h4>
              <ul className="space-y-3">
                <li>
                  <a href="mailto:sameerbavaji63@gmail.com" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                    sameerbavaji63@gmail.com
                  </a>
                </li>
                <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Create an Account</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 text-sm text-gray-600">
            <p>&copy; {new Date().getFullYear()} Eventio Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

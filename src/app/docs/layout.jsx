import Link from "next/link";
import { Book, FileText, BadgeCheck, Ticket, Users, FileSpreadsheet, Fingerprint, ArrowLeft } from "lucide-react";

export default function DocsLayout({ children }) {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      
      {/* Docs Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-500 hover:text-gray-900 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="w-px h-6 bg-gray-200" />
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-indigo-900">
              <Fingerprint className="h-6 w-6 text-indigo-600" />
              Eventio Docs
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              Go to Dashboard &rarr;
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full px-6 flex flex-col md:flex-row">
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 py-8 pr-8 border-r hidden md:block">
          <nav className="space-y-8 text-sm">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Book className="h-4 w-4" /> Getting Started
              </h3>
              <ul className="space-y-2 border-l ml-2 pl-4 border-gray-200 text-gray-600">
                <li><a href="#intro" className="hover:text-indigo-600 transition-colors">Introduction</a></li>
                <li><a href="#quickstart" className="hover:text-indigo-600 transition-colors">Quickstart</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" /> Platform Features
              </h3>
              <ul className="space-y-2 border-l ml-2 pl-4 border-gray-200 text-gray-600">
                <li><a href="#educational-ids" className="hover:text-indigo-600 transition-colors">Educational ID Cards</a></li>
                <li><a href="#event-passes" className="hover:text-indigo-600 transition-colors">Event Passes</a></li>
                <li><a href="#event-workspaces" className="hover:text-indigo-600 transition-colors">Event Workspaces</a></li>
                <li><a href="#bulk-certificates" className="hover:text-indigo-600 transition-colors">Bulk Certificates</a></li>
              </ul>
            </div>
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 py-8 md:pl-12 prose prose-indigo max-w-3xl">
          {children}
        </main>
      </div>
    </div>
  );
}

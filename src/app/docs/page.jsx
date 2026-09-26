import { BadgeCheck, Ticket, Users, FileSpreadsheet } from "lucide-react";

export const metadata = {
  title: "Documentation - Eventio",
  description: "Learn how to use the Eventio platform.",
};

export default function DocsPage() {
  return (
    <div className="space-y-16 pb-20">
      
      {/* Intro */}
      <section id="intro">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">Eventio Documentation</h1>
        <p className="text-xl text-gray-500 mb-8 leading-relaxed">
          Welcome to the official documentation for Eventio. This guide will walk you through how to use each of our core features to streamline your event and ID generation operations.
        </p>
        <hr className="my-8" />
      </section>

      {/* Quickstart */}
      <section id="quickstart">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quickstart</h2>
        <p className="text-gray-600 mb-4">
          Getting started with Eventio is simple. Once you log in, you will land on your main Dashboard. From there, you can select which type of asset you want to generate:
        </p>
        <ol className="list-decimal pl-5 space-y-2 text-gray-600">
          <li>Choose your feature from the main wizard or the left sidebar.</li>
          <li>Upload your participant data using a standard CSV or Excel file.</li>
          <li>Upload your JSON design template (or use our built-in generic styles).</li>
          <li>Preview your generated assets in real-time.</li>
          <li>Click generate to download your bulk package or activate your workspace!</li>
        </ol>
      </section>

      <hr className="my-12 border-gray-100" />

      {/* Educational IDs */}
      <section id="educational-ids">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-700"><BadgeCheck className="h-6 w-6" /></div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Educational ID Cards</h2>
        </div>
        <p className="text-gray-600 mb-4">
          The Educational ID Card generator is built with strict validation schemas for K-12, Undergraduate/Postgraduate, and Faculty & Staff.
        </p>
        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">How to use it:</h3>
        <ul className="list-disc pl-5 space-y-2 text-gray-600">
          <li>Navigate to <strong>Educational ID Cards</strong> from the sidebar.</li>
          <li>Select the specific audience (e.g., K-12 Students) to enforce the correct data validation.</li>
          <li>In the setup panel on the left, upload an Excel file containing columns like Name, Grade, Roll Number, etc.</li>
          <li>Upload your custom JSON layout template.</li>
          <li>Review the live preview on the right to ensure the text maps correctly to your design.</li>
          <li>Click generate to produce your batch of ID cards.</li>
        </ul>
      </section>

      <hr className="my-12 border-gray-100" />

      {/* Event Passes */}
      <section id="event-passes">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg text-purple-700"><Ticket className="h-6 w-6" /></div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Event Passes</h2>
        </div>
        <p className="text-gray-600 mb-4">
          Generate beautiful, print-ready passes for your event attendees, VIPs, and volunteers.
        </p>
        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">How to use it:</h3>
        <ul className="list-disc pl-5 space-y-2 text-gray-600">
          <li>Navigate to <strong>Event Passes</strong> from the dashboard.</li>
          <li>Upload your attendee spreadsheet (CSV/XLSX).</li>
          <li>Upload the JSON design template representing the physical pass layout.</li>
          <li>Ensure the preview correctly maps names, ticket types (VIP/General), and QR code placeholders.</li>
          <li>Generate the final print-ready batch.</li>
        </ul>
      </section>

      <hr className="my-12 border-gray-100" />

      {/* Event Workspaces */}
      <section id="event-workspaces">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-pink-100 rounded-lg text-pink-700"><Users className="h-6 w-6" /></div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Event Workspaces</h2>
        </div>
        <p className="text-gray-600 mb-4">
          Event Workspaces provide a temporary, real-time hub for your attendees to interact via chat and polls while the event is live.
        </p>
        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">How to use it:</h3>
        <ul className="list-disc pl-5 space-y-2 text-gray-600">
          <li>Click on <strong>Event Workspaces</strong> (or Create Event) on the dashboard.</li>
          <li>Fill in the event details including Name, Description, Banner Image URL, Host, and strict Start/End times.</li>
          <li>Once created, the workspace will appear in your <strong>Your Event Workspaces</strong> list on the dashboard homepage.</li>
          <li>Click the workspace card to enter it. If the current time is between the Start and End time, the workspace will be <strong>Active</strong>.</li>
          <li>Attendees can send messages (with auto-expanding text areas) and vote on real-time polls.</li>
          <li>Once the end time passes, the workspace automatically closes and becomes read-only.</li>
        </ul>
      </section>

      <hr className="my-12 border-gray-100" />

      {/* Bulk Certificates */}
      <section id="bulk-certificates">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700"><FileSpreadsheet className="h-6 w-6" /></div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Bulk Certificates</h2>
        </div>
        <p className="text-gray-600 mb-4">
          Automatically generate certificates of participation or achievement for hundreds of users at once, and download them neatly packaged in a ZIP file.
        </p>
        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">How to use it:</h3>
        <ul className="list-disc pl-5 space-y-2 text-gray-600">
          <li>Navigate to <strong>Bulk Certificates</strong>.</li>
          <li>Upload your participant CSV/Excel data containing columns like "Name" and "Team".</li>
          <li>Upload your JSON template representing the certificate design.</li>
          <li>Check the Live Preview on the right panel to ensure the name renders correctly on the certificate design.</li>
          <li>Click <strong>Generate ZIP</strong>. The platform will process every row and automatically download a compressed `.zip` file containing all individual certificates!</li>
        </ul>
      </section>

    </div>
  );
}

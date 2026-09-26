import { EventioSidebar } from '@/components/layout/IdgenSidebar';
import { EventioTopbar } from '@/components/layout/IdgenTopbar';
import { getSession } from "@/lib/session";

export default async function EventioLayout({ children }) {
  const session = await getSession();
  const userName = session?.userInfo?.name || session?.userInfo?.email?.split('@')[0] || "User";

  return (
    <div className="flex h-screen bg-[#F3F4F6] p-4 gap-4 overflow-hidden">
      <EventioSidebar userName={userName} />
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* <EventioTopbar userName={userName} /> */}
        <main className="flex-1 p-8 overflow-auto rounded-2xl bg-white shadow-sm border border-gray-100 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {children}
        </main>
      </div>
    </div>
  );
}

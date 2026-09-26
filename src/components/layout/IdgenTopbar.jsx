"use client";

import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { EventioSidebar } from './IdgenSidebar';
import { usePathname } from 'next/navigation';

export function EventioTopbar({ userName = "admin" }) {
  const pathname = usePathname();
  if (pathname === '/idgen') return null;

  return (
    <header className="flex h-16 items-center justify-between px-4 md:px-8 bg-white/50 backdrop-blur-sm z-10 rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex-shrink-0">
      <div className="flex items-center gap-4 flex-1">
        <Sheet>
          <SheetTrigger className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700">
            <Menu className="h-6 w-6" />
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <div className="flex w-full h-full">
              <EventioSidebar userName={userName} className="w-full flex md:flex border-r-0" />
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="hidden md:block text-sm">
            <p className="font-medium text-gray-900 leading-none capitalize">{userName}</p>
            <p className="text-xs text-gray-500 mt-1">admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}

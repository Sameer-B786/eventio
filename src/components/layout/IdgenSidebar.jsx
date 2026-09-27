"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Ticket, BadgeCheck, LogOut, ArrowLeft, Fingerprint, CalendarPlus, Users, FileSpreadsheet, ChevronDown, ChevronRight, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function EventioSidebar({ userName = "admin" }) {
  const [openMenu, setOpenMenu] = useState({});
  const pathname = usePathname();

  const navigation = [
    { name: 'Home', href: '/idgen', icon: Home },
    { name: 'Create Event', href: '/idgen/events/new', icon: CalendarPlus },

    { name: 'Bulk Certificates', href: '/idgen/certificates', icon: FileSpreadsheet, premium: true },
    { name: 'Event Passes', href: '/idgen/event-pass', icon: Ticket, premium: true },
    { 
      name: 'Educational ID Cards', 
      icon: BadgeCheck,
      premium: true,
      children: [
        { name: 'K-12 Students', href: '/idgen/id-card?schema=k12' },
        { name: 'UG / PG Students', href: '/idgen/id-card?schema=ugpg' },
        { name: 'Faculty & Staff', href: '/idgen/id-card?schema=faculty' },
      ]
    },
  ];

  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  if (pathname === '/idgen') return null;

  return (
    <div className="hidden md:flex flex-col w-64 bg-white h-[calc(100vh-2rem)] rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex-shrink-0">
      <div className="flex items-center h-16 px-6 font-bold text-xl text-black gap-2">
        <Fingerprint className="h-6 w-6 text-black" />
        Eventio
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navigation.map((item) => {
          if (item.children) {
            const isChildActive = item.children.some(child => pathname === child.href.split('?')[0]);
            
            // If the user hasn't explicitly toggled this menu, default to open if a child is active
            const isOpen = openMenu[item.name] !== undefined 
              ? openMenu[item.name] 
              : isChildActive;

            const toggleMenu = () => {
              setOpenMenu(prev => ({ ...prev, [item.name]: !isOpen }));
            };

            return (
              <div key={item.name} className="flex flex-col">
                <button
                  onClick={toggleMenu}
                  className={cn(
                    'flex items-center justify-between px-4 py-3 text-sm font-medium rounded-full transition-colors w-full',
                    isChildActive
                      ? 'bg-purple-50 text-purple-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <div className="flex items-center">
                    <item.icon className={cn("mr-3 h-5 w-5", isChildActive ? "text-purple-600" : "text-gray-400")} />
                    {item.name}
                    {item.premium && <Crown className="ml-2 h-3.5 w-3.5 text-amber-500" />}
                  </div>
                  {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                
                {isOpen && (
                  <div className="mt-1 ml-4 border-l-2 border-gray-100 pl-4 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className="block px-4 py-2 text-sm text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          const isActive = pathname === item.href || pathname.startsWith(item.href + '?');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-4 py-3 text-sm font-medium rounded-full transition-colors',
                isActive
                  ? 'bg-purple-50 text-purple-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <div className="flex items-center">
                <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-purple-600" : "text-gray-400")} />
                {item.name}
                {item.premium && <Crown className="ml-2 h-3.5 w-3.5 text-amber-500" />}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl mb-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate capitalize">{userName}</p>
            <p className="text-xs text-gray-500 truncate">admin</p>
          </div>
        </div>
        <button onClick={handleLogout} className="flex w-full items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
          <LogOut className="mr-3 h-5 w-5 text-gray-400" />
          Logout
        </button>
      </div>
    </div>
  );
}

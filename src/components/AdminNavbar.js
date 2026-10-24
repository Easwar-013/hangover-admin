'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Package, Flame, Store, Tag, MessageSquare, ExternalLink, LogOut, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const LINKS = [
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Trending', href: '/admin/trending', icon: Flame },
  { label: 'Orders', href: '/admin/orders', icon: Store },
  { label: 'Coupons', href: '/admin/coupons', icon: Tag },
  { label: 'Messages', href: '/admin/messages', icon: MessageSquare },
];

export default function AdminNavbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const storefront = process.env.NEXT_PUBLIC_STOREFRONT_URL || '';

  useEffect(() => setOpen(false), [pathname]);

  if (pathname.startsWith('/login')) return null;

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={() => setOpen(!open)}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-900 rounded-xl md:hidden"
            aria-label="Toggle navigation menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/admin/products" className="flex items-center space-x-2 group">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-gray-200 shadow-sm shrink-0">
              <img src="/hangover.jpeg" alt="HangOver Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-tight text-gray-900">HangOver</span>
          </Link>

          <span className="bg-orange-100 text-orange-700 text-[10px] font-extrabold uppercase px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md tracking-wider border border-orange-200 shadow-sm">
            Admin Panel
          </span>
        </div>

        <div className="hidden md:flex items-center space-x-7 text-sm font-semibold text-gray-600 h-full">
          {LINKS.map(({ label, href, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center space-x-1.5 h-full transition-colors ${
                  active ? 'text-orange-500 font-bold' : 'hover:text-orange-500'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
                <span
                  className={`absolute bottom-0 left-0 h-0.5 w-full bg-orange-500 rounded-t-full transition-all ${
                    active ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </Link>
            );
          })}

          {storefront && (
            <a
              href={storefront}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1 text-gray-500 hover:text-orange-500 text-xs font-bold bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 my-auto"
            >
              <span>View Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {session && (
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center space-x-1.5 text-red-600 hover:bg-red-50 px-3 py-2 rounded-xl text-xs font-bold transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {LINKS.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-sm font-bold ${
                pathname.startsWith(href) ? 'bg-orange-50 text-orange-500' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </Link>
          ))}
          {storefront && (
            <a
              href={storefront}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3.5 py-2.5 mt-2 rounded-xl text-xs font-bold text-gray-600 bg-gray-50 border border-gray-200"
            >
              <span>View Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}
    </nav>
  );
}

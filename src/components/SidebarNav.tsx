'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const SidebarNav: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const userNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/tasks', label: 'Tasks', icon: '✅' },
    { href: '/resources', label: 'Resources', icon: '📚' },
    { href: '/feedback', label: 'Feedback', icon: '💬' },
    // { href: '/profile', label: 'Profile', icon: '👤' },
  ];

  const adminNavItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/admin/employees', label: 'Employees', icon: '👥' },
    { href: '/admin/tasks', label: 'Tasks', icon: '📋' },
    { href: '/admin/resources', label: 'Resources', icon: '📁' },
    { href: '/admin/feedback', label: 'Feedback', icon: '📝' },
    // { href: '/admin/profile', label: 'Profile', icon: '👤' },
  ];

  const navItems = user?.role === 'admin' ? adminNavItems : userNavItems;

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg glass-card text-text-primary"
      >
        <span className="text-xl">☰</span>
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 glass-card transform transition-transform duration-300 z-40 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0`}
      >
        <div className="p-6">
          {/* Logo */}
          <div className="mb-6 flex flex-col items-center">
            <div className="w-32 h-auto mb-1">
              <Image
                src="/Edunutshell logo.jpeg"
                alt="Edunutshell Logo"
                width={128}
                height={64}
                className="w-full h-auto object-contain"
                priority
              />
            </div>
            <p className="text-text-secondary text-sm text-center leading-tight">Employee Onboarding</p>
          </div>

          {/* User Info */}
          <div className="mb-8 p-4 rounded-lg bg-secondary/30">
            <Link
              href={user?.role === 'admin' ? '/admin/profile' : '/profile'}
              className={`flex items-center space-x-3 cursor-pointer rounded-lg p-2 -m-2 transition-colors group ${isActive(user?.role === 'admin' ? '/admin/profile' : '/profile')
                  ? 'bg-accent/20 border border-accent/30'
                  : 'hover:bg-secondary/50'
                }`}
              onClick={() => setIsOpen(false)}
            >
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="text-white font-semibold">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="leading-tight">
                <p className="text-text-primary font-medium leading-none mb-1">{user?.name}</p>
                <p className="text-text-muted text-sm capitalize leading-none">{user?.role}</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${isActive(item.href)
                  ? 'bg-accent text-white shadow-lg'
                  : 'text-text-secondary hover:bg-secondary/50 hover:text-text-primary hover:translate-x-1'
                  }`}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                <span className="font-medium leading-none">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="absolute bottom-6 left-6 right-6">
            <button
              onClick={logout}
              className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-text-secondary hover:bg-danger/20 hover:text-danger transition-all duration-200 hover:translate-x-1"
            >
              <span className="text-lg flex-shrink-0">🚪</span>
              <span className="font-medium leading-none">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SidebarNav;
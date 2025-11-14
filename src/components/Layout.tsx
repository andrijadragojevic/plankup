import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { FaHome, FaHistory, FaChartBar, FaCog, FaWifi } from 'react-icons/fa';
import { useUser } from '../contexts/UserContext';

export const Layout: React.FC = () => {
  const { isOnline } = useUser();

  const navItems = [
    { to: '/dashboard', icon: FaHome, label: 'Dashboard' },
    { to: '/history', icon: FaHistory, label: 'History' },
    { to: '/stats', icon: FaChartBar, label: 'Stats' },
    { to: '/settings', icon: FaCog, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Offline Indicator */}
      {!isOnline && (
        <div className="bg-yellow-500 dark:bg-yellow-600 text-white px-4 py-2 text-center text-sm font-semibold flex items-center justify-center gap-2">
          <FaWifi className="opacity-50" />
          You are offline. Changes will sync when reconnected.
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-8">
        <Outlet />
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-lg md:hidden z-40">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-400'
                }`
              }
              aria-label={item.label}
            >
              {({ isActive }) => (
                <>
                  <item.icon className="text-2xl mb-1" />
                  <span className={`text-xs font-medium ${isActive ? 'font-bold' : ''}`}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Side Navigation (Desktop) */}
      <nav className="hidden md:block fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-lg z-40">
        <div className="p-6">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600 mb-8">
            PlankUP
          </h1>

          <div className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`
                }
                aria-label={item.label}
              >
                <item.icon className="text-xl" />
                <span className="font-semibold">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Spacer for desktop sidebar */}
      <div className="hidden md:block w-64 flex-shrink-0"></div>
    </div>
  );
};

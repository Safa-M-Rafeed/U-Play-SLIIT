import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  LogOutIcon,
  ZapIcon } from
'lucide-react';
import { useAuth } from '../../context/AuthContext';
export function Sidebar({
  items,
  userRole,
  userName,
  userAvatar
}) {
  const safeUserName = userName || 'User';
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const sidebarContent =
  <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
          <ZapIcon className="w-5 h-5 text-white" />
        </div>
        {!collapsed &&
      <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              U-PLAY
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">
              Sports Platform
            </p>
          </div>
      }
      </div>

      {/* Navigation */}
      <nav
      className="flex-1 px-3 py-4 space-y-1 overflow-y-auto"
      aria-label="Main navigation">
      
        {items.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200
                ${isActive ? 'bg-blue-600/15 text-blue-400 shadow-sm shadow-blue-500/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}
                ${collapsed ? 'justify-center' : ''}
              `}
            aria-current={isActive ? 'page' : undefined}>
            
              <span
              className={`flex-shrink-0 ${isActive ? 'text-blue-400' : ''}`}>
              
                {item.icon}
              </span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );

      })}
      </nav>

      {/* User Info */}
      <div className="px-3 py-4 border-t border-white/5">
        <div
        className={`flex items-center gap-3 px-3 py-2 ${collapsed ? 'justify-center' : ''}`}>
        
          {userAvatar ?
        <img
          src={userAvatar}
          alt=""
          className="w-8 h-8 rounded-full flex-shrink-0 object-cover" /> :


        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
              {safeUserName.charAt(0).toUpperCase()}
            </div>
        }
          {!collapsed &&
        <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {safeUserName}
              </p>
              <p className="text-xs text-slate-500 capitalize">{userRole}</p>
            </div>
        }
          {!collapsed &&
        <button
          onClick={handleLogout}
          className="text-slate-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
          aria-label="Log out">
          
              <LogOutIcon className="w-4 h-4" />
            </button>
        }
        </div>
      </div>

      {/* Collapse Toggle (desktop) */}
      <button
      onClick={() => setCollapsed(!collapsed)}
      className="hidden lg:flex items-center justify-center py-3 border-t border-white/5 text-slate-500 hover:text-white transition-colors"
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
      
        {collapsed ?
      <ChevronRightIcon className="w-4 h-4" /> :

      <ChevronLeftIcon className="w-4 h-4" />
      }
      </button>
    </div>;

  return (
    <>
      {/* Mobile Hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-surface/80 backdrop-blur-xl border border-white/10 text-white"
        aria-label="Open navigation">
        
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor">
          
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16" />
          
        </svg>
      </button>

      {/* Mobile Overlay */}
      {mobileOpen &&
      <div
        className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={() => setMobileOpen(false)}
        aria-hidden="true" />

      }

      {/* Mobile Sidebar */}
      <aside
        className={`
          lg:hidden fixed inset-y-0 left-0 z-50 w-64
          bg-surface/95 backdrop-blur-xl border-r border-white/10
          transform transition-transform duration-300 ease-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        aria-label="Navigation sidebar">
        
        {sidebarContent}
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden lg:flex flex-col fixed inset-y-0 left-0 z-30
          bg-surface/80 backdrop-blur-xl border-r border-white/10
          transition-all duration-300
          ${collapsed ? 'w-[72px]' : 'w-64'}
        `}
        aria-label="Navigation sidebar">
        
        {sidebarContent}
      </aside>
    </>
  );
}

import React, { useState } from 'react';
import { SearchIcon, BellIcon, ChevronDownIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
export function Navbar({
  title,
  showSearch = true,
  userName,
  userAvatar
}) {
  const safeUserName = userName || 'User';
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  return (
    <header className="sticky top-0 z-20 bg-navy/50 backdrop-blur-xl border-b border-white/5">
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        {/* Left: Title */}
        <div className="flex items-center gap-4">
          {/* Spacer for mobile hamburger */}
          <div className="w-8 lg:hidden" />
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>

        {/* Center: Search */}
        {showSearch &&
        <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <SearchIcon
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
              aria-hidden="true" />
            
              <input
              type="search"
              placeholder="Search tournaments, teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30 transition-all duration-200"
              aria-label="Search" />
            
            </div>
          </div>
        }

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200"
            aria-label="Notifications">
            
            <BellIcon className="w-5 h-5" />
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full"
              aria-hidden="true" />
            
          </button>

          {/* User */}
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-xl hover:bg-white/5 transition-all duration-200"
            aria-label="Open profile">
            {userAvatar ?
            <img
              src={userAvatar}
              alt=""
              className="w-7 h-7 rounded-full object-cover" /> :


            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                {safeUserName.charAt(0).toUpperCase()}
              </div>
            }
            <span className="hidden sm:block text-sm font-medium text-slate-300">
              {safeUserName}
            </span>
            <ChevronDownIcon
              className="w-3.5 h-3.5 text-slate-500"
              aria-hidden="true" />
            
          </button>
        </div>
      </div>
    </header>
  );
}

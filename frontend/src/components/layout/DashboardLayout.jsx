import React from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
export function DashboardLayout({
  children,
  sidebarItems,
  userRole,
  userName,
  pageTitle,
  userAvatar,
  showSearch = true
}) {
  return (
    <div className="min-h-screen bg-navy">
      <Sidebar
        items={sidebarItems}
        userRole={userRole}
        userName={userName}
        userAvatar={userAvatar} />
      

      {/* Main content area — offset for sidebar on desktop */}
      <div className="lg:pl-64 min-h-screen flex flex-col">
        <Navbar
          title={pageTitle}
          showSearch={showSearch}
          userName={userName}
          userAvatar={userAvatar} />
        

        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

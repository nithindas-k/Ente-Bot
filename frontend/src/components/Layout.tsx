import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { useLocation } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const hideLayout = location.pathname === "/login";

  // Auto-close sidebar on route change for mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  if (hideLayout) {
    return <main className="w-full h-full bg-neutral-950 font-sans">{children}</main>;
  }

  return (
    <div className="flex h-screen bg-neutral-950 font-sans text-neutral-100 overflow-hidden">
      {/* Sidebar Controlled by Layout */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 relative flex flex-col min-w-0 overflow-hidden">
        {/* Sticky Mobile Navbar (Logo + Trigger) */}
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Content Container (Scrollable) */}
        <main className="flex-1 relative z-10 w-full h-full overflow-y-auto custom-scrollbar">
            <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
                {children}
            </div>
        </main>
      </div>
    </div>
  );
}

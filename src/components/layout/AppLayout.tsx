import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { RealtimeSync } from "./RealtimeSync";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export const AppLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="min-h-screen bg-surface font-sans text-copy antialiased selection:bg-primary selection:text-white">
      <RealtimeSync />
      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex min-h-screen flex-col transition-all lg:ml-64 min-w-0">
        <Topbar onToggleMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        <main className="flex-1 w-full min-w-0 px-3 sm:px-6 lg:px-8 xl:px-[50px] py-4 sm:py-6 max-w-[1800px] mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Camera,
  UtensilsCrossed,
  ChefHat,
  CalendarDays,
  Sparkles,
  Settings,
  LogOut,
  User as UserIcon,
  Leaf
} from "lucide-react";
import { ApiClient } from "@/lib/api";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Scan Food", href: "/scan", icon: Camera },
  { label: "Available Food", href: "/available-food", icon: ChefHat },
  { label: "Food Database", href: "/foods", icon: UtensilsCrossed },
  { label: "Daily Tracker", href: "/tracker", icon: CalendarDays },
  { label: "AI Coach", href: "/assistant", icon: Sparkles },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Navigation({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check user session
    ApiClient.getMe()
      .then((data) => setUser(data))
      .catch(() => {
        // Fallback to demo login if on app route
        if (pathname !== "/" && !pathname.startsWith("/auth")) {
          ApiClient.demoLogin()
            .then((res) => setUser(res.user))
            .catch(() => {});
        }
      })
      .finally(() => setLoading(false));
  }, [pathname]);

  const handleLogout = () => {
    ApiClient.clearToken();
    router.push("/");
  };

  const isPublicPage = pathname === "/" || pathname.startsWith("/auth");

  if (isPublicPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#F7FAFC] flex flex-col md:flex-row text-[#20312F]">
      {/* Desktop Sidebar Navigation Rail */}
      <aside className="hidden md:flex flex-col w-64 border-r border-[#E2ECEB] bg-white z-20 shrink-0 h-screen sticky top-0">
        {/* Brand Header */}
        <div className="p-6 border-b border-[#EDF3F3] flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#42BFA5] to-[#177E75] flex items-center justify-center text-white shadow-sm">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-[#177E75]">NutriVision</span>
              <span className="block text-[10px] uppercase tracking-wider text-[#8E9F9D] font-medium">Personal Nutrition</span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#E9F8F3] text-[#177E75] font-semibold card-shadow"
                    : "text-[#5A6D6B] hover:bg-[#F7FAFC] hover:text-[#20312F]"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-[#42BFA5]" : "text-[#8E9F9D]"}`} />
                <span>{item.label}</span>
                {item.label === "Available Food" && (
                  <span className="ml-auto text-[10px] bg-[#42BFA5] text-white font-bold px-1.5 py-0.5 rounded-full">
                    NEW
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-[#EDF3F3]">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-[#F7FAFC] mb-2 border border-[#E2ECEB]">
            <div className="w-9 h-9 rounded-full bg-[#E9F8F3] border border-[#42BFA5] flex items-center justify-center text-[#177E75] font-semibold text-sm">
              {user?.full_name ? user.full_name[0] : <UserIcon className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#20312F] truncate">
                {user?.full_name || "Aarav Sharma"}
              </p>
              <p className="text-[11px] text-[#8E9F9D] truncate">
                {user?.is_demo ? "Demo Profile" : user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-[#C94B53] hover:bg-[#FFF0F1] rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 pb-20 md:pb-8 flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#E2ECEB] px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#42BFA5] to-[#177E75] flex items-center justify-center text-white">
              <Leaf className="w-4 h-4" />
            </div>
            <span className="font-bold text-base text-[#177E75]">NutriVision</span>
          </Link>
          <Link
            href="/settings"
            className="w-8 h-8 rounded-full bg-[#E9F8F3] flex items-center justify-center text-[#177E75] text-xs font-bold border border-[#42BFA5]"
          >
            {user?.full_name ? user.full_name[0] : "U"}
          </Link>
        </header>

        {/* Page Content */}
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E2ECEB] px-2 py-1.5 flex justify-around items-center shadow-lg">
        {[
          { label: "Home", href: "/dashboard", icon: LayoutDashboard },
          { label: "Scan", href: "/scan", icon: Camera },
          { label: "Pantry", href: "/available-food", icon: ChefHat },
          { label: "Tracker", href: "/tracker", icon: CalendarDays },
          { label: "Coach", href: "/assistant", icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
                isActive ? "text-[#177E75] font-semibold" : "text-[#8E9F9D]"
              }`}
            >
              <div
                className={`p-1 rounded-lg ${
                  isActive ? "bg-[#E9F8F3] text-[#42BFA5]" : ""
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5">{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

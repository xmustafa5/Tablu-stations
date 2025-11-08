"use client";

import { usePathname } from "next/navigation";
import { SidebarNavigation } from "./sidebar-navigation";

interface AppLayoutProps {
  children: React.ReactNode;
}

// Pages that should not show the sidebar
const NO_SIDEBAR_PAGES = ["/login", "/register"];

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const showSidebar = !NO_SIDEBAR_PAGES.includes(pathname);

  if (!showSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <SidebarNavigation />
      <main className=" transition-all duration-300">
        {children}
      </main>
    </div>
  );
}

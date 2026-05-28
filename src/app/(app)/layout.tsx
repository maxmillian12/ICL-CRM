"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { AuthProvider } from "@/lib/auth-context";
import { AppGuard } from "@/components/auth/AppGuard";
import { SWRProvider } from "@/lib/swr-config";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SWRProvider>
        <AppGuard>
          <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 lg:ml-60 transition-all duration-300">
              <Topbar />
              <main className="flex-1 overflow-y-auto">
                {children}
              </main>
            </div>
          </div>
        </AppGuard>
      </SWRProvider>
    </AuthProvider>
  );
}

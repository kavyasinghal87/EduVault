"use client";

import Sidebar from "@/components/Sidebar";
import { AuthProvider } from "@/lib/AuthContext";

interface DashboardShellProps {
  children: React.ReactNode;
  userName: string;
  userEmail: string;
}

export default function DashboardShell({
  children,
  userName,
  userEmail,
}: DashboardShellProps) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar userName={userName} userEmail={userEmail} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </AuthProvider>
  );
}

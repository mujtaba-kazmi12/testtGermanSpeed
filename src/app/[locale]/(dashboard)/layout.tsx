"use client";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 py-6">
        {children}
      </main>
    </div>
  );
} 
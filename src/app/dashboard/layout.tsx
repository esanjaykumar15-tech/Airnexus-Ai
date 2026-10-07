import { Sidebar } from "@/components/Sidebar";
import { LocationProvider } from "@/lib/locationContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <LocationProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </LocationProvider>
  );
}

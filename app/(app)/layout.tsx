// app/(app)/layout.tsx
import { AppProvider } from "@/context/AppContext";
import BottomNav from "@/components/layout/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <div className="flex flex-col min-h-screen bg-gray-50 max-w-[430px] mx-auto relative">
        {/* Conteúdo principal com espaço para o bottom nav */}
        <main className="flex-1 pb-16">
          {children}
        </main>

        {/* Bottom Navigation fixo */}
        <BottomNav />
      </div>
    </AppProvider>
  );
}
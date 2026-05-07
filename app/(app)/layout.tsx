// app/(app)/layout.tsx
import { AppProvider } from "@/context/AppContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <div className="flex flex-col min-h-screen bg-[#E2E4EC] max-w-[430px] mx-auto relative">
        {/* Conteúdo principal com espaço para o bottom nav */}
        <main className="flex-1">
          {children}
        </main>

        
        
      </div>
    </AppProvider>
  );
}
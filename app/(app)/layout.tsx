// app/(app)/layout.tsx
import { AppProvider } from "@/context/AppContext";
import OnboardingGuard from "@/components/OnboardingGuard";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <div className="flex flex-col h-screen bg-[#E2E4EC] max-w-[430px] mx-auto relative overflow-hidden">
        <main className="flex-1 flex flex-col overflow-hidden">
          <OnboardingGuard>
            {children}
          </OnboardingGuard>
        </main>
      </div>
    </AppProvider>
  );
}
